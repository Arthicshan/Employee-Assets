import { apiClient } from '@/libs/api/api-client';
import { SystemUser, CreateSystemUserDto, UpdateSystemUserDto } from '@/types';

export const usersService = {
  async getUsers(): Promise<SystemUser[]> {
    return apiClient.get<SystemUser[]>('/users');
  },

  async getUserById(id: number): Promise<SystemUser> {
    return apiClient.get<SystemUser>(`/users/${id}`);
  },

  async createUser(data: CreateSystemUserDto): Promise<SystemUser> {
    return apiClient.post<SystemUser>('/users', data);
  },

  async updateUser(id: number, data: UpdateSystemUserDto): Promise<SystemUser> {
    return apiClient.patch<SystemUser>(`/users/${id}`, data);
  },

  async toggleStatus(id: number): Promise<SystemUser> {
    return apiClient.patch<SystemUser>(`/users/${id}/status`);
  },

  async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`);
  },
};
