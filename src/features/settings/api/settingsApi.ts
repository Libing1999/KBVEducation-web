import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  PublicSettings,
  SystemSettings,
  UpdateSystemSettingsRequest,
} from '@/features/settings/types/settings.types';

export const settingsApi = {
  get: async (): Promise<SystemSettings> => {
    const { data } = await apiClient.get<ApiResponse<SystemSettings>>('/admin/settings');
    return data.data;
  },

  update: async (payload: UpdateSystemSettingsRequest): Promise<SystemSettings> => {
    const { data } = await apiClient.put<ApiResponse<SystemSettings>>('/admin/settings', payload);
    return data.data;
  },

  getPublic: async (): Promise<PublicSettings> => {
    const { data } = await apiClient.get<ApiResponse<PublicSettings>>('/settings/public');
    return data.data;
  },
};
