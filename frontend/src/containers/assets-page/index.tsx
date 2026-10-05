'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAssetsPage } from './hooks/useAssetsPage';
import { Table, Column } from '@/components/Table';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { StatusBadge } from '@/components/Badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Boxes, Plus, Pencil, Trash2, Search, AlertCircle, Eye } from 'lucide-react';
import { assetsService } from '@/services/assets/assets.service';
import { Asset } from '@/types';
import { sessionManager } from '@/libs/api/session-storage';

export const AssetsPageContainer: React.FC = () => {
  const router = useRouter();
  const isAdmin = sessionManager.getUser()?.role === 'ADMIN';
  const {
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
    handleDelete, refresh,
  } = useAssetsPage();

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Available', value: 'available' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'Damaged', value: 'damaged' },
    { label: 'Under Repair', value: 'under_repair' },
    { label: 'Lost', value: 'lost' },
    { label: 'Retired', value: 'retired' },
  ];

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map((c) => ({ label: c.name, value: c.name })),
  ];

  const columns: Column<Asset>[] = [
    {
      header: 'Asset Tag',
      accessor: (row) => (
        <span className="font-mono font-bold text-indigo-600 bg-indigo-50/70 px-2.5 py-1 rounded-md text-xs border border-indigo-100">
          {row.assetTag}
        </span>
      ),
    },
    {
      header: 'Asset Name & Model',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.name}</p>
          <p className="text-xs text-slate-400">
            {[row.brand, row.model].filter(Boolean).join(' • ') || 'No brand/model specified'}
          </p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessor: (row) => <span className="font-medium text-slate-700">{row.category}</span>,
    },
    {
      header: 'Serial Number',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.serialNumber || <span className="italic text-slate-300">N/A</span>}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Assigned To',
      accessor: (row) => (
        <span className="text-xs">
          {row.employee ? (
            <span className="font-semibold text-slate-700">
              {row.employee.firstName} {row.employee.lastName}
            </span>
          ) : (
            <span className="text-slate-400 italic">None (In Stock)</span>
          )}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/assets/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
            title="View Details & History"
          >
            <Eye className="w-4 h-4" />
          </button>
          {!isAdmin && (
            <Select aria-label="Change asset status" value={row.status} options={statusOptions.filter(o => o.value && (o.value !== 'assigned' || row.status === 'assigned'))} onChange={async e => {
              try { await assetsService.changeStatus(row.id, e.target.value); await refresh(); }
              catch (error) { window.alert(error instanceof Error ? error.message : 'Unable to change status'); }
            }} />
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => openEditModal(row)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                title="Edit Asset"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {row.status === 'under_repair' ? (
                <button
                  type="button"
                  disabled
                  className="p-1.5 text-slate-300 cursor-not-allowed rounded-md transition-colors"
                  title="Cannot delete or retire asset while under repair"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : row.status === 'assigned' ? (
                <button
                  type="button"
                  disabled
                  className="p-1.5 text-slate-300 cursor-not-allowed rounded-md transition-colors"
                  title="Cannot delete or retire assigned asset. Please return it first"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : row.status === 'retired' ? (
                <button
                  type="button"
                  disabled
                  className="p-1.5 text-slate-300 cursor-not-allowed rounded-md transition-colors"
                  title="Asset is already retired"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setDeletingAsset(row)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  title="Retire Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-indigo-600" />
            Asset Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, register, and inspect company equipment lifecycle
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Register Asset
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tag, name, brand, model or serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-48">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
          <div className="w-full md:w-44">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Select label="Assigned Employee" value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} options={[{label: 'All Employees', value: ''}, ...employees.map(e => ({label: `${e.firstName} ${e.lastName} (${e.employeeNo})`, value: String(e.id)}))]} />
      {/* Table */}
      <Table
        columns={columns}
        data={assets}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => router.push(`/assets/${item.id}`)}
        emptyMessage="No assets match your search or filter criteria."
      />

      {/* Add / Edit Asset Modal */}
      {isAdmin && (
        <Modal
          isOpen={isCreateOpen || !!editingAsset}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingAsset(null);
          }}
          title={editingAsset ? `Edit Asset (${editingAsset.assetTag})` : 'Register New Asset'}
          maxWidth="lg"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Asset Tag"
                required
                placeholder="e.g. LAP-0012"
                value={formData.assetTag}
                onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              />
              <Input
                label="Asset Name"
                required
                placeholder="e.g. Dell Latitude 5450"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Category"
                required
                placeholder="Select category..."
                options={categories.filter(c => c.active || c.name === editingAsset?.category).map((c) => ({ label: c.name, value: c.name }))}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <Input
                label="Serial Number (Optional)"
                placeholder="e.g. SN-5450-0012"
                value={formData.serialNumber || ''}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Brand"
                placeholder="e.g. Dell, Apple, Lenovo"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
              <Input
                label="Model"
                placeholder="e.g. Latitude 5450, M3 Max"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Status"
                options={[
                  { label: 'Available', value: 'available' },
                  ...(editingAsset?.status === 'assigned' ? [{label: 'Assigned', value: 'assigned'}] : []),
                  { label: 'Damaged', value: 'damaged' },
                  { label: 'Under Repair', value: 'under_repair' },
                  { label: 'Lost', value: 'lost' },
                  ...(editingAsset?.status !== 'under_repair' && editingAsset?.status !== 'assigned' ? [{ label: 'Retired', value: 'retired' }] : []),
                ]}
                value={formData.status || 'available'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
              <Input
                label="Purchase Date (Optional)"
                type="date"
                value={formData.purchaseDate || ''}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Condition" options={['NEW','GOOD','FAIR','DAMAGED'].map(value => ({label: value, value}))} value={formData.condition || 'GOOD'} onChange={e => setFormData({...formData, condition: e.target.value as Asset['condition']})} />
              <Input label="Purchase Price" type="number" min="0" step="0.01" value={formData.purchasePrice ?? ''} onChange={e => setFormData({...formData, purchasePrice: e.target.value ? Number(e.target.value) : undefined})} />
              <Input label="Warranty Expiry" type="date" value={formData.warrantyExpiryDate || ''} onChange={e => setFormData({...formData, warrantyExpiryDate: e.target.value})} />
              <Input label="Notes" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingAsset(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {editingAsset ? 'Update Asset' : 'Register Asset'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {isAdmin && (
        <ConfirmDialog
          isOpen={!!deletingAsset}
          onClose={() => setDeletingAsset(null)}
          onConfirm={handleDelete}
          title="Retire Asset"
          message={`Are you sure you want to retire "${deletingAsset?.name}" (${deletingAsset?.assetTag})? The asset and its history will remain in the inventory.`}
          confirmLabel="Retire Asset"
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};
