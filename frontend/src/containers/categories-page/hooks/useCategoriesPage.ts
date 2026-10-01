'use client';

import { useState, useEffect, useCallback } from 'react';
import { categoriesService } from '@/services/categories/categories.service';
import { AssetCategory, CreateCategoryDto } from '@/types';
import { ApiError } from '@/libs/api/api-error';

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
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setFormData({ name: '', description: '' });
    setError(null);
    setValidationErrors([]);
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: AssetCategory) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description || '' });
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
        setEditingCategory(null);
      } else {
        await categoriesService.createCategory(formData);
        setIsCreateOpen(false);
      }
      await fetchCategories();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.validationErrors) setValidationErrors(err.validationErrors);
      } else {
        setError(err?.message || 'Failed to save category');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsSubmitting(true);
    try {
      await categoriesService.deleteCategory(deletingCategory.id);
      setDeletingCategory(null);
      await fetchCategories();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete category');
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
