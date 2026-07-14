import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leaderboardApi, type AdminLeaderboardQuery } from '@/features/leaderboard/api/leaderboardApi';
import type { LeaderboardSortField } from '@/features/leaderboard/types/leaderboard.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

/** The authenticated student's own cohort leaderboard. Errors (disabled/no cohort) surface via isError. */
export function useMyLeaderboard(sortBy?: LeaderboardSortField) {
  return useQuery({
    queryKey: [...QUERY_KEYS.leaderboard, 'me', sortBy],
    queryFn: () => leaderboardApi.myLeaderboard(sortBy),
    retry: false,
  });
}

export function useAdminLeaderboard(query: AdminLeaderboardQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.leaderboard, 'admin', query],
    queryFn: () => leaderboardApi.adminList(query),
    enabled: !!query.cohortId,
  });
}

export function useRegenerateLeaderboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cohortId: string) => leaderboardApi.regenerate(cohortId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leaderboard });
      toast.success('Leaderboard regenerated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
