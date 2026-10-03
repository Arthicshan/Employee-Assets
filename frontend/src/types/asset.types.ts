import { Employee } from './employee.types';
import { AssetAssignment } from './assignment.types';

export type AssetStatus = 'available' | 'assigned' | 'damaged' | 'under_repair' | 'lost' | 'retired';
export type AssetCondition = 'NEW' | 'GOOD' | 'FAIR' | 'DAMAGED';

export interface AssetHistory {
  id: number;
  assetId: number;
  employeeId?: number | null;
  action: string;
  notes?: string | null;
  createdAt: string;
  employee?: Employee | null;
  asset?: Asset | null;
}

export interface Asset {
  id: number;
  assetTag: string;
  name: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  status: string;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  warrantyExpiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  employeeId?: number | null;
  employee?: Employee | null;
  assignments?: AssetAssignment[];
  history?: AssetHistory[];
}

export interface CreateAssetDto {
  assetTag: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status?: string;
  purchaseDate?: string;
  purchasePrice?: number | null;
  warrantyExpiryDate?: string;
}

export interface UpdateAssetDto {
  assetTag?: string;
  name?: string;
  category?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status?: string;
  purchaseDate?: string;
  purchasePrice?: number | null;
  warrantyExpiryDate?: string;
}


export interface AssetFilterParams {
  status?: string;
  category?: string;
  search?: string;
}

