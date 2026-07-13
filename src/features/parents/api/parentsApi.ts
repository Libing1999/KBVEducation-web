import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  CreateParentRequest,
  ParentResponse,
  ParentsQuery,
} from '@/features/parents/types/parent.types';
import type { UpdateUserRequest } from '@/features/users/types/user.types';

export const parentsApi = {
  list: async (query: ParentsQuery): Promise<PageResponse<ParentResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ParentResponse>>>('/admin/parents', {
      params: buildParams(query),
    });
    return data.data;
  },

  create: async (payload: CreateParentRequest): Promise<ParentResponse> => {
    const { data } = await apiClient.post<ApiResponse<ParentResponse>>('/admin/parents', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateUserRequest): Promise<ParentResponse> => {
    const { data } = await apiClient.put<ApiResponse<ParentResponse>>(`/admin/parents/${id}`, payload);
    return data.data;
  },

  linkStudent: async (id: string, studentId: string): Promise<ParentResponse> => {
    const { data } = await apiClient.post<ApiResponse<ParentResponse>>(`/admin/parents/${id}/student`, {
      studentId,
    });
    return data.data;
  },

  unlinkStudent: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/parents/${id}/student`);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/parents/${id}`);
  },
};
