import { apiClient } from '@/libs/api/api-client';
import { AssetCategory, CreateCategoryDto, UpdateCategoryDto } from '@/types';

export const categoriesService = {
  async getCategories(params?: { search?: string; status?: string }): Promise<AssetCategory[]> {
    return apiClient.get<AssetCategory[]>('/categories', params);
  },

  async getCategoryById(id: number): Promise<AssetCategory> {
    return apiClient.get<AssetCategory>(`/categories/${id}`);
  },

  async createCategory(data: CreateCategoryDto): Promise<AssetCategory> {
    return apiClient.post<AssetCategory>('/categories', data);
  },

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<AssetCategory> {
    return apiClient.patch<AssetCategory>(`/categories/${id}`, data);
  },

  async deleteCategory(id: number): Promise<void> {
    return apiClient.delete<void>(`/categories/${id}`);
  },
};

