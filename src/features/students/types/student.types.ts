import type { UserStatus } from '@/features/users/types/user.types';
import type { CohortStatus } from '@/features/cohorts/types/cohort.types';

export interface StudentResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: UserStatus;
  cohort: { id: string; name: string; status: CohortStatus } | null;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cohortId?: string;
}

export interface StudentsQuery {
  status?: UserStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}
