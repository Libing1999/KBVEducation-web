import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { AuditTrailEntry, AuditTrailQuery } from '@/features/auditTrail/types/auditTrail.types';

export const auditTrailApi = {
  list: async (query: AuditTrailQuery): Promise<PageResponse<AuditTrailEntry>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<AuditTrailEntry>>>('/admin/audit-trail', {
      params: buildParams(query),
    });
    return data.data;
  },

  todayCount: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiResponse<number>>('/admin/audit-trail/today-count');
    return data.data;
  },
};
