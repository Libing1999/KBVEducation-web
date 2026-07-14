import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { ActivityLog, StudentProgress, StudyDay } from '@/features/progress/types/progress.types';

export interface AdminStatistics {
  todayReflections: number;
  todayPractice: number;
  pendingReviews: number;
  approvedSessions: number;
  rejectedSessions: number;
  activeStudents: number;
  weeklyActivity: number;
  monthlyActivity: number;
}

export const adminStatsApi = {
  statistics: async (): Promise<AdminStatistics> => {
    const { data } = await apiClient.get<ApiResponse<AdminStatistics>>('/admin/dashboard/statistics');
    return data.data;
  },

  studentProgress: async (studentId: string): Promise<StudentProgress> => {
    const { data } = await apiClient.get<ApiResponse<StudentProgress>>(
      `/admin/dashboard/students/${studentId}/progress`,
    );
    return data.data;
  },

  studentActivity: async (studentId: string, page = 0, size = 20): Promise<PageResponse<ActivityLog>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ActivityLog>>>(
      `/admin/dashboard/students/${studentId}/activity`,
      { params: { page, size } },
    );
    return data.data;
  },

  studentCalendar: async (studentId: string, from?: string, to?: string): Promise<StudyDay[]> => {
    const { data } = await apiClient.get<ApiResponse<StudyDay[]>>(
      `/admin/dashboard/students/${studentId}/calendar`,
      { params: { from, to } },
    );
    return data.data;
  },
};
