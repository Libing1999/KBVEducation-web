import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { subjectsApi } from '@/features/subjects/api/subjectsApi';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useSubjects() {
  return useQuery({
    queryKey: [...QUERY_KEYS.subjects, 'all'],
    queryFn: () => subjectsApi.list(),
  });
}

export function useSubjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.subjects });
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (name: string) => subjectsApi.create(name),
    onSuccess: () => { invalidate(); toast.success('Subject added'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => subjectsApi.update(id, name),
    onSuccess: () => { invalidate(); toast.success('Subject updated'); },
    onError,
  });

  const setEnabled = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => subjectsApi.setEnabled(id, enabled),
    onSuccess: invalidate,
    onError,
  });

  const reorder = useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) => subjectsApi.reorder(items),
    onSuccess: invalidate,
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => subjectsApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Subject deleted'); },
    onError,
  });

  return { create, update, setEnabled, reorder, remove };
}
