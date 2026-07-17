import { useQuery } from '@tanstack/react-query';
import { applicationLogApi } from '@/features/applicationLogs/api/applicationLogApi';
import type { ApplicationLogQuery } from '@/features/applicationLogs/types/applicationLog.types';

const KEYS = {
  list: ['application-logs'] as const,
};

export function useApplicationLogs(query: ApplicationLogQuery) {
  return useQuery({
    queryKey: [...KEYS.list, query],
    queryFn: () => applicationLogApi.list(query),
  });
}
