import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { reflectionQuestionsApi } from '@/features/reflections/api/reflectionQuestionsApi';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useReflectionQuestions() {
  return useQuery({
    queryKey: [...QUERY_KEYS.reflectionQuestions],
    queryFn: () => reflectionQuestionsApi.list(),
  });
}

export function useReflectionQuestionMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.reflectionQuestions });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.reflections });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (questionText: string) => reflectionQuestionsApi.create(questionText),
    onSuccess: () => { invalidate(); toast.success('Question added'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, questionText }: { id: string; questionText: string }) =>
      reflectionQuestionsApi.update(id, questionText),
    onSuccess: () => { invalidate(); toast.success('Question updated'); },
    onError,
  });

  const setEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      reflectionQuestionsApi.setEnabled(id, enabled),
    onSuccess: invalidate,
    onError,
  });

  const reorder = useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) => reflectionQuestionsApi.reorder(items),
    onSuccess: invalidate,
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => reflectionQuestionsApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Question deleted'); },
    onError,
  });

  return { create, update, setEnabled, reorder, remove };
}
