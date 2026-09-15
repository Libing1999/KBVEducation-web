import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tierApi } from '@/features/tier/api/tierApi';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useCurrentTier(studentId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.adminTier, studentId],
    queryFn: () => tierApi.current(studentId as string),
    enabled: !!studentId,
  });
}

export function useTierHistory(studentId: string | undefined, page = 0, size = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.adminTierHistory, studentId, page, size],
    queryFn: () => tierApi.history(studentId as string, page, size),
    enabled: !!studentId,
  });
}

export function useTierMutations(studentId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminTier });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminTierHistory });
    if (studentId) qc.invalidateQueries({ queryKey: [...QUERY_KEYS.progress, 'student', studentId] });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const confirm = useMutation({
    mutationFn: () => tierApi.confirm(studentId as string),
    onSuccess: () => { invalidate(); toast.success('Tier confirmed'); },
    onError,
  });

  const override = useMutation({
    mutationFn: ({ tierName, reason }: { tierName: string; reason: string }) =>
      tierApi.override(studentId as string, tierName, reason),
    onSuccess: () => { invalidate(); toast.success('Tier overridden'); },
    onError,
  });

  return { confirm, override };
}
