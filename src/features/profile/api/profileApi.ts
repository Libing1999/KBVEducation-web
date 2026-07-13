import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { UpdateUserRequest, UserResponse } from '@/features/users/types/user.types';

export const profileApi = {
  get: async (): Promise<UserResponse> => {
    const { data } = await apiClient.get<ApiResponse<UserResponse>>('/profile');
    return data.data;
  },

  update: async (payload: UpdateUserRequest): Promise<UserResponse> => {
    const { data } = await apiClient.put<ApiResponse<UserResponse>>('/profile', payload);
    return data.data;
  },
};
