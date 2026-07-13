import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  CohortRequest,
  CohortResponse,
  CohortsQuery,
} from '@/features/cohorts/types/cohort.types';
import type { StudentResponse } from '@/features/students/types/student.types';

export const cohortsApi = {
  list: async (query: CohortsQuery): Promise<PageResponse<CohortResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<CohortResponse>>>('/admin/cohorts', {
      params: buildParams(query),
    });
    return data.data;
  },

  create: async (payload: CohortRequest): Promise<CohortResponse> => {
    const { data } = await apiClient.post<ApiResponse<CohortResponse>>('/admin/cohorts', payload);
    return data.data;
  },

  update: async (id: string, payload: CohortRequest): Promise<CohortResponse> => {
    const { data } = await apiClient.put<ApiResponse<CohortResponse>>(`/admin/cohorts/${id}`, payload);
    return data.data;
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/cohorts/${id}`);
  },

  listStudents: async (id: string): Promise<StudentResponse[]> => {
    const { data } = await apiClient.get<ApiResponse<StudentResponse[]>>(`/admin/cohorts/${id}/students`);
    return data.data;
  },

  assignStudent: async (id: string, studentId: string): Promise<void> => {
    await apiClient.post<ApiResponse<CohortResponse>>(`/admin/cohorts/${id}/students/${studentId}`);
  },

  removeStudent: async (id: string, studentId: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/cohorts/${id}/students/${studentId}`);
  },
};
