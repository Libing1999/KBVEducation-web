import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cohortsApi } from '@/features/cohorts/api/cohortsApi';
import type { CohortRequest, CohortsQuery } from '@/features/cohorts/types/cohort.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useCohorts(query: CohortsQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.cohorts, query],
    queryFn: () => cohortsApi.list(query),
  });
}

export function useCohortStudents(cohortId: string | null) {
  return useQuery({
    queryKey: [...QUERY_KEYS.cohorts, cohortId, 'students'],
    queryFn: () => cohortsApi.listStudents(cohortId as string),
    enabled: !!cohortId,
  });
}

export function useCohortMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.cohorts });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.students });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (payload: CohortRequest) => cohortsApi.create(payload),
    onSuccess: () => { invalidate(); toast.success('Cohort created'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CohortRequest }) =>
      cohortsApi.update(id, payload),
    onSuccess: () => { invalidate(); toast.success('Cohort updated'); },
    onError,
  });

  const archive = useMutation({
    mutationFn: (id: string) => cohortsApi.archive(id),
    onSuccess: () => { invalidate(); toast.success('Cohort archived'); },
    onError,
  });

  const assignStudent = useMutation({
    mutationFn: ({ id, studentId }: { id: string; studentId: string }) =>
      cohortsApi.assignStudent(id, studentId),
    onSuccess: () => { invalidate(); toast.success('Student assigned'); },
    onError,
  });

  const removeStudent = useMutation({
    mutationFn: ({ id, studentId }: { id: string; studentId: string }) =>
      cohortsApi.removeStudent(id, studentId),
    onSuccess: () => { invalidate(); toast.success('Student removed'); },
    onError,
  });

  return { create, update, archive, assignStudent, removeStudent };
}
