import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from '@/features/auth/types/auth.types';

/** Auth endpoints. Response envelopes are unwrapped to the `data` payload. */
export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
    return data.data;
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<string> => {
    const { data } = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
    return data.message;
  },
};
