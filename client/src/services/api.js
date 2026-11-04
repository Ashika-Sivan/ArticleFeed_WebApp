import axios from 'axios';

// In-memory access token — never stored in localStorage or cookies
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const clearAccessToken = () => { accessToken = null; };

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  withCredentials: true, // sends the httpOnly refreshToken cookie on every request
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401, silently refresh once and retry the original request
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest) return Promise.reject(error);

    const url = originalRequest.url || '';

    // Don't attempt refresh for auth endpoints or if already retried
    const skipRefresh =
      originalRequest._retry ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    if (status === 401 && !skipRefresh) {
      originalRequest._retry = true;

      try {
        const refreshRes = await api.post('/auth/refresh');
        const newToken = refreshRes.data.accessToken;
        setAccessToken(newToken);

        // Update the header and retry — request interceptor will also re-attach it
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
