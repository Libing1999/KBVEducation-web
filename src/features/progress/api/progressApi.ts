import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { ActivityLog, StudentProgress, StudyDay } from '@/features/progress/types/progress.types';

export const progressApi = {
  getProgress: async (): Promise<StudentProgress> => {
    const { data } = await apiClient.get<ApiResponse<StudentProgress>>('/dashboard/progress');
    return data.data;
  },

  getActivity: async (page = 0, size = 20): Promise<PageResponse<ActivityLog>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ActivityLog>>>('/dashboard/activity', {
      params: { page, size },
    });
    return data.data;
  },

  getCalendar: async (from?: string, to?: string): Promise<StudyDay[]> => {
    const { data } = await apiClient.get<ApiResponse<StudyDay[]>>('/dashboard/calendar', {
      params: { from, to },
    });
    return data.data;
  },
};
