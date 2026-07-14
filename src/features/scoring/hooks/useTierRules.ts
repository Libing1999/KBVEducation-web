import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tierRulesApi } from '@/features/scoring/api/tierRulesApi';
import type { TierRuleRequest } from '@/features/scoring/types/scoring.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useTierRules() {
  return useQuery({
    queryKey: QUERY_KEYS.tierRules,
    queryFn: tierRulesApi.list,
  });
}

export function useTierRulesMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: TierRuleRequest[]) => tierRulesApi.updateAll(rules),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tierRules });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.studentDashboard });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.leaderboard });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.analytics });
      toast.success('Tier rules updated');
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
