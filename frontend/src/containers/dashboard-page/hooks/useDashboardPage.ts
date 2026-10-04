'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard/dashboard.service';
import { DashboardSummary } from '@/types';

export function useDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : undefined) || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchSummary(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchSummary]);

  return {
    summary,
    isLoading,
    error,
    refresh: fetchSummary,
  };
}
