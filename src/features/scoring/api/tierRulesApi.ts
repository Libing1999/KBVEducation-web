import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { TierRule, TierRuleRequest } from '@/features/scoring/types/scoring.types';

export const tierRulesApi = {
  list: async (): Promise<TierRule[]> => {
    const { data } = await apiClient.get<ApiResponse<TierRule[]>>('/admin/tier-rules');
    return data.data;
  },

  updateAll: async (rules: TierRuleRequest[]): Promise<TierRule[]> => {
    const { data } = await apiClient.put<ApiResponse<TierRule[]>>('/admin/tier-rules', rules);
    return data.data;
  },
};
