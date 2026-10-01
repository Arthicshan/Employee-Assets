import { apiClient } from '@/libs/api/api-client';
import { Asset, AssetHistory, CreateAssetDto, UpdateAssetDto, AssetFilterParams } from '@/types';

export const assetsService = {
  async getAssets(filters?: AssetFilterParams): Promise<Asset[]> {
    return apiClient.get<Asset[]>('/assets', filters);
  },

  async getAssetById(id: number): Promise<Asset> {
    return apiClient.get<Asset>(`/assets/${id}`);
  },

  async createAsset(data: CreateAssetDto): Promise<Asset> {
    return apiClient.post<Asset>('/assets', data);
  },

  async updateAsset(id: number, data: UpdateAssetDto): Promise<Asset> {
    return apiClient.put<Asset>(`/assets/${id}`, data);
  },

  async deleteAsset(id: number): Promise<void> {
    return apiClient.delete<void>(`/assets/${id}`);
  },

  async getAssetHistory(id: number): Promise<AssetHistory[]> {
    return apiClient.get<AssetHistory[]>(`/assets/${id}/history`);
  },

  async assignToEmployee(assetId: number, employeeId: number): Promise<Asset> {
    return apiClient.patch<Asset>(`/assets/${assetId}/assign/${employeeId}`);
  },

  async unassignFromEmployee(assetId: number): Promise<Asset> {
    return apiClient.patch<Asset>(`/assets/${assetId}/unassign`);
  },
};

