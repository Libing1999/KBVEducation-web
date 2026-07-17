import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { ApplicationLogEntry, ApplicationLogQuery } from '@/features/applicationLogs/types/applicationLog.types';

export const applicationLogApi = {
  list: async (query: ApplicationLogQuery): Promise<PageResponse<ApplicationLogEntry>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ApplicationLogEntry>>>('/admin/application-logs', {
      params: buildParams(query),
    });
    return data.data;
  },
};
