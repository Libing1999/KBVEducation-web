import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { NotificationResponse } from '@/features/notifications/types/notification.types';

export const notificationsApi = {
  list: async (
    unreadOnly = false,
    page = 0,
    size = 20,
  ): Promise<PageResponse<NotificationResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<NotificationResponse>>>(
      '/notifications',
      { params: { unreadOnly, page, size } },
    );
    return data.data;
  },

  unreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiResponse<{ count: number }>>(
      '/notifications/unread-count',
    );
    return data.data.count;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch<ApiResponse<void>>('/notifications/read-all');
  },
};
