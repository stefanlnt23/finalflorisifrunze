
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      // Try to parse the response as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.clone().json();
        errorMessage = data.message || data.error || JSON.stringify(data);
      } else {
        // If not JSON, get it as text
        errorMessage = await res.text() || res.statusText;
      }
    } catch (err) {
      // If we can't parse JSON or get text, just use the status text
      console.error('Error parsing response:', err);
    }
    throw new Error(errorMessage);
  }
}

// Generic API request function
export async function apiRequest(url: string, options: RequestOptions = {}): Promise<any> {
  const { method = 'GET', data = null } = options;

  console.log(`Making ${method} request to ${url}`);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    // Parse the response JSON regardless of status code
    const responseData = await response.json().catch(() => {
      console.log('Response is not JSON, returning text');
      return response.text();
    });

    // Check if not successful after getting the response data
    if (!response.ok) {
      console.log('API Error Response:', JSON.stringify(responseData));
      throw new Error(responseData?.message || 'An error occurred with the API request');
    }

    // Log successful response
    console.log('API response received:', responseData);

    return responseData;
  } catch (error) {
    console.log('API Request Error:', error);
    throw error;
  }
}

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
