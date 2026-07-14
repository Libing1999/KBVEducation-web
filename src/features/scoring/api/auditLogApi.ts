import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { AuditLogQuery, ScoreAuditLogEntry } from '@/features/scoring/types/scoring.types';

export const auditLogApi = {
  list: async (query: AuditLogQuery): Promise<PageResponse<ScoreAuditLogEntry>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ScoreAuditLogEntry>>>('/admin/audit-logs', {
      params: buildParams(query),
    });
    return data.data;
  },
};
