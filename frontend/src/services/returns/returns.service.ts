import { apiClient } from '@/libs/api/api-client';
import { AssetAssignment, CreateReturnDto } from '@/types';

export const returnsService = {
  async createReturn(data: CreateReturnDto): Promise<AssetAssignment> {
    return apiClient.post<AssetAssignment>('/returns', data);
  },
};

