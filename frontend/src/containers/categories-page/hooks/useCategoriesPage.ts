'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoriesService } from '@/services/categories/categories.service';
import { AssetCategory, CreateCategoryDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';
import { toast } from '@/components/Toast';

export function useCategoriesPage() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AssetCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    description: '',
    active: true,
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : undefined) || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchCategories(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchCategories]);

  const openCreateModal = () => {
    setFormData({ name: '', description: '', active: true });
    setError(null);
    setValidationErrors([]);
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: AssetCategory) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '', active: cat.active });
    setError(null);
    setValidationErrors([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setValidationErrors([]);

    try {
      if (editingCategory) {
        await categoriesService.updateCategory(editingCategory.id, formData);
        toast.success(`Category "${formData.name}" updated successfully`);
        setEditingCategory(null);
      } else {
        await categoriesService.createCategory(formData);
        toast.success(`Category "${formData.name}" created successfully`);
        setIsCreateOpen(false);
      }
      await fetchCategories();
    } catch (err: unknown) {
      const msg = (err instanceof ApiError ? err.message : undefined) || (err instanceof Error ? err.message : undefined) || 'Failed to save category';
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(msg);
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await categoriesService.deleteCategory(deletingCategory.id);
      toast.success(`Category "${deletingCategory.name}" deleted successfully`);
      setDeletingCategory(null);
      await fetchCategories();
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : undefined) || 'Failed to delete category';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    categories,
    isLoading,
    error,
    validationErrors,
    isCreateOpen,
    setIsCreateOpen,
    editingCategory,
    setEditingCategory,
    deletingCategory,
    setDeletingCategory,
    formData,
    setFormData,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
    refresh: fetchCategories,
  };
}
