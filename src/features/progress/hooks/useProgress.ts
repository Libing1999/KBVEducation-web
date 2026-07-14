import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/features/progress/api/progressApi';
import { QUERY_KEYS } from '@/config/constants';

export function useProgress() {
  return useQuery({
    queryKey: [...QUERY_KEYS.progress],
    queryFn: () => progressApi.getProgress(),
  });
}

export function useActivity(page = 0, size = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.activity, page, size],
    queryFn: () => progressApi.getActivity(page, size),
  });
}

export function useCalendar(from: string, to: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.calendar, from, to],
    queryFn: () => progressApi.getCalendar(from, to),
    enabled: !!from && !!to,
  });
}
