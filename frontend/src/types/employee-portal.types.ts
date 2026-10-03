import { Employee } from './employee.types';
import { Asset } from './asset.types';
import { AssetAssignment } from './assignment.types';

export interface EmployeeHistoryItem {
  id: number;
  action: string;
  notes?: string | null;
  createdAt: string;
  asset?: {
    id: number;
    name: string;
    assetTag: string;
    category?: string;
  };
}

export interface EmployeeDashboardData {
  profile: Employee;
  assignedAssets: Asset[];
  assignments: AssetAssignment[];

  history: EmployeeHistoryItem[];
  metrics: {
    currentlyAssignedCount: number;
    totalAssignmentsCount: number;
    isActive: boolean;
  };
}
