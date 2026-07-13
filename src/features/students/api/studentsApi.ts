import { apiClient } from '@/lib/apiClient';
import { buildParams } from '@/lib/utils';
import type { ApiResponse } from '@/types/api';
import type { PageResponse } from '@/types/pagination';
import type {
  CreateStudentRequest,
  StudentResponse,
  StudentsQuery,
} from '@/features/students/types/student.types';
import type { UpdateUserRequest } from '@/features/users/types/user.types';

export const studentsApi = {
  list: async (query: StudentsQuery): Promise<PageResponse<StudentResponse>> => {
    const { data } = await apiClient.get<ApiResponse<PageResponse<StudentResponse>>>('/admin/students', {
      params: buildParams(query),
    });
    return data.data;
  },

  create: async (payload: CreateStudentRequest): Promise<StudentResponse> => {
    const { data } = await apiClient.post<ApiResponse<StudentResponse>>('/admin/students', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateUserRequest): Promise<StudentResponse> => {
    const { data } = await apiClient.put<ApiResponse<StudentResponse>>(`/admin/students/${id}`, payload);
    return data.data;
  },

  assignCohort: async (id: string, cohortId: string): Promise<StudentResponse> => {
    const { data } = await apiClient.post<ApiResponse<StudentResponse>>(`/admin/students/${id}/cohort`, {
      cohortId,
    });
    return data.data;
  },

  removeFromCohort: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/students/${id}/cohort`);
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/admin/students/${id}`);
  },
};
