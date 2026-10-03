import { apiClient } from '@/libs/api/api-client';
import { EmployeeDashboardData, Employee, Asset, AssetAssignment, EmployeeHistoryItem } from '@/types';

export const employeePortalService = {
  async getDashboard(): Promise<EmployeeDashboardData> {
    return apiClient.get<EmployeeDashboardData>('/employee-portal/dashboard');
  },

  async getProfile(): Promise<Employee> {
    return apiClient.get<Employee>('/employee-portal/profile');
  },

  async getMyAssets(): Promise<Asset[]> {
    return apiClient.get<Asset[]>('/employee-portal/assets');
  },

  async getMyAssignments(): Promise<AssetAssignment[]> {
    return apiClient.get<AssetAssignment[]>('/employee-portal/assignments');
  },


  async getMyHistory(): Promise<EmployeeHistoryItem[]> {
    return apiClient.get<EmployeeHistoryItem[]>('/employee-portal/history');
  },
};
