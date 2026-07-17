import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/config/constants';

export function useAdminDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboard,
    queryFn: dashboardApi.admin,
  });
}

export function useAdminDashboardTrends(days: number) {
  return useQuery({
    queryKey: [...QUERY_KEYS.adminDashboardTrends, days],
    queryFn: () => dashboardApi.adminTrends(days),
  });
}

export function useMyDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.studentDashboard,
    queryFn: dashboardApi.me,
  });
}

export function useMyTier() {
  return useQuery({
    queryKey: [...QUERY_KEYS.studentDashboard, 'tier'],
    queryFn: dashboardApi.myTier,
  });
}
