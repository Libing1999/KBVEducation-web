import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  EmailSettings,
  SendTestEmailRequest,
  UpdateEmailSettingsRequest,
} from '@/features/settings/types/emailSettings.types';

export const emailSettingsApi = {
  get: async (): Promise<EmailSettings> => {
    const { data } = await apiClient.get<ApiResponse<EmailSettings>>('/admin/settings/email');
    return data.data;
  },

  update: async (payload: UpdateEmailSettingsRequest): Promise<EmailSettings> => {
    const { data } = await apiClient.put<ApiResponse<EmailSettings>>('/admin/settings/email', payload);
    return data.data;
  },

  sendTest: async (payload: SendTestEmailRequest): Promise<string> => {
    const { data } = await apiClient.post<ApiResponse<null>>('/admin/settings/email/test', payload);
    return data.message;
  },
};
