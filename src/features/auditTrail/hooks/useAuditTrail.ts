import { useQuery } from '@tanstack/react-query';
import { auditTrailApi } from '@/features/auditTrail/api/auditTrailApi';
import type { AuditTrailQuery } from '@/features/auditTrail/types/auditTrail.types';

const KEYS = {
  list: ['audit-trail'] as const,
  todayCount: ['audit-trail', 'today-count'] as const,
};

export function useAuditTrail(query: AuditTrailQuery) {
  return useQuery({
    queryKey: [...KEYS.list, query],
    queryFn: () => auditTrailApi.list(query),
  });
}

export function useAuditTrailTodayCount() {
  return useQuery({ queryKey: KEYS.todayCount, queryFn: auditTrailApi.todayCount });
}
