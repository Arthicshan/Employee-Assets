'use client';

import React from 'react';
import { useCategoriesPage } from './hooks/useCategoriesPage';
import { Table, Column } from '@/components/Table';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Badge } from '@/components/Badge';
import { Layers, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { AssetCategory } from '@/types';
import { sessionManager } from '@/libs/api/session-storage';

export const CategoriesPageContainer: React.FC = () => {
  const isAdmin = sessionManager.getUser()?.role === 'ADMIN';
  const {

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
  } = useCategoriesPage();

  const columns: Column<AssetCategory>[] = [
    {
      header: 'Category Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.name}</p>
            <p className="text-[11px] text-slate-400">ID #{row.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: (row) => (
        <span className="text-slate-600">
          {row.description || <span className="text-slate-400 italic">No description</span>}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.active ? 'success' : 'neutral'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Created Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    ...(isAdmin
      ? [
          {
            header: 'Actions',
            className: 'text-right',
            accessor: (row: AssetCategory) => (
              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openEditModal(row)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  title="Edit Category"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingCategory(row)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            Asset Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize and classify equipment into standard groups (Laptops, Monitors, Phones, etc.)
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Category
          </Button>
        )}
      </div>


      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Categories Table */}
      <Table
        columns={columns}
        data={categories}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No asset categories registered yet."
      />

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingCategory}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Asset Category' : 'Create New Category'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
              {validationErrors.length > 0 && (
                <ul className="list-disc list-inside mt-1">
                  {validationErrors.map((v, i) => (
                    <li key={i}>{v}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <Input
            label="Category Name"
            required
            placeholder="e.g. Laptops, Displays, Audio"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
            <textarea
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 min-h-22.5"
              placeholder="Brief details about what falls under this classification"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingCategory(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? Assets under this category may be affected.`}
        confirmLabel="Delete Category"
        isLoading={isSubmitting}
      />
    </div>
  );
};

