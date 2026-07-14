import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { LeaderboardEntry, LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';

export const leaderboardApi = {
  myLeaderboard: async (sortBy?: LeaderboardSortField): Promise<LeaderboardEntry[]> => {
    const { data } = await apiClient.get<ApiResponse<LeaderboardEntry[]>>('/student/leaderboard', {
      params: buildParams({ sortBy }),
    });
    return data.data;
  },
};
