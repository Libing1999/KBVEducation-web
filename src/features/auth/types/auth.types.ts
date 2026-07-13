export type Role = 'SUPER_ADMIN' | 'STUDENT' | 'PARENT';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Shape returned by POST /api/auth/login. */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
  user: AuthUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
