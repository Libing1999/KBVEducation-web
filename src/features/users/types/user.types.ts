import type { Role } from '@/features/auth/types/auth.types';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UsersQuery {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}
