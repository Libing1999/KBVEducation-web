import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { ReflectionQuestion } from '@/features/reflections/types/reflection.types';

interface ReorderItem {
  id: string;
  displayOrder: number;
}

export const reflectionQuestionsApi = {
  list: async (): Promise<ReflectionQuestion[]> => {
    const { data } = await apiClient.get<ApiResponse<ReflectionQuestion[]>>('/admin/reflection-questions');
    return data.data;
  },

  create: async (questionText: string, enabled = true): Promise<ReflectionQuestion> => {
    const { data } = await apiClient.post<ApiResponse<ReflectionQuestion>>('/admin/reflection-questions', {
      questionText,
      enabled,
    });
    return data.data;
  },

  update: async (id: string, questionText: string): Promise<ReflectionQuestion> => {
    const { data } = await apiClient.put<ApiResponse<ReflectionQuestion>>(`/admin/reflection-questions/${id}`, {
      questionText,
    });
    return data.data;
  },

  setEnabled: async (id: string, enabled: boolean): Promise<ReflectionQuestion> => {
    const { data } = await apiClient.patch<ApiResponse<ReflectionQuestion>>(
      `/admin/reflection-questions/${id}/enabled`,
      null,
      { params: { enabled } },
    );
    return data.data;
  },

  reorder: async (items: ReorderItem[]): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/admin/reflection-questions/reorder', { items });
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/reflection-questions/${id}`);
  },
};
