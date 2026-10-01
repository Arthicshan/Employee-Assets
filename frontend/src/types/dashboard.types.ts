import { AssetAssignment } from './assignment.types';
import { AssetHistory } from './asset.types';

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface DashboardSummary {
  totalEmployees: number;
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  damagedAssets: number;
  totalCategories: number;
  byCategory: CategoryBreakdown[];
  recentAssignments: AssetAssignment[];
  recentActivity: AssetHistory[];
}

