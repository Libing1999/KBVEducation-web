import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { parentsApi } from '@/features/parents/api/parentsApi';
import type { CreateParentRequest, ParentsQuery } from '@/features/parents/types/parent.types';
import type { UpdateUserRequest } from '@/features/users/types/user.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useParents(query: ParentsQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.parents, query],
    queryFn: () => parentsApi.list(query),
  });
}

export function useParentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.parents });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (payload: CreateParentRequest) => parentsApi.create(payload),
    onSuccess: () => { invalidate(); toast.success('Parent created'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      parentsApi.update(id, payload),
    onSuccess: () => { invalidate(); toast.success('Parent updated'); },
    onError,
  });

  const linkStudent = useMutation({
    mutationFn: ({ id, studentId }: { id: string; studentId: string }) =>
      parentsApi.linkStudent(id, studentId),
    onSuccess: () => { invalidate(); toast.success('Student linked'); },
    onError,
  });

  const unlinkStudent = useMutation({
    mutationFn: (id: string) => parentsApi.unlinkStudent(id),
    onSuccess: () => { invalidate(); toast.success('Student unlinked'); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => parentsApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Parent deleted'); },
    onError,
  });

  return { create, update, linkStudent, unlinkStudent, remove };
}
