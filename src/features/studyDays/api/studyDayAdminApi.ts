import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';

export const studyDayAdminApi = {
  voidDay: async (studentId: string, date: string, reason: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/admin/study-days/void', { studentId, date, reason });
  },

  unvoidDay: async (studentId: string, date: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/admin/study-days/unvoid', { studentId, date });
  },
};
