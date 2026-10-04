'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { employeesService } from '@/services/employees/employees.service';
import { Employee } from '@/types';
import { assetsService } from '@/services/assets/assets.service';
import { categoriesService } from '@/services/categories/categories.service';
import { Asset, AssetCategory, CreateAssetDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';

export function useAssetsPage() {
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filters
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') ?? '');

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
    condition: 'GOOD',
    warrantyExpiryDate: '',
    notes: '',
  };
  const [formData, setFormData] = useState<CreateAssetDto>(initialForm);

  const requestVersion = useRef(0);
  const fetchAssets = useCallback(async () => {
    const version = ++requestVersion.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await assetsService.getAssets({
        employeeId: employeeFilter ? Number(employeeFilter) : undefined,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      if (version === requestVersion.current) setAssets(data);
    } catch (err: unknown) {
      if (version === requestVersion.current) setError((err instanceof Error ? err.message : undefined) || 'Failed to fetch assets');
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter, employeeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchAssets(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchAssets]);

  useEffect(() => {
    employeesService.getEmployees().then(setEmployees).catch(() => {});
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
      condition: asset.condition,
      purchasePrice: asset.purchasePrice ?? undefined,
      warrantyExpiryDate: asset.warrantyExpiryDate?.substring(0,10) || '',
      notes: asset.notes || '',
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

    if (formData.purchaseDate && formData.warrantyExpiryDate) {
      if (formData.warrantyExpiryDate < formData.purchaseDate) {
        const msg = 'Warranty expiry date cannot be earlier than purchase date';
        setError(msg);
        setValidationErrors([msg]);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (editingAsset) {
        await assetsService.updateAsset(editingAsset.id, formData);
        setEditingAsset(null);
      } else {
        await assetsService.createAsset(formData);
        setIsCreateOpen(false);
      }
      await fetchAssets();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError((err instanceof Error ? err.message : undefined) || 'Failed to save asset');
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
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : undefined) || 'Failed to delete asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    assets,
    employees, employeeFilter, setEmployeeFilter,
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
