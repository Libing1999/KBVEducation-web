import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { scoreConfigApi } from '@/features/scoring/api/scoreConfigApi';
import type { ScoreConfigRequest } from '@/features/scoring/types/scoring.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useScoreConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.scoreConfig,
    queryFn: scoreConfigApi.get,
  });
}

/** A weight change ripples through every student's score, tier, leaderboard position, and analytics. */
export function useScoreConfigMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ScoreConfigRequest) => scoreConfigApi.update(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.scoreConfig });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.studentDashboard });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leaderboard });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.analytics });
      toast.success('Score configuration updated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
