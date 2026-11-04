import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Required for Sanctum SPA authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add CSRF token
api.interceptors.request.use((config) => {
  // Get CSRF token from cookie
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken);
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      // Clear any stored auth state
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    
    // Handle 419 - CSRF token mismatch
    if (error.response?.status === 419) {
      // Refresh CSRF token and retry
      return axios.get('/sanctum/csrf-cookie').then(() => api(error.config));
    }

    return Promise.reject(error);
  }
);

export default api;
