import { isAxiosError } from 'axios';
import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  HomeworkSubmissionResponse,
  QuizSubmissionResult,
  StudentLessonDetailResponse,
  StudentLessonResponse,
  StudentQuizResponse,
  SubmitAnswer,
} from '@/features/learn/types/learn.types';

export const learnApi = {
  myLessons: async (page = 0, size = 50): Promise<PageResponse<StudentLessonResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<StudentLessonResponse>>>(
      '/student/lessons',
      { params: { page, size } },
    );
    return data.data;
  },

  lessonDetail: async (id: string): Promise<StudentLessonDetailResponse> => {
    const { data } = await apiClient.get<ApiResponse<StudentLessonDetailResponse>>(
      `/student/lessons/${id}`,
    );
    return data.data;
  },

  lessonFileDownloadUrl: (lessonId: string, fileId: string): string =>
    `/student/lessons/${lessonId}/files/${fileId}/download`,

  takeQuiz: async (quizId: string): Promise<StudentQuizResponse> => {
    const { data } = await apiClient.get<ApiResponse<StudentQuizResponse>>(
      `/student/quizzes/${quizId}`,
    );
    return data.data;
  },

  submitQuiz: async (quizId: string, answers: SubmitAnswer[]): Promise<QuizSubmissionResult> => {
    const { data } = await apiClient.post<ApiResponse<QuizSubmissionResult>>(
      `/student/quizzes/${quizId}/submit`,
      { answers },
    );
    return data.data;
  },

  // --- homework ---
  /** My submission for a lesson, or null when nothing has been submitted yet (404). */
  mySubmission: async (lessonId: string): Promise<HomeworkSubmissionResponse | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<HomeworkSubmissionResponse>>(
        `/student/homework/${lessonId}`,
      );
      return data.data;
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) return null;
      throw e;
    }
  },

  submitHomework: async (
    lessonId: string,
    files: File[],
    note?: string,
  ): Promise<HomeworkSubmissionResponse> => {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    if (note && note.trim()) form.append('note', note.trim());
    const { data } = await apiClient.post<ApiResponse<HomeworkSubmissionResponse>>(
      `/student/homework/${lessonId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  submissionFileDownloadUrl: (fileId: string): string =>
    `/student/homework/files/${fileId}/download`,
};
