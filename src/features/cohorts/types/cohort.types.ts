export type CohortStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface CohortResponse {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  examDate?: string | null;
  status: CohortStatus;
  maxStudents: number;
  studentCount: number;
  createdAt: string;
}

export interface CohortRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  examDate?: string | null;
  status: CohortStatus;
  maxStudents: number;
}

export interface CohortsQuery {
  status?: CohortStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}
