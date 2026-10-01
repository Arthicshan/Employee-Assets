export interface AssetCategory {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  active?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  active?: boolean;
}

