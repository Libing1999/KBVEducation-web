import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  CreatePracticeInput,
  PracticeSession,
  ReviewRequest,
} from '@/features/practice/types/practice.types';

export const practiceApi = {
  create: async (input: CreatePracticeInput, files: File[]): Promise<PracticeSession> => {
    const form = new FormData();
    form.append('studyDate', input.studyDate);
    form.append('subject', input.subject);
    form.append('durationMinutes', String(input.durationMinutes));
    form.append('studyType', input.studyType);
    if (input.notes) form.append('notes', input.notes);
    files.forEach((f) => form.append('files', f));
    const { data } = await apiClient.post<ApiResponse<PracticeSession>>('/student/practice', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  list: async (): Promise<PracticeSession[]> => {
    const { data } = await apiClient.get<ApiResponse<PracticeSession[]>>('/student/practice');
    return data.data;
  },

  get: async (id: string): Promise<PracticeSession> => {
    const { data } = await apiClient.get<ApiResponse<PracticeSession>>(`/student/practice/${id}`);
    return data.data;
  },

  fileDownloadUrl: (fileId: string): string => `/student/practice/files/${fileId}/download`,

  requestReview: async (id: string, reason: string): Promise<ReviewRequest> => {
    const { data } = await apiClient.post<ApiResponse<ReviewRequest>>(
      `/student/practice/${id}/review-request`,
      { reason },
    );
    return data.data;
  },
};
