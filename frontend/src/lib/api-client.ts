import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';

const envApiBase = import.meta.env.VITE_API_BASE_URL;
const isLocalEnvBase =
  !!envApiBase && /localhost|127\.0\.0\.1/.test(envApiBase);
export const API_BASE_URL =
  envApiBase && !isLocalEnvBase
    ? envApiBase
    : `http://${window.location.hostname}:8000`;

// Log the API URL for debugging

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
// Access token stored in sessionStorage (auto-clears on browser close - more secure)
// Refresh token stored in localStorage (persists across sessions for remember-me)
// NOTE: We don't cache tokens in memory - we always read from storage to ensure freshness
// This is critical for WebSocket connections and token refresh flows

export const setTokens = (access: string, refresh: string) => {
  sessionStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const getAccessToken = (): string | null => {
  return sessionStorage.getItem('access_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token');
};

export const clearTokens = () => {
  sessionStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Endpoints that should NOT trigger token refresh on 401
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/verify-2fa'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Don't try to refresh token for authentication endpoints - let the error through
    const isAuthEndpoint = AUTH_ENDPOINTS.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();

      if (!refreshTokenValue) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshTokenValue,
        });

        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);

        processQueue();
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        isRefreshing = false;
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
