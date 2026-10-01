import { apiClient } from '@/libs/api/api-client';
import { AssetAssignment, CreateAssignmentDto, PaginatedResponse } from '@/types';

export const assignmentsService = {
  async getAssignments(params?: {
    status?: string;
    assetId?: number;
    employeeId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AssetAssignment>> {
    return apiClient.get<PaginatedResponse<AssetAssignment>>('/assignments', params);
  },

  async createAssignment(data: CreateAssignmentDto): Promise<AssetAssignment> {
    return apiClient.post<AssetAssignment>('/assignments', data);
  },
};

