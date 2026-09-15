import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { studyDayAdminApi } from '@/features/studyDays/api/studyDayAdminApi';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useStudyDayAdminMutations(studentId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [...QUERY_KEYS.calendar, 'student', studentId] });
    if (studentId) qc.invalidateQueries({ queryKey: [...QUERY_KEYS.progress, 'student', studentId] });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const voidDay = useMutation({
    mutationFn: ({ date, reason }: { date: string; reason: string }) =>
      studyDayAdminApi.voidDay(studentId as string, date, reason),
    onSuccess: () => { invalidate(); toast.success('Day voided'); },
    onError,
  });

  const unvoidDay = useMutation({
    mutationFn: (date: string) => studyDayAdminApi.unvoidDay(studentId as string, date),
    onSuccess: () => { invalidate(); toast.success('Day unvoided'); },
    onError,
  });

  return { voidDay, unvoidDay };
}
