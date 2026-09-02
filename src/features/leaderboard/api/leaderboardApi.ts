import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  LeaderboardEntry,
  LeaderboardSortField,
  LeaderboardStanding,
} from '@/features/leaderboard/types/leaderboard.types';

export interface AdminLeaderboardQuery {
  cohortId: string;
  sortBy?: LeaderboardSortField;
  page?: number;
  size?: number;
}

export const leaderboardApi = {
  myLeaderboard: async (sortBy?: LeaderboardSortField): Promise<LeaderboardStanding> => {
    const { data } = await apiClient.get<ApiResponse<LeaderboardStanding>>('/student/leaderboard', {
      params: buildParams({ sortBy }),
    });
    return data.data;
  },

  adminList: async (query: AdminLeaderboardQuery): Promise<PageResponse<LeaderboardEntry>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<LeaderboardEntry>>>('/admin/leaderboard', {
      params: buildParams(query),
    });
    return data.data;
  },

  regenerate: async (cohortId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/admin/leaderboard/regenerate', null, { params: { cohortId } });
  },
};
