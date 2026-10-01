'use client';

import { useState, useEffect, useCallback } from 'react';
import { assetsService } from '@/services/assets/assets.service';
import { categoriesService } from '@/services/categories/categories.service';
import { Asset, AssetCategory, CreateAssetDto, UpdateAssetDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';

export function useAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm: CreateAssetDto = {
    assetTag: '',
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    status: 'available',
    purchaseDate: '',
  };
  const [formData, setFormData] = useState<CreateAssetDto>(initialForm);

  const fetchAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assetsService.getAssets({
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setAssets(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch assets');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    categoriesService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const openCreateModal = () => {
    setFormData(initialForm);
    setError(null);
    setValidationErrors([]);
    setIsCreateOpen(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      assetTag: asset.assetTag,
      name: asset.name,
      category: asset.category,
      brand: asset.brand || '',
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      status: asset.status,
      purchaseDate: asset.purchaseDate ? asset.purchaseDate.substring(0, 10) : '',
    });
    setError(null);
    setValidationErrors([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      if (editingAsset) {
        await assetsService.updateAsset(editingAsset.id, formData);
        setEditingAsset(null);
      } else {
        await assetsService.createAsset(formData);
        setIsCreateOpen(false);
      }
      await fetchAssets();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(err?.message || 'Failed to save asset');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAsset) return;
    setIsSubmitting(true);
    try {
      await assetsService.deleteAsset(deletingAsset.id);
      setDeletingAsset(null);
      await fetchAssets();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    assets,
    categories,
    isLoading,
    error,
    validationErrors,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    isCreateOpen,
    setIsCreateOpen,
    editingAsset,
    setEditingAsset,
    deletingAsset,
    setDeletingAsset,
    formData,
    setFormData,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
    refresh: fetchAssets,
  };
}
