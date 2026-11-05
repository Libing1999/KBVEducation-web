import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  AiSettings,
  AiStatus,
  MorningDashboard,
  PracticeAiCard,
  ReferencePackVersion,
  ReflectionAiCard,
  UpdateAiSettingsInput,
} from '@/features/ai/types/ai.types';

/** Admin-only AI endpoints. */
export const aiApi = {
  getSettings: async (): Promise<AiSettings> => {
    const { data } = await apiClient.get<ApiResponse<AiSettings>>('/admin/ai/settings');
    return data.data;
  },

  updateSettings: async (payload: UpdateAiSettingsInput): Promise<AiSettings> => {
    const { data } = await apiClient.put<ApiResponse<AiSettings>>('/admin/ai/settings', payload);
    return data.data;
  },

  status: async (): Promise<AiStatus> => {
    const { data } = await apiClient.get<ApiResponse<AiStatus>>('/admin/ai/status');
    return data.data;
  },

  runNow: async (): Promise<void> => {
    await apiClient.post('/admin/ai/run-now');
  },

  morning: async (date?: string): Promise<MorningDashboard> => {
    const { data } = await apiClient.get<ApiResponse<MorningDashboard>>('/admin/ai/morning', {
      params: date ? { date } : undefined,
    });
    return data.data;
  },

  // --- reference pack ---

  packVersions: async (): Promise<ReferencePackVersion[]> => {
    const { data } = await apiClient.get<ApiResponse<ReferencePackVersion[]>>('/admin/ai/reference-pack/versions');
    return data.data;
  },

  activePack: async (): Promise<ReferencePackVersion | null> => {
    const { data } = await apiClient.get<ApiResponse<ReferencePackVersion | null>>('/admin/ai/reference-pack/active');
    return data.data ?? null;
  },

  packVersion: async (id: string): Promise<ReferencePackVersion> => {
    const { data } = await apiClient.get<ApiResponse<ReferencePackVersion>>(`/admin/ai/reference-pack/versions/${id}`);
    return data.data;
  },

  uploadPackFiles: async (files: File[], note?: string): Promise<ReferencePackVersion> => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    const { data } = await apiClient.post<ApiResponse<ReferencePackVersion>>('/admin/ai/reference-pack/files', form, {
      params: note ? { note } : undefined,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  savePackFile: async (fileName: string, content: string, note?: string): Promise<ReferencePackVersion> => {
    const { data } = await apiClient.put<ApiResponse<ReferencePackVersion>>('/admin/ai/reference-pack/files', {
      fileName,
      content,
      note,
    });
    return data.data;
  },

  deletePackFile: async (fileName: string): Promise<ReferencePackVersion> => {
    const { data } = await apiClient.delete<ApiResponse<ReferencePackVersion>>(
      `/admin/ai/reference-pack/files/${encodeURIComponent(fileName)}`,
    );
    return data.data;
  },

  activatePackVersion: async (id: string): Promise<ReferencePackVersion> => {
    const { data } = await apiClient.post<ApiResponse<ReferencePackVersion>>(
      `/admin/ai/reference-pack/versions/${id}/activate`,
    );
    return data.data;
  },

  // --- per item ---

  practiceCard: async (sessionId: string): Promise<PracticeAiCard> => {
    const { data } = await apiClient.get<ApiResponse<PracticeAiCard>>(`/admin/practice/${sessionId}/ai`);
    return data.data;
  },

  reanalysePractice: async (sessionId: string): Promise<void> => {
    await apiClient.post(`/admin/practice/${sessionId}/ai/reanalyse`);
  },

  reflectionCard: async (reflectionId: string): Promise<ReflectionAiCard> => {
    const { data } = await apiClient.get<ApiResponse<ReflectionAiCard>>(`/admin/reflections/${reflectionId}/ai`);
    return data.data;
  },

  reanalyseReflection: async (reflectionId: string): Promise<void> => {
    await apiClient.post(`/admin/reflections/${reflectionId}/ai/reanalyse`);
  },
};
