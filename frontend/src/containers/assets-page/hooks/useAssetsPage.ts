'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { employeesService } from '@/services/employees/employees.service';
import { Employee } from '@/types';
import { assetsService } from '@/services/assets/assets.service';
import { categoriesService } from '@/services/categories/categories.service';
import { Asset, AssetCategory, CreateAssetDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';
import { toast } from '@/components/Toast';

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

    try {
      if (editingAsset) {
        await assetsService.updateAsset(editingAsset.id, formData);
        setEditingAsset(null);
        toast.success(`Asset "${formData.name}" updated successfully`);
      } else {
        await assetsService.createAsset(formData);
        setIsCreateOpen(false);
        toast.success(`Asset "${formData.name}" registered successfully`);
      }
      await fetchAssets();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
        toast.error(err.message, 'Validation Failed');
      } else {
        const msg = (err instanceof Error ? err.message : undefined) || 'Failed to save asset';
        setError(msg);
        toast.error(msg, 'Save Error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAsset) return;
    if (deletingAsset.status === 'under_repair') {
      toast.error('Assets currently under repair cannot be deleted or retired');
      setDeletingAsset(null);
      return;
    }
    if (deletingAsset.status === 'assigned') {
      toast.error('Assigned assets cannot be deleted or retired. Please return the asset first');
      setDeletingAsset(null);
      return;
    }
    if (deletingAsset.status === 'retired') {
      toast.error('Asset is already retired');
      setDeletingAsset(null);
      return;
    }
    const assetName = deletingAsset.name;
    setIsSubmitting(true);
    try {
      await assetsService.deleteAsset(deletingAsset.id);
      setDeletingAsset(null);
      toast.success(`Asset "${assetName}" retired successfully`);
      await fetchAssets();
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : undefined) || 'Failed to retire asset';
      setError(msg);
      toast.error(msg, 'Retire Error');
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
