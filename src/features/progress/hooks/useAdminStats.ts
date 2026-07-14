import { useQuery } from '@tanstack/react-query';
import { adminStatsApi } from '@/features/progress/api/adminStatsApi';
import { QUERY_KEYS } from '@/config/constants';

export function useAdminStatistics() {
  return useQuery({
    queryKey: [...QUERY_KEYS.adminStats],
    queryFn: () => adminStatsApi.statistics(),
  });
}

export function useStudentProgress(studentId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.progress, 'student', studentId],
    queryFn: () => adminStatsApi.studentProgress(studentId as string),
    enabled: !!studentId,
  });
}

export function useStudentActivity(studentId: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.activity, 'student', studentId, page, size],
    queryFn: () => adminStatsApi.studentActivity(studentId as string, page, size),
    enabled: !!studentId,
  });
}

export function useStudentCalendar(studentId: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.calendar, 'student', studentId, from, to],
    queryFn: () => adminStatsApi.studentCalendar(studentId as string, from, to),
    enabled: !!studentId && !!from && !!to,
  });
}
