import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { HomeworkRequest, HomeworkResponse } from '@/features/homework/types/homework.types';

export const homeworkApi = {
  /** Returns the lesson's homework config, or null when none is configured (404). */
  getByLesson: async (lessonId: string): Promise<HomeworkResponse | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<HomeworkResponse>>(
        `/admin/lessons/${lessonId}/homework`,
      );
      return data.data;
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    }
  },

  upsert: async (lessonId: string, payload: HomeworkRequest): Promise<HomeworkResponse> => {
    const { data } = await apiClient.put<ApiResponse<HomeworkResponse>>(
      `/admin/lessons/${lessonId}/homework`,
      payload,
    );
    return data.data;
  },

  remove: async (homeworkId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/homework/${homeworkId}`);
  },
};
