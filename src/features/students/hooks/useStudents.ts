import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studentsApi } from '@/features/students/api/studentsApi';
import type { CreateStudentRequest, StudentsQuery } from '@/features/students/types/student.types';
import type { UpdateUserRequest } from '@/features/users/types/user.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useStudents(query: StudentsQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.students, query],
    queryFn: () => studentsApi.list(query),
  });
}

export function useStudentMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.students });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.cohorts });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (payload: CreateStudentRequest) => studentsApi.create(payload),
    onSuccess: () => { invalidate(); toast.success('Student created'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserRequest }) =>
      studentsApi.update(id, payload),
    onSuccess: () => { invalidate(); toast.success('Student updated'); },
    onError,
  });

  const assignCohort = useMutation({
    mutationFn: ({ id, cohortId }: { id: string; cohortId: string }) =>
      studentsApi.assignCohort(id, cohortId),
    onSuccess: () => { invalidate(); toast.success('Cohort assigned'); },
    onError,
  });

  const removeFromCohort = useMutation({
    mutationFn: (id: string) => studentsApi.removeFromCohort(id),
    onSuccess: () => { invalidate(); toast.success('Removed from cohort'); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Student deleted'); },
    onError,
  });

  return { create, update, assignCohort, removeFromCohort, remove };
}
