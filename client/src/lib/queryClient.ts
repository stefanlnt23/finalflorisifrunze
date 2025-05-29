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

export async function apiRequest(method: string, url: string, data?: any) {
  try {
    console.log(`Making ${method} request to ${url}`);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Request includes authorization token');
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error Response: ${errorText}`);

      let errorObj;
      try {
        errorObj = JSON.parse(errorText);
      } catch (e) {
        errorObj = { message: errorText || 'Unknown error' };
      }
      throw new Error(errorObj.message || `API request failed with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    console.log(`Response content type: ${contentType}`);

    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      console.log(`JSON response received:`, jsonResponse);
      return jsonResponse;
    }

    const textResponse = await response.text();
    console.log(`Text response received: ${textResponse.substring(0, 100)}${textResponse.length > 100 ? '...' : ''}`);
    return textResponse;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

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

const makeRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const baseURL = import.meta.env.VITE_API_URL || '';
  const fullURL = `${baseURL}${url}`;

  console.log(`Making ${options.method || 'GET'} request to ${url}`);

  // Add authentication token to admin requests
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token for admin routes
  if (url.includes('/admin/')) {
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(fullURL, {
      headers,
      ...options,
    });