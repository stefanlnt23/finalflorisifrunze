import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper functions for authentication and API base URL
const getApiBaseUrl = (): string => {
  return window.location.origin;
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API error (${res.status}):`, errorText);
    try {
      // Try to parse as JSON for a more detailed error
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || `HTTP error ${res.status}`);
    } catch (e) {
      // If parsing fails, throw with the raw text
      throw new Error(errorText || `HTTP error ${res.status}`);
    }
  }
}

// Generic API request function
export const apiRequest = async (method: string | undefined, endpoint: string, data?: any) => {
  const url = endpoint.startsWith('http') ? endpoint : `${getApiBaseUrl()}${endpoint}`;
  const requestMethod = method || "GET";
  console.log(`Making ${requestMethod} request to ${endpoint} ${data ? JSON.stringify(data) : ''}`);

  try {
    // Create the request with proper headers
    const response = await fetch(url, {
      method: requestMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthToken() ? `Bearer ${getAuthToken()}` : '',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    // Handle 401 Unauthorized (expired token, etc.)
    if (response.status === 401) {
      removeAuthToken();
      console.error('Unauthorized access, redirect to login');
      window.location.href = '/admin/login';
      return Promise.reject(new Error('Unauthorized'));
    }

    // Return the response for GET methods, let the caller handle parsing
    if (requestMethod === 'GET') {
      return response;
    }

    // For non-GET methods, handle the response here
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response from ${endpoint}:`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return Promise.reject(new Error(errorJson.message || 'API request failed'));
      } catch (e) {
        return Promise.reject(new Error(`API request failed: ${errorText.substring(0, 100)}...`));
      }
    }

    try {
      const responseData = await response.json();
      console.log(`Response from ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return response; // Return the response object so caller can handle it
    }
  } catch (error) {
    console.error('Error in API request to', method, url, ':', error);
    throw error;
  }
};

type RequestOptions = {
  method?: string;
  data?: any;
  headers?: Record<string, string>;
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});