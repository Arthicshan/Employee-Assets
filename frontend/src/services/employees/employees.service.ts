import { apiClient } from '@/libs/api/api-client';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '@/types';

export const employeesService = {
  async getEmployees(): Promise<Employee[]> {
    return apiClient.get<Employee[]>('/employees');
  },

  async getEmployeeById(id: number): Promise<Employee> {
    return apiClient.get<Employee>(`/employees/${id}`);
  },

  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    return apiClient.post<Employee>('/employees', data);
  },

  async updateEmployee(id: number, data: UpdateEmployeeDto): Promise<Employee> {
    return apiClient.put<Employee>(`/employees/${id}`, data);
  },

  async deleteEmployee(id: number): Promise<void> {
    return apiClient.delete<void>(`/employees/${id}`);
  },
};

