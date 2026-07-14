import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reflectionsApi } from '@/features/reflections/api/reflectionsApi';
import type { AnswerInput } from '@/features/reflections/types/reflection.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useTodayReflection() {
  return useQuery({
    queryKey: [...QUERY_KEYS.reflections, 'today'],
    queryFn: () => reflectionsApi.getToday(),
  });
}

export function useReflectionHistory() {
  return useQuery({
    queryKey: [...QUERY_KEYS.reflections, 'history'],
    queryFn: () => reflectionsApi.list(),
  });
}

export function useReflectionMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.reflections });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.progress });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.activity });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.calendar });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const submit = useMutation({
    mutationFn: ({ answers, audio }: { answers: AnswerInput[]; audio?: File | null }) =>
      reflectionsApi.submit(answers, audio),
    onSuccess: () => { invalidate(); toast.success('Reflection submitted'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, answers, audio, removeAudio }: {
      id: string; answers: AnswerInput[]; audio?: File | null; removeAudio?: boolean;
    }) => reflectionsApi.update(id, answers, audio, removeAudio),
    onSuccess: () => { invalidate(); toast.success('Reflection updated'); },
    onError,
  });

  return { submit, update };
}
