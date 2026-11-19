import type { UserStatus } from '@/features/users/types/user.types';

export interface ParentStudentRef {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ParentResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: UserStatus;
  students: ParentStudentRef[];
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateParentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  studentId?: string;
}

export interface ParentsQuery {
  status?: UserStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}
