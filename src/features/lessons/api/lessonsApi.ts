import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  CreateLessonRequest,
  LessonFile,
  LessonResponse,
  LessonsQuery,
  ReorderItem,
  UpdateLessonRequest,
} from '@/features/lessons/types/lesson.types';

export const lessonsApi = {
  list: async (query: LessonsQuery): Promise<PageResponse<LessonResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<LessonResponse>>>('/admin/lessons', {
      params: buildParams(query),
    });
    return data.data;
  },

  get: async (id: string): Promise<LessonResponse> => {
    const { data } = await apiClient.get<ApiResponse<LessonResponse>>(`/admin/lessons/${id}`);
    return data.data;
  },

  create: async (payload: CreateLessonRequest): Promise<LessonResponse> => {
    const { data } = await apiClient.post<ApiResponse<LessonResponse>>('/admin/lessons', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateLessonRequest): Promise<LessonResponse> => {
    const { data } = await apiClient.put<ApiResponse<LessonResponse>>(`/admin/lessons/${id}`, payload);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/lessons/${id}`);
  },

  publish: async (id: string): Promise<LessonResponse> => {
    const { data } = await apiClient.post<ApiResponse<LessonResponse>>(`/admin/lessons/${id}/publish`);
    return data.data;
  },

  unpublish: async (id: string): Promise<LessonResponse> => {
    const { data } = await apiClient.post<ApiResponse<LessonResponse>>(`/admin/lessons/${id}/unpublish`);
    return data.data;
  },

  duplicate: async (id: string): Promise<LessonResponse> => {
    const { data } = await apiClient.post<ApiResponse<LessonResponse>>(`/admin/lessons/${id}/duplicate`);
    return data.data;
  },

  reorder: async (items: ReorderItem[]): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/admin/lessons/reorder', { items });
  },

  // --- files ---
  listFiles: async (lessonId: string): Promise<LessonFile[]> => {
    const { data } = await apiClient.get<ApiResponse<LessonFile[]>>(`/admin/lessons/${lessonId}/files`);
    return data.data;
  },

  uploadFiles: async (lessonId: string, files: File[]): Promise<LessonFile[]> => {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    const { data } = await apiClient.post<ApiResponse<LessonFile[]>>(
      `/admin/lessons/${lessonId}/files`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  removeFile: async (lessonId: string, fileId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/lessons/${lessonId}/files/${fileId}`);
  },

  fileDownloadUrl: (lessonId: string, fileId: string): string =>
    `/admin/lessons/${lessonId}/files/${fileId}/download`,
};
