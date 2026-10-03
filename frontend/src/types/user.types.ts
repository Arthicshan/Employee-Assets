import { UserRole } from './auth.types';

export interface SystemUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  position?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemUserDto {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  position?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateSystemUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role?: UserRole;
  isActive?: boolean;
}
