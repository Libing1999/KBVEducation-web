import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';
import type { AdminAnalytics, StudentTrend, TrendPoint } from '@/features/analytics/types/analytics.types';

export const analyticsApi = {
  get: async (cohortId?: string): Promise<AdminAnalytics> => {
    const { data } = await apiClient.get<ApiResponse<AdminAnalytics>>('/admin/analytics', {
      params: buildParams({ cohortId }),
    });
    return data.data;
  },

  trend: async (metric: LeaderboardSortField, cohortId?: string, days = 30): Promise<TrendPoint[]> => {
    const { data } = await apiClient.get<ApiResponse<TrendPoint[]>>('/admin/analytics/trend', {
      params: buildParams({ metric, cohortId, days }),
    });
    return data.data;
  },

  // Backend binds List<UUID> from a single comma-separated query param (Spring's default
  // String->Collection conversion) - simpler than an array paramsSerializer for the same result.
  studentTrend: async (studentIds: string[], days = 30): Promise<StudentTrend[]> => {
    const { data } = await apiClient.get<ApiResponse<StudentTrend[]>>('/admin/analytics/student-trend', {
      params: { studentIds: studentIds.join(','), days },
    });
    return data.data;
  },
};
