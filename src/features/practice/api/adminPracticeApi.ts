import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  AdminPracticeQuery,
  AdminUpdatePracticeInput,
  PracticeSession,
  ReviewRequest,
  ReviewRequestAdminSummary,
  ReviewRequestStatus,
} from '@/features/practice/types/practice.types';

export const adminPracticeApi = {
  list: async (query: AdminPracticeQuery): Promise<PageResponse<PracticeSession>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<PracticeSession>>>('/admin/practice', {
      params: buildParams(query),
    });
    return data.data;
  },

  get: async (id: string): Promise<PracticeSession> => {
    const { data } = await apiClient.get<ApiResponse<PracticeSession>>(`/admin/practice/${id}`);
    return data.data;
  },

  approve: async (id: string, comment?: string, overrideReason?: string): Promise<PracticeSession> => {
    const { data } = await apiClient.put<ApiResponse<PracticeSession>>(`/admin/practice/${id}/approve`, {
      comment,
      overrideReason,
    });
    return data.data;
  },

  reject: async (id: string, comment?: string, overrideReason?: string): Promise<PracticeSession> => {
    const { data } = await apiClient.put<ApiResponse<PracticeSession>>(`/admin/practice/${id}/reject`, {
      comment,
      overrideReason,
    });
    return data.data;
  },

  bulkApprove: async (ids: string[]): Promise<number> => {
    const { data } = await apiClient.post<ApiResponse<number>>('/admin/practice/bulk-approve', { ids });
    return data.data;
  },

  autoApproved: async (): Promise<PracticeSession[]> => {
    const { data } = await apiClient.get<ApiResponse<PracticeSession[]>>('/admin/practice/auto-approved');
    return data.data;
  },

  undoAutoApprove: async (id: string): Promise<PracticeSession> => {
    const { data } = await apiClient.put<ApiResponse<PracticeSession>>(`/admin/practice/${id}/undo-auto-approve`);
    return data.data;
  },

  update: async (id: string, payload: AdminUpdatePracticeInput): Promise<PracticeSession> => {
    const { data } = await apiClient.put<ApiResponse<PracticeSession>>(`/admin/practice/${id}`, payload);
    return data.data;
  },

  fileDownloadUrl: (fileId: string): string => `/admin/practice/files/${fileId}/download`,

  listReviewRequests: async (
    status: ReviewRequestStatus | undefined,
    page = 0,
    size = 20,
  ): Promise<PageResponse<ReviewRequestAdminSummary>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<ReviewRequestAdminSummary>>>(
      '/admin/practice/review-requests',
      { params: { status, page, size } },
    );
    return data.data;
  },

  approveRequest: async (id: string, notes?: string): Promise<ReviewRequest> => {
    const { data } = await apiClient.put<ApiResponse<ReviewRequest>>(
      `/admin/practice/review-requests/${id}/approve`,
      { notes },
    );
    return data.data;
  },

  rejectRequest: async (id: string, notes?: string): Promise<ReviewRequest> => {
    const { data } = await apiClient.put<ApiResponse<ReviewRequest>>(
      `/admin/practice/review-requests/${id}/reject`,
      { notes },
    );
    return data.data;
  },
};
