import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { homeworkApi } from '@/features/homework/api/homeworkApi';
import type { HomeworkRequest } from '@/features/homework/types/homework.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useLessonHomework(lessonId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.homework, 'lesson', lessonId],
    queryFn: () => homeworkApi.getByLesson(lessonId as string),
    enabled: !!lessonId,
  });
}

export function useHomeworkMutations(lessonId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [...QUERY_KEYS.homework, 'lesson', lessonId] });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const upsert = useMutation({
    mutationFn: (payload: HomeworkRequest) => homeworkApi.upsert(lessonId, payload),
    onSuccess: () => { invalidate(); toast.success('Homework saved'); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (homeworkId: string) => homeworkApi.remove(homeworkId),
    onSuccess: () => { invalidate(); toast.success('Homework deleted'); },
    onError,
  });

  return { upsert, remove };
}
