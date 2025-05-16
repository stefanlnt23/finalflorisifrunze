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

export async function apiRequest(method: string, path: string, body?: any) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include'
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    console.log(`Making API request: ${method} ${path}`);
    const response = await fetch(path, options);
    console.log(`API response status: ${response.status}`);

    // Clone the response for debugging
    const responseClone = response.clone();
    let responseText;

    try {
      responseText = await responseClone.text();
      console.log(`API response text: ${responseText.substring(0, 100)}...`);
    } catch (e) {
      console.error("Could not read response text", e);
    }

    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing JSON:", e);
      throw new Error(`Failed to parse JSON response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${method} ${path}):`, error);
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