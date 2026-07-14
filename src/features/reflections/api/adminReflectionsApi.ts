import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  AdminReflectionQuery,
  AdminReflectionSummary,
  AnswerInput,
  Reflection,
} from '@/features/reflections/types/reflection.types';

export const adminReflectionsApi = {
  list: async (query: AdminReflectionQuery): Promise<PageResponse<AdminReflectionSummary>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<AdminReflectionSummary>>>(
      '/admin/reflections',
      { params: buildParams(query) },
    );
    return data.data;
  },

  get: async (id: string): Promise<Reflection> => {
    const { data } = await apiClient.get<ApiResponse<Reflection>>(`/admin/reflections/${id}`);
    return data.data;
  },

  updateText: async (id: string, answers: AnswerInput[]): Promise<Reflection> => {
    const { data } = await apiClient.put<ApiResponse<Reflection>>(`/admin/reflections/${id}/text`, answers);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/reflections/${id}`);
  },

  audioUrl: (id: string): string => `/admin/reflections/${id}/audio`,
  exportUrl: (id: string): string => `/admin/reflections/${id}/export`,
};
