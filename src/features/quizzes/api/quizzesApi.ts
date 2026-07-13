import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  QuestionRequest,
  QuestionResponse,
  QuizRequest,
  QuizResponse,
  ReorderItem,
} from '@/features/quizzes/types/quiz.types';

export const quizzesApi = {
  /** Returns the lesson's quiz, or null when none is configured (404). */
  getByLesson: async (lessonId: string): Promise<QuizResponse | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<QuizResponse>>(
        `/admin/lessons/${lessonId}/quiz`,
      );
      return data.data;
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    }
  },

  upsert: async (lessonId: string, payload: QuizRequest): Promise<QuizResponse> => {
    const { data } = await apiClient.put<ApiResponse<QuizResponse>>(
      `/admin/lessons/${lessonId}/quiz`,
      payload,
    );
    return data.data;
  },

  remove: async (quizId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/quizzes/${quizId}`);
  },

  addQuestion: async (quizId: string, payload: QuestionRequest): Promise<QuestionResponse> => {
    const { data } = await apiClient.post<ApiResponse<QuestionResponse>>(
      `/admin/quizzes/${quizId}/questions`,
      payload,
    );
    return data.data;
  },

  updateQuestion: async (
    questionId: string,
    payload: QuestionRequest,
  ): Promise<QuestionResponse> => {
    const { data } = await apiClient.put<ApiResponse<QuestionResponse>>(
      `/admin/questions/${questionId}`,
      payload,
    );
    return data.data;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/questions/${questionId}`);
  },

  reorderQuestions: async (quizId: string, items: ReorderItem[]): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/admin/quizzes/${quizId}/questions/reorder`, {
      items,
    });
  },
};
