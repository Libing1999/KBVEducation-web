import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { ScoreConfig, ScoreConfigRequest } from '@/features/scoring/types/scoring.types';

export const scoreConfigApi = {
  get: async (): Promise<ScoreConfig> => {
    const { data } = await apiClient.get<ApiResponse<ScoreConfig>>('/admin/score-config');
    return data.data;
  },

  update: async (payload: ScoreConfigRequest): Promise<ScoreConfig> => {
    const { data } = await apiClient.put<ApiResponse<ScoreConfig>>('/admin/score-config', payload);
    return data.data;
  },
};
