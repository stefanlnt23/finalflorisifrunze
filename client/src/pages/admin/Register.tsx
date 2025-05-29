
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function AdminRegister() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Registration state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if registration is enabled
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        console.log('Checking admin registration status...');
        const response = await fetch('/api/admin/register-status');
        console.log('Registration status response:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('Registration status data:', data);
        
        setRegistrationEnabled(data.adminregister);
        console.log('Registration enabled:', data.adminregister);
      } catch (error) {
        console.error('Error checking registration status:', error);
        setRegistrationEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting registration for:', { name, email, username });
      
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, username, password }),
      });

      console.log('Registration response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('Registration response data:', data);

      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        navigate('/admin/login');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Registration failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
          <span>Checking registration status...</span>
        </div>
      </div>
    );
  }

  if (!registrationEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Registration Disabled</CardTitle>
            <CardDescription className="text-center">
              Admin registration is currently disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              If you need to register a new admin, please enable admin registration in the database first.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/admin/login')} 
              className="w-full"
              variant="outline"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Register Admin</CardTitle>
          <CardDescription className="text-center">
            Create a new admin account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Choose a username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Registering...
                </>
              ) : (
                'Register Admin'
              )}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate('/admin/login')} 
              className="w-full"
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
