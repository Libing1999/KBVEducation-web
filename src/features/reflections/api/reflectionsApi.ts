import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { AnswerInput, Reflection, TodayReflection } from '@/features/reflections/types/reflection.types';

function buildForm(answers: AnswerInput[], audio?: File | null, removeAudio?: boolean): FormData {
  const form = new FormData();
  form.append('answers', JSON.stringify(answers));
  if (audio) form.append('audio', audio);
  if (removeAudio) form.append('removeAudio', 'true');
  return form;
}

export const reflectionsApi = {
  getToday: async (): Promise<TodayReflection> => {
    const { data } = await apiClient.get<ApiResponse<TodayReflection>>('/student/reflections/today');
    return data.data;
  },

  list: async (): Promise<Reflection[]> => {
    const { data } = await apiClient.get<ApiResponse<Reflection[]>>('/student/reflections');
    return data.data;
  },

  submit: async (answers: AnswerInput[], audio?: File | null): Promise<Reflection> => {
    const { data } = await apiClient.post<ApiResponse<Reflection>>(
      '/student/reflections',
      buildForm(answers, audio),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  update: async (
    id: string,
    answers: AnswerInput[],
    audio?: File | null,
    removeAudio?: boolean,
  ): Promise<Reflection> => {
    const { data } = await apiClient.put<ApiResponse<Reflection>>(
      `/student/reflections/${id}`,
      buildForm(answers, audio, removeAudio),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  audioUrl: (id: string): string => `/student/reflections/${id}/audio`,
};
