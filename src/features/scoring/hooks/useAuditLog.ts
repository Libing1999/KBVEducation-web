import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '@/features/scoring/api/auditLogApi';
import type { AuditLogQuery } from '@/features/scoring/types/scoring.types';
import { QUERY_KEYS } from '@/config/constants';

export function useAuditLog(query: AuditLogQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.scoreAuditLog, query],
    queryFn: () => auditLogApi.list(query),
  });
}
