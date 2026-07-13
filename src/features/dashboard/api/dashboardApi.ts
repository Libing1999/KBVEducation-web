import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { AdminDashboard, ScoreDashboard } from '@/features/dashboard/types/dashboard.types';

export const dashboardApi = {
  admin: async (): Promise<AdminDashboard> => {
    const { data } = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return data.data;
  },

  me: async (): Promise<ScoreDashboard> => {
    const { data } = await apiClient.get<ApiResponse<ScoreDashboard>>('/dashboard/me');
    return data.data;
  },
};
