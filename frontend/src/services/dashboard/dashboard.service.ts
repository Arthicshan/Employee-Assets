import { apiClient } from '@/libs/api/api-client';
import { DashboardSummary } from '@/types';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>('/dashboard/summary');
  },
};

