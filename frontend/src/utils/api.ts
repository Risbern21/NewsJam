/**
 * Get the backend API URL from environment variables
 * Falls back to a default if not set
 */
export const getApiUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
};

/**
 * Get the full API endpoint URL
 */
export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

