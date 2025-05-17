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
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: "same-origin" // Include cookies for session handling
  };

  // Add authentication token if available
  const storedUser = localStorage.getItem('adminUser');
  if (storedUser && url.includes('/api/admin/')) {
    const user = JSON.parse(storedUser);
    (options.headers as Record<string, string>)['Authorization'] = `Bearer ${user.id}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`API ${method} request to ${url}`);
    if (data) {
      console.log("Request data:", JSON.stringify(data, null, 2).substring(0, 500) + (JSON.stringify(data).length > 500 ? "..." : ""));
    }

    const response = await fetch(url, options);

    // Log response status
    console.log(`Response status: ${response.status} ${response.statusText}`);

    // For non-ok responses, try to get more information
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorBody = await response.clone().json();
        console.error("Error response body:", errorBody);
        if (errorBody.message) {
          errorMessage = errorBody.message;
        }
        if (errorBody.errors) {
          errorMessage += ": " + JSON.stringify(errorBody.errors);
        }
      } catch (e) {
        // Ignore error parsing error
      }

      // Create an error with the message but still return the response
      response.errorMessage = errorMessage;
    }

    return response;
  } catch (error) {
    console.error("Network error during API request:", error);
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