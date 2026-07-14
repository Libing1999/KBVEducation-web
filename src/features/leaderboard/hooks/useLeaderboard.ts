import { useQuery } from '@tanstack/react-query';
import { leaderboardApi } from '@/features/leaderboard/api/leaderboardApi';
import type { LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';
import { QUERY_KEYS } from '@/config/constants';

/** The authenticated student's own cohort leaderboard. Errors (disabled/no cohort) surface via isError. */
export function useMyLeaderboard(sortBy?: LeaderboardSortField) {
  return useQuery({
    queryKey: [...QUERY_KEYS.leaderboard, 'me', sortBy],
    queryFn: () => leaderboardApi.myLeaderboard(sortBy),
    retry: false,
  });
}
