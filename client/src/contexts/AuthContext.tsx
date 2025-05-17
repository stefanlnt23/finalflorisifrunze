import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation, useRoute } from 'wouter';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
} | null;

type AuthContextType = {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const [isOnLoginPage] = useRoute('/admin/login');

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setUser(null);
        return;
      }
      
      const response = await fetch('/api/admin/validate-session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok && response.json) {
        const data = await response.json();
        
        if (data.valid) {
          // If session is valid, we need to get user details
          // This would ideally be combined in a single endpoint
          // For now, just set a minimal user object
          const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
          if (storedUser) {
            setUser(storedUser);
          }
        } else {
          setUser(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Attempting login with email: ${email}`);

      // Determine if input is email or username
      const isEmail = email.includes('@');
      
      // Build request payload based on whether input appears to be an email
      const payload: {
        email?: string;
        username?: string;
        password: string;
      } = {
        password
      };
      
      if (isEmail) {
        payload.email = email;
      } else {
        payload.username = email;
      }
      
      console.log('Login payload:', payload);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log(`Login response status: ${response.status}`);
      
      const responseData = await response.json();
      
      if (response.ok) {
        console.log('Login successful response:', responseData);
        
        if (responseData.success && responseData.token) {
          // Store token in localStorage
          localStorage.setItem('authToken', responseData.token);
          
          // Store user data
          if (responseData.user) {
            const userData = {
              id: responseData.user.id,
              name: responseData.user.name,
              email: responseData.user.email,
              role: responseData.user.role || 'user'
            };
            
            setUser(userData);
            
            // Also store in localStorage for persistence
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('User data stored in localStorage');
          }
          
          navigate('/admin/dashboard');
        } else {
          console.error('Login response missing success or token:', responseData);
          setError('Login failed. Invalid response from server.');
        }
      } else {
        console.error('Login error response:', responseData);
        setError(responseData.message || 'Failed to login');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Attempting to register with email: ${email}`);
      
      // Create a unique username from the email (everything before the @)
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      console.log(`Generated username: ${username}`);

      const registerResponse = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          username, // Use a unique username instead of email directly
          password, 
          role: 'user' 
        }),
      });

      console.log(`Registration response status: ${registerResponse.status}`);
      
      const data = await registerResponse.json();
      console.log('Registration response:', data);
      
      if (registerResponse.ok) {
        if (data.success) {
          console.log('Registration successful. Attempting login with new credentials.');
          
          // On successful registration, attempt login with the registered credentials
          await login(email, password);
        } else {
          console.error('Registration failed:', data.message);
          setError(data.message || 'Failed to register');
        }
      } else {
        console.error('Registration error response:', data);
        setError(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since we're using token-based auth with localStorage

  // Debug helper functions
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore - Add to window for debugging
      window.authDebug = {
        getState: () => ({ user, isAuthenticated, loading, error }),
        clearAuth: () => {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          console.log('Auth state cleared');
        },
        getToken: () => localStorage.getItem('authToken'),
        testEndpoint: async (endpoint: string, method = 'GET', body = null) => {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(endpoint, {
              method,
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              ...(body ? { body: JSON.stringify(body) } : {})
            });
            
            console.log('Response status:', response.status);
            try {
              const data = await response.json();
              console.log('Response data:', data);
              return data;
            } catch (e) {
              console.log('Response is not JSON:', await response.text());
            }
          } catch (error) {
            console.error('Test request failed:', error);
          }
        }
      };
      console.log('Auth debug helpers available at window.authDebug');
    }
  }, [user, isAuthenticated, loading, error]);

      // We just need to clear the token and user data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/admin/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};