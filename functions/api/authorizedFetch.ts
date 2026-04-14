/**
 * authorizationFetch.ts
 * A wrapper around the global fetch API that automatically injects 
 * the Authorization bearer token from localStorage if available.
 */

export async function authorizedFetch(
    url: string | URL | Request,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
    const headers = new Headers(options.headers);
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  
    // Ensure Content-Type is set for POST/PUT if body is present
    if (options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  
    const finalOptions: RequestInit = {
      ...options,
      headers,
    };
  
    const response = await fetch(url, finalOptions);
  
    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_profile");
        // Only redirect if we are not already on the login page
        if (!window.location.pathname.startsWith("/login")) {
           window.location.href = "/login";
        }
      }
    }
  
    return response;
  }
