import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { quizzesApi } from '@/features/quizzes/api/quizzesApi';
import type {
  QuestionRequest,
  QuizRequest,
  ReorderItem,
} from '@/features/quizzes/types/quiz.types';
import { QUERY_KEYS } from '@/config/constants';
import { getErrorMessage } from '@/lib/utils';

export function useLessonQuiz(lessonId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.quizzes, 'lesson', lessonId],
    queryFn: () => quizzesApi.getByLesson(lessonId as string),
    enabled: !!lessonId,
  });
}

/**
 * Mutations for a lesson's quiz and its questions. Invalidates both the quiz
 * cache and the lesson cache (so the lesson's `hasQuiz` flag refreshes).
 */
export function useQuizMutations(lessonId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [...QUERY_KEYS.quizzes, 'lesson', lessonId] });
    qc.invalidateQueries({ queryKey: QUERY_KEYS.lessons });
  };
  const onError = (e: unknown) => toast.error(getErrorMessage(e));

  const upsert = useMutation({
    mutationFn: (payload: QuizRequest) => quizzesApi.upsert(lessonId, payload),
    onSuccess: () => { invalidate(); toast.success('Quiz saved'); },
    onError,
  });

  const remove = useMutation({
    mutationFn: (quizId: string) => quizzesApi.remove(quizId),
    onSuccess: () => { invalidate(); toast.success('Quiz deleted'); },
    onError,
  });

  const addQuestion = useMutation({
    mutationFn: ({ quizId, payload }: { quizId: string; payload: QuestionRequest }) =>
      quizzesApi.addQuestion(quizId, payload),
    onSuccess: () => { invalidate(); toast.success('Question added'); },
    onError,
  });

  const updateQuestion = useMutation({
    mutationFn: ({ questionId, payload }: { questionId: string; payload: QuestionRequest }) =>
      quizzesApi.updateQuestion(questionId, payload),
    onSuccess: () => { invalidate(); toast.success('Question updated'); },
    onError,
  });

  const deleteQuestion = useMutation({
    mutationFn: (questionId: string) => quizzesApi.deleteQuestion(questionId),
    onSuccess: () => { invalidate(); toast.success('Question deleted'); },
    onError,
  });

  const reorderQuestions = useMutation({
    mutationFn: ({ quizId, items }: { quizId: string; items: ReorderItem[] }) =>
      quizzesApi.reorderQuestions(quizId, items),
    onSuccess: () => invalidate(),
    onError,
  });

  return { upsert, remove, addQuestion, updateQuestion, deleteQuestion, reorderQuestions };
}
