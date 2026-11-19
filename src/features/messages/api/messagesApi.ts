import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type { CoachMessage, SendMessageRequest, StudentMessage } from '@/features/messages/types/message.types';

export const messagesApi = {
  /** SUPER_ADMIN: compose/send a message to one student or an entire cohort. */
  send: async (payload: SendMessageRequest): Promise<CoachMessage> => {
    const { data } = await apiClient.post<ApiResponse<CoachMessage>>('/admin/messages', payload);
    return data.data;
  },

  /** SUPER_ADMIN: recently sent messages, newest first. */
  adminList: async (page: number, size: number): Promise<PageResponse<CoachMessage>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<CoachMessage>>>('/admin/messages', {
      params: buildParams({ page, size }),
    });
    return data.data;
  },

  /** STUDENT: my Live Action messages (individual + my cohort's collective), newest first. */
  myMessages: async (): Promise<StudentMessage[]> => {
    const { data } = await apiClient.get<ApiResponse<StudentMessage[]>>('/student/leaderboard/messages');
    return data.data;
  },

  /** STUDENT: mark one of my messages read. */
  markRead: async (id: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>(`/student/leaderboard/messages/${id}/read`);
  },
};
