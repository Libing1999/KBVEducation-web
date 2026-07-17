import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  AdminDashboard,
  AdminDashboardTrends,
  ScoreDashboard,
  TierDetail,
} from '@/features/dashboard/types/dashboard.types';

export const dashboardApi = {
  admin: async (): Promise<AdminDashboard> => {
    const { data } = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return data.data;
  },

  adminTrends: async (days: number): Promise<AdminDashboardTrends> => {
    const { data } = await apiClient.get<ApiResponse<AdminDashboardTrends>>('/admin/dashboard/trends', {
      params: { days },
    });
    return data.data;
  },

  me: async (): Promise<ScoreDashboard> => {
    const { data } = await apiClient.get<ApiResponse<ScoreDashboard>>('/dashboard/me');
    return data.data;
  },

  myTier: async (): Promise<TierDetail> => {
    const { data } = await apiClient.get<ApiResponse<TierDetail>>('/student/tier');
    return data.data;
  },
};
