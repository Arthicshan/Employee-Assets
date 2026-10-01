import { Asset } from './asset.types';
import { Employee } from './employee.types';

export interface AssetAssignment {
  id: number;
  assetId: number;
  employeeId: number;
  assignedAt: string;
  returnedAt?: string | null;
  notes?: string | null;
  status: 'ACTIVE' | 'RETURNED';
  createdAt: string;
  updatedAt: string;
  asset?: Asset;
  employee?: Employee;
}

export interface CreateAssignmentDto {
  assetId: number;
  employeeId: number;
  notes?: string;
}

export interface CreateReturnDto {
  assignmentId: number;
  condition: string;
  notes?: string;
}

