import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersQuery,
  UserStatus,
} from '@/features/users/types/user.types';

export const usersApi = {
  list: async (query: UsersQuery): Promise<PageResponse<UserResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<UserResponse>>>('/admin/users', {
      params: buildParams(query),
    });
    return data.data;
  },

  create: async (payload: CreateUserRequest): Promise<UserResponse> => {
    const { data } = await apiClient.post<ApiResponse<UserResponse>>('/admin/users', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateUserRequest): Promise<UserResponse> => {
    const { data } = await apiClient.put<ApiResponse<UserResponse>>(`/admin/users/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id: string, status: UserStatus): Promise<UserResponse> => {
    const { data } = await apiClient.patch<ApiResponse<UserResponse>>(`/admin/users/${id}/status`, {
      status,
    });
    return data.data;
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/admin/users/${id}/reset-password`, { newPassword });
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/users/${id}`);
  },

  unlock: async (id: string): Promise<UserResponse> => {
    const { data } = await apiClient.put<ApiResponse<UserResponse>>(`/admin/users/${id}/unlock`);
    return data.data;
  },
};
