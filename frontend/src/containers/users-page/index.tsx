'use client';

import React from 'react';
import { useUsersPage } from './hooks/useUsersPage';
import { Table, Column } from '@/components/Table';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Badge } from '@/components/Badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertCircle,
  Shield,
  Briefcase,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { SystemUser } from '@/types';
import { useSession } from '@/libs/api/use-session';

export const UsersPageContainer: React.FC = () => {
  const currentLoggedInUser = useSession();
  const {
    users,
    isLoading,
    error,
    validationErrors,
    search,
    setSearch,
    isCreateOpen,
    setIsCreateOpen,
    editingUser,
    setEditingUser,
    deletingUser,
    setDeletingUser,
    formData,
    setFormData,
    fieldErrors,
    handleFieldChange,
    handleFieldBlur,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSave,
    handleToggleStatus,
    handleDelete,
  } = useUsersPage();

  const columns: Column<SystemUser>[] = [
    {
      header: 'User Name',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/10">
            {row.firstName?.[0] || 'U'}
            {row.lastName?.[0] || ''}
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-tight">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'User Position',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-800 text-xs">
            {row.position || (
              <span className="text-slate-400 italic">Not Assigned</span>
            )}
          </span>
        </div>
      ),
    },
    {
      header: 'System Role',
      accessor: (row) => (
        <Badge
          variant={
            row.role === 'ADMIN'
              ? 'blue'
              : row.role === 'MANAGER'
              ? 'warning'
              : 'neutral'
          }
          size="sm"
        >
          <Shield className="w-3 h-3 mr-1" />
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Active Status',
      accessor: (row) =>
        row.role === 'ADMIN' ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 select-none cursor-default"
            title="Admin account is permanently active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Active</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              row.isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title="Click to toggle Active / Deactive status"
          >
            {row.isActive ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active</span>
                <ToggleRight className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Deactive</span>
                <ToggleLeft className="w-3.5 h-3.5 text-rose-600 ml-0.5" />
              </>
            )}
          </button>
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => openEditModal(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
            title="Edit User Position & Role"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {currentLoggedInUser?.id !== row.id && row.role !== 'ADMIN' && (
            <button
              onClick={() => setDeletingUser(row)}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600" />
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system user accounts, edit job positions, and control active/deactive status
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, position, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No system users found matching your criteria."
      />

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingUser}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `Edit User (${editingUser.firstName} ${editingUser.lastName})` : 'Create System User'}
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
              label="First Name"
              required
              placeholder="e.g. Sarah"
              value={formData.firstName}
              error={fieldErrors.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
            />
            <Input
              label="Last Name"
              required
              placeholder="e.g. Connor"
              value={formData.lastName}
              error={fieldErrors.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="e.g. user@assetflow.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label={editingUser ? 'Password (Leave blank to keep unchanged)' : 'Initial Password'}
              type="password"
              required={!editingUser}
              placeholder={editingUser ? '••••••••' : 'Enter temporary password'}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="User Position / Job Title"
              required
              placeholder="e.g. Senior Systems Lead, Asset Manager, IT Support"
              value={formData.position || ''}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <Select
              label="System Role"
              required
              options={[
                { label: 'ADMIN — Full System Access', value: 'ADMIN' },
                { label: 'MANAGER — Operational & Assignment Access', value: 'MANAGER' },
                { label: 'EMPLOYEE — Self-Service Portal Access', value: 'EMPLOYEE' },
              ]}
              value={formData.role || 'EMPLOYEE'}
              onChange={(e) => {
                const nextRole = e.target.value as 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
                setFormData({
                  ...formData,
                  role: nextRole,
                  isActive: nextRole === 'ADMIN' ? true : formData.isActive,
                });
              }}
            />
          </div>

          {/* Active / Deactive Switch */}
          {editingUser?.role === 'ADMIN' || formData.role === 'ADMIN' ? (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Account Access Status</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Admin accounts have permanent system access and cannot be deactivated.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="text-xs font-semibold text-slate-800">Account Access Status</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formData.isActive !== false
                    ? 'User is active and allowed to sign in to the platform.'
                    : 'User is deactivated and blocked from authentication.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    isActive: formData.isActive === false ? true : false,
                  })
                }
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  formData.isActive !== false
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {formData.isActive !== false ? 'Active' : 'Deactive'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingUser(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingUser ? 'Update User Position & Access' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete the user account for "${deletingUser?.firstName} ${deletingUser?.lastName}" (${deletingUser?.email})? This action cannot be undone.`}
        confirmLabel="Delete User"
        isLoading={isSubmitting}
      />
    </div>
  );
};
