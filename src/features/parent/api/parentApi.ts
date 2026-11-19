import { apiClient } from '@/lib/apiClient';
import type { ApiResponse } from '@/types/api';
import type { ParentChild, ParentMessage, ParentSummary } from '@/features/parent/types/parent.types';

export const parentApi = {
  summary: async (studentId?: string): Promise<ParentSummary> => {
    const { data } = await apiClient.get<ApiResponse<ParentSummary>>('/parent/summary', {
      params: studentId ? { studentId } : undefined,
    });
    return data.data;
  },

  /**
   * "Messages from Bhavya". Backed by the shared messaging system (also used by the
   * Student Leaderboard's "Live Action" drawer) — see useParentMessages for why this
   * call's failure/empty result is still handled gracefully regardless.
   */
  messages: async (studentId?: string): Promise<ParentMessage[]> => {
    const { data } = await apiClient.get<ApiResponse<ParentMessage[]>>('/parent/messages', {
      params: studentId ? { studentId } : undefined,
    });
    return data.data;
  },

  /** All children linked to this parent, oldest-linked first — for the child selector. */
  children: async (): Promise<ParentChild[]> => {
    const { data } = await apiClient.get<ApiResponse<ParentChild[]>>('/parent/summary/children');
    return data.data;
  },
};
