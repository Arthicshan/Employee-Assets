export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface UserProfile {
  id: number;
  email: string;
  role: UserRole;
  employeeId?: number | null;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

