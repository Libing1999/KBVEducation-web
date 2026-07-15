import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/features/analytics/api/analyticsApi';
import type { LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';
import { QUERY_KEYS } from '@/config/constants';

export function useAdminAnalytics(cohortId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.analytics, cohortId],
    queryFn: () => analyticsApi.get(cohortId),
  });
}

export function useTrend(metric: LeaderboardSortField, cohortId?: string, days = 30) {
  return useQuery({
    queryKey: [...QUERY_KEYS.analytics, 'trend', metric, cohortId, days],
    queryFn: () => analyticsApi.trend(metric, cohortId, days),
  });
}

export function useStudentTrend(studentIds: string[], days = 30) {
  return useQuery({
    queryKey: [...QUERY_KEYS.analytics, 'student-trend', studentIds, days],
    queryFn: () => analyticsApi.studentTrend(studentIds, days),
    enabled: studentIds.length > 0,
  });
}
