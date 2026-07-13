import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ApiResponse } from '@/types/api';
import type { RefreshResponse } from '@/features/auth/types/auth.types';
import { paths } from '@/routes/paths';

/**
 * Central Axios instance.
 *
 * - Request interceptor attaches the bearer access token.
 * - Response interceptor transparently refreshes an expired access token once,
 *   queuing concurrent 401s so only a single refresh call is made.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

function forceLogout() {
  useAuthStore.getState().logout();
  if (window.location.pathname !== paths.login) {
    window.location.assign(paths.login);
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // Only attempt a refresh for genuine auth failures on non-auth endpoints.
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');
    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Wait for the in-flight refresh to complete, then retry.
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      // Use a bare axios call so this request bypasses the interceptors above.
      const { data } = await axios.post<ApiResponse<RefreshResponse>>(
        `${env.apiBaseUrl}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const tokens = data.data;
      useAuthStore.getState().setTokens(tokens);
      flushQueue(tokens.accessToken);

      originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
