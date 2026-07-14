import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminReflectionsApi } from '@/features/reflections/api/adminReflectionsApi';
import type { AdminReflectionQuery, AnswerInput } from '@/features/reflections/types/reflection.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useAdminReflections(query: AdminReflectionQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.reflections, 'admin', query],
    queryFn: () => adminReflectionsApi.list(query),
  });
}

export function useAdminReflection(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.reflections, 'admin', 'detail', id],
    queryFn: () => adminReflectionsApi.get(id as string),
    enabled: !!id,
  });
}

export function useAdminReflectionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.reflections });
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const updateText = useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: AnswerInput[] }) =>
      adminReflectionsApi.updateText(id, answers),
    onSuccess: () => { invalidate(); toast.success('Reflection updated'); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminReflectionsApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Reflection deleted'); },
    onError,
  });

  return { updateText, remove };
}
