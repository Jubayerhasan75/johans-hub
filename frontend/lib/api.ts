// Single source of truth for the backend URL.
// Locally it falls back to the dev backend; in production set
// VITE_API_URL in Vercel (e.g. https://johans-hub-api.onrender.com).
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:5000';

interface ApiOptions extends RequestInit {
  token?: string;
}

/**
 * fetch wrapper that prefixes the API base URL, attaches the auth token,
 * parses JSON, and throws an Error with the backend's message on failure.
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  // Don't set Content-Type for FormData uploads — the browser does it
  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders, body });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON response body (e.g. empty)
  }

  if (!response.ok) {
    // An authenticated request rejected with 401 means the token is
    // expired/invalid — tell the app so it can log the user out cleanly.
    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('app:auth-expired'));
    }
    const message =
      (data as { message?: string } | null)?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data as T;
}
