import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Required for Sanctum SPA authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

function getXsrfToken(): string | undefined {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  return csrfToken ? decodeURIComponent(csrfToken) : undefined;
}

/**
 * Ask Sanctum to issue a fresh XSRF-TOKEN cookie.
 *
 * Uses the bare axios instance on purpose: `api` has `baseURL: '/api'`, which
 * would resolve this request to the non-existent `/api/sanctum/csrf-cookie`.
 */
export async function ensureCsrfCookie(): Promise<void> {
  await axios.get('/sanctum/csrf-cookie', {
    withCredentials: true,
    headers: { Accept: 'application/json' },
  });
}

// Request interceptor to add CSRF token (bootstrapping the cookie on first write)
api.interceptors.request.use(async (config) => {
  const method = (config.method ?? 'get').toLowerCase();
  const isSafeMethod = ['get', 'head', 'options'].includes(method);

  if (!isSafeMethod && !getXsrfToken()) {
    await ensureCsrfCookie();
  }

  const csrfToken = getXsrfToken();

  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - let the app clear its auth state
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Handle 419 - CSRF token mismatch: refresh the cookie once, then retry
    const config = error.config as
      | (InternalAxiosRequestConfig & { _csrfRetried?: boolean })
      | undefined;

    if (error.response?.status === 419 && config && !config._csrfRetried) {
      config._csrfRetried = true;
      await ensureCsrfCookie();
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
