import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/config/constants';

export function useAdminDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboard,
    queryFn: dashboardApi.admin,
  });
}

export function useMyDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.studentDashboard,
    queryFn: dashboardApi.me,
  });
}
