'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetsService } from '@/services/assets/assets.service';
import { Asset, AssetHistory } from '@/types';

export function useAssetDetailPage(id: number) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetAndHistory = useCallback(async () => {
    if (!id || isNaN(id)) return;
    setIsLoading(true);
    setError(null);
    try {
      const [assetData, historyData] = await Promise.all([
        assetsService.getAssetById(id),
        assetsService.getAssetHistory(id),
      ]);
      setAsset(assetData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load asset details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetAndHistory();
  }, [fetchAssetAndHistory]);

  return {
    asset,
    history,
    isLoading,
    error,
    refresh: fetchAssetAndHistory,
  };
}
