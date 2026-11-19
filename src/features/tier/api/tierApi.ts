import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { CurrentTier, TierHistoryEntry } from '@/features/tier/types/tier.types';

export const tierApi = {
  current: async (studentId: string): Promise<CurrentTier> => {
    const { data } = await apiClient.get<ApiResponse<CurrentTier>>(`/admin/tier/${studentId}`);
    return data.data;
  },

  confirm: async (studentId: string): Promise<TierHistoryEntry> => {
    const { data } = await apiClient.put<ApiResponse<TierHistoryEntry>>(`/admin/tier/${studentId}/confirm`);
    return data.data;
  },

  override: async (studentId: string, tierName: string, reason: string): Promise<TierHistoryEntry> => {
    const { data } = await apiClient.put<ApiResponse<TierHistoryEntry>>(`/admin/tier/${studentId}`, {
      tierName,
      reason,
    });
    return data.data;
  },

  history: async (studentId: string, page = 0, size = 10): Promise<PageResponse<TierHistoryEntry>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<TierHistoryEntry>>>(
      `/admin/tier/${studentId}/history`,
      { params: { page, size } },
    );
    return data.data;
  },
};
