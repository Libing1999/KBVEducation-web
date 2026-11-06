import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import { QUERY_KEYS } from '@/config/constants';
import type { PillarAnalytics, PillarQuery } from '@/features/pillarAnalytics/types/pillarAnalytics.types';

export const pillarAnalyticsApi = {
  get: async ({ pillar, ...q }: PillarQuery): Promise<PillarAnalytics> => {
    const params = new URLSearchParams({ from: q.from, to: q.to });
    q.studentIds?.forEach((id) => params.append('studentIds', id));
    if (q.cohortId) params.set('cohortId', q.cohortId);
    if (q.status) params.set('status', q.status);
    const { data } = await apiClient.get<ApiResponse<PillarAnalytics>>(`/admin/pillar-analytics/${pillar}`, { params });
    return data.data;
  },
};

export function usePillarAnalytics(query: PillarQuery, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.analytics, 'pillar', query],
    queryFn: () => pillarAnalyticsApi.get(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}
