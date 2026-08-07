import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { Subject } from '@/features/subjects/types/subject.types';

interface ReorderItem {
  id: string;
  displayOrder: number;
}

export const subjectsApi = {
  list: async (): Promise<Subject[]> => {
    const { data } = await apiClient.get<ApiResponse<Subject[]>>('/admin/subjects');
    return data.data;
  },

  listActive: async (): Promise<Subject[]> => {
    const { data } = await apiClient.get<ApiResponse<Subject[]>>('/student/subjects');
    return data.data;
  },

  create: async (name: string, enabled = true): Promise<Subject> => {
    const { data } = await apiClient.post<ApiResponse<Subject>>('/admin/subjects', { name, enabled });
    return data.data;
  },

  update: async (id: string, name: string): Promise<Subject> => {
    const { data } = await apiClient.put<ApiResponse<Subject>>(`/admin/subjects/${id}`, { name });
    return data.data;
  },

  setEnabled: async (id: string, enabled: boolean): Promise<Subject> => {
    const { data } = await apiClient.patch<ApiResponse<Subject>>(
      `/admin/subjects/${id}/enabled`,
      null,
      { params: { enabled } },
    );
    return data.data;
  },

  reorder: async (items: ReorderItem[]): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/admin/subjects/reorder', { items });
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/subjects/${id}`);
  },
};
