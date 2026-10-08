'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEmployeesPage } from './hooks/useEmployeesPage';
import { Table, Column } from '@/components/Table';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Users, Plus, Pencil, Trash2, Search, AlertCircle, Eye } from 'lucide-react';
import { Employee } from '@/types';
import { sessionManager } from '@/libs/api/session-storage';

export const EmployeesPageContainer: React.FC = () => {
  const router = useRouter();
  const isAdmin = sessionManager.getUser()?.role === 'ADMIN';
  const {

    employees, departments, departmentFilter, setDepartmentFilter, activeFilter, setActiveFilter,
    isLoading,
    error,
    validationErrors,
    search,
    setSearch,
    isCreateOpen,
    setIsCreateOpen,
    editingEmployee,
    setEditingEmployee,
    deletingEmployee,
    setDeletingEmployee,
    formData,
    setFormData,
    fieldErrors,
    handleFieldChange,
    handleFieldBlur,
    isSubmitting,
    openCreateModal,
    openEditModal,
    handleSave,
    handleDelete,
  } = useEmployeesPage();

  const columns: Column<Employee>[] = [
    {
      header: 'Employee No',
      accessor: (row) => (
        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
          {row.employeeNo}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {row.department}
        </span>
      ),
    },
    {
      header: 'Position / Designation',
      accessor: (row) => <span className="text-xs text-slate-600 font-medium">{row.position}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            row.isActive !== false
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {row.isActive !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => router.push(`/employees/${row.id}`)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
            title="View Details & Assigned Assets"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => openEditModal(row)}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                title="Edit Employee"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeletingEmployee(row)}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Delete Employee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
            <Users className="w-6 h-6 text-blue-600" />
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Maintain employee records, department assignments, and equipment custody
          </p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Employee
          </Button>
        )}
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
            placeholder="Search by employee ID, name, email, department, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex gap-3">
        <Select aria-label="Employee Status" value={activeFilter} onChange={e => setActiveFilter(e.target.value)} options={[{label: 'All Statuses', value: ''}, {label:'Active', value:'ACTIVE'}, {label:'Inactive', value:'INACTIVE'}]} />
        <Select aria-label="Employee Department" value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)} options={[{label:'All Departments',value:''}, ...departments.map(value => ({label:value,value}))]} />
      </div>
      <Table
        columns={columns}
        data={employees}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={(item) => router.push(`/employees/${item.id}`)}
        emptyMessage="No employees found matching your query."
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingEmployee}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? `Edit Employee (${editingEmployee.employeeNo})` : 'Add New Employee'}
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
              label="Employee No / Code"
              required
              placeholder="e.g. EMP-001"
              value={formData.employeeNo}
              onChange={(e) => setFormData({ ...formData, employeeNo: e.target.value })}
            />
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="e.g. employee@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              placeholder="e.g. Alice"
              value={formData.firstName}
              error={fieldErrors.firstName}
              onChange={(e) => handleFieldChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
            />
            <Input
              label="Last Name"
              required
              placeholder="e.g. Johnson"
              value={formData.lastName}
              error={fieldErrors.lastName}
              onChange={(e) => handleFieldChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department"
              required
              placeholder="e.g. Engineering, Design, HR"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <Input
              label="Position / Designation"
              required
              placeholder="e.g. Senior Software Engineer"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
            <div>
              <p className="text-xs font-semibold text-slate-800">Employment Status</p>
              <p className="text-[11px] text-slate-500">
                {formData.isActive !== false
                  ? 'Active employee (eligible to receive equipment assignments)'
                  : 'Inactive employee (blocked from receiving new assignments)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: formData.isActive === false ? true : false })}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                formData.isActive !== false
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {formData.isActive !== false ? 'Active' : 'Inactive'}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingEmployee(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingEmployee ? 'Update Employee' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDelete}
        title="Delete Employee Record"
        message={`Are you sure you want to delete ${deletingEmployee?.firstName} ${deletingEmployee?.lastName} (${deletingEmployee?.employeeNo})? Any assigned assets will need reassignment.`}
        confirmLabel="Delete Employee"
        isLoading={isSubmitting}
      />
    </div>
  );
};
