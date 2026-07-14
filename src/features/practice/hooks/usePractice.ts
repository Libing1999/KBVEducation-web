import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { practiceApi } from '@/features/practice/api/practiceApi';
import type { CreatePracticeInput } from '@/features/practice/types/practice.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function usePracticeList() {
  return useQuery({
    queryKey: [...QUERY_KEYS.practice, 'list'],
    queryFn: () => practiceApi.list(),
  });
}

export function usePractice(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.practice, 'detail', id],
    queryFn: () => practiceApi.get(id as string),
    enabled: !!id,
  });
}

export function usePracticeMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.practice });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.progress });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.activity });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.calendar });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: ({ input, files }: { input: CreatePracticeInput; files: File[] }) =>
      practiceApi.create(input, files),
    onSuccess: () => { invalidate(); toast.success('Practice logged'); },
    onError,
  });

  const requestReview = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => practiceApi.requestReview(id, reason),
    onSuccess: () => { invalidate(); toast.success('Review requested'); },
    onError,
  });

  return { create, requestReview };
}
