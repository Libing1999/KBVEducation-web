import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { learnApi } from '@/features/learn/api/learnApi';
import type { SubmitAnswer } from '@/features/learn/types/learn.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useMyLessons() {
  return useQuery({
    queryKey: [...QUERY_KEYS.myLessons],
    queryFn: () => learnApi.myLessons(0, 50),
  });
}

export function useMyLessonDetail(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.myLessons, 'detail', id],
    queryFn: () => learnApi.lessonDetail(id as string),
    enabled: !!id,
  });
}

export function useTakeQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.studentQuiz, quizId],
    queryFn: () => learnApi.takeQuiz(quizId as string),
    enabled: !!quizId,
  });
}

export function useSubmitQuiz(quizId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers: SubmitAnswer[]) => learnApi.submitQuiz(quizId, answers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.studentQuiz, quizId] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.myLessons });
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}

export function useMyHomeworkSubmission(lessonId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.myLessons, 'homework', lessonId],
    queryFn: () => learnApi.mySubmission(lessonId),
    enabled: enabled && !!lessonId,
  });
}

export function useSubmitHomework(lessonId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ files, note }: { files: File[]; note?: string }) =>
      learnApi.submitHomework(lessonId, files, note),
    onSuccess: () => {
      toast.success('Homework submitted');
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.myLessons, 'homework', lessonId] });
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.myLessons, 'detail', lessonId] });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.myLessons });
    },
    onError: (e: unknown) => toast.error(getErrorMessage(e)),
  });
}
