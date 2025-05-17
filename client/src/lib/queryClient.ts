import { QueryClient, QueryFunction } from "@tanstack/react-query";

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
export async function apiRequest(
  endpoint: string,
  options?: {
    method?: string;
    data?: any;
    headers?: Record<string, string>;
  }
): Promise<any> {
  const { method = 'GET', data, headers = {} } = options || {};

  console.log(`Making ${method} request to ${endpoint}`, data ? { data } : '');

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies for authentication
  };

  if (data) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(endpoint, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}) from ${endpoint}:`, errorText);
      try {
        // Try to parse as JSON for a more detailed error
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `HTTP error ${response.status}`);
      } catch (e) {
        // If parsing fails, throw with the raw text
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
    }

    // For DELETE requests or those that might not return content
    if (method === 'DELETE' || response.headers.get('Content-Length') === '0') {
      return { success: true };
    }

    const responseData = await response.json();
    console.log(`Response from ${endpoint}:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
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