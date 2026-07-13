import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { lessonsApi } from '@/features/lessons/api/lessonsApi';
import type {
  CreateLessonRequest,
  LessonsQuery,
  ReorderItem,
  UpdateLessonRequest,
} from '@/features/lessons/types/lesson.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useLessons(query: LessonsQuery) {
  return useQuery({
    queryKey: [...QUERY_KEYS.lessons, query],
    queryFn: () => lessonsApi.list(query),
  });
}

export function useLesson(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.lessons, 'detail', id],
    queryFn: () => lessonsApi.get(id as string),
    enabled: !!id,
  });
}

export function useLessonMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.adminDashboard });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const create = useMutation({
    mutationFn: (payload: CreateLessonRequest) => lessonsApi.create(payload),
    onSuccess: () => { invalidate(); toast.success('Lesson created'); },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLessonRequest }) =>
      lessonsApi.update(id, payload),
    onSuccess: () => { invalidate(); toast.success('Lesson updated'); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (id: string) => lessonsApi.remove(id),
    onSuccess: () => { invalidate(); toast.success('Lesson deleted'); },
    onError,
  });

  const publish = useMutation({
    mutationFn: (id: string) => lessonsApi.publish(id),
    onSuccess: () => { invalidate(); toast.success('Lesson published'); },
    onError,
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => lessonsApi.unpublish(id),
    onSuccess: () => { invalidate(); toast.success('Lesson unpublished'); },
    onError,
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => lessonsApi.duplicate(id),
    onSuccess: () => { invalidate(); toast.success('Lesson duplicated'); },
    onError,
  });

  const reorder = useMutation({
    mutationFn: (items: ReorderItem[]) => lessonsApi.reorder(items),
    onSuccess: () => invalidate(),
    onError,
  });

  return { create, update, remove, publish, unpublish, duplicate, reorder };
}
