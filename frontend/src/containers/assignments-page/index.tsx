'use client';

import React from 'react';
import { useAssignmentsPage } from './hooks/useAssignmentsPage';
import { Pagination } from '@/components/Pagination';
import { Table, Column } from '@/components/Table';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { StatusBadge } from '@/components/Badge';
import {
  ClipboardList,
  Plus,
  RotateCcw,
  AlertCircle,
  Boxes,
  ShieldAlert,
} from 'lucide-react';
import { AssetAssignment } from '@/types';

export const AssignmentsPageContainer: React.FC<{returnsView?: boolean}> = ({returnsView = false}) => {
  const {
    assignments, meta, setPage, search, setSearch, sortBy, setSortBy, sortOrder, setSortOrder,
    availableAssets,
    employees,
    isLoading,
    error,
    validationErrors,
    statusFilter,
    setStatusFilter,
    isAssignOpen,
    setIsAssignOpen,
    assignForm,
    setAssignForm,
    returnTarget,
    setReturnTarget,
    returnForm,
    setReturnForm,
    isSubmitting,
    openAssignModal,
    handleAssignSubmit,
    openReturnModal,
    handleReturnSubmit,
  } = useAssignmentsPage();

  const columns: Column<AssetAssignment>[] = [
    {header: 'Return Inspection', accessor: row => row.returnCondition ? <span>{row.returnCondition}{row.returnNotes && <span className="block text-xs text-slate-500">{row.returnNotes}</span>}</span> : '-'},
    {
      header: 'Assigned Equipment',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">{row.asset?.name || `Asset #${row.assetId}`}</p>
            <p className="font-mono text-xs text-indigo-600">{row.asset?.assetTag}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned To',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
            {row.employee?.firstName?.[0] || 'U'}
          </div>
          <div>
            <p className="font-semibold text-slate-800">
              {row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : 'N/A'}
            </p>
            <p className="text-[11px] text-slate-400">
              {row.employee?.department} &bull; {row.employee?.employeeNo}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Date',
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700">
          {new Date(row.assignedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Return Date',
      accessor: (row) => (
        <span className="text-xs text-slate-500">
          {row.returnedAt ? new Date(row.returnedAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Notes',
      accessor: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-xs block">
          {row.notes || <span className="italic text-slate-300">None</span>}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      accessor: (row) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openReturnModal(row)}
              className="text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Process Return
            </Button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Completed</span>
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
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            {returnsView ? "Asset Returns" : "Asset Assignments & Returns"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {returnsView ? "Receive assigned equipment and review return inspections" : "Assign available equipment to staff, track active custody, and process returns"}
          </p>
        </div>
        {!returnsView && <Button variant="primary" onClick={openAssignModal}>
          <Plus className="w-4 h-4 mr-1.5" />
          Assign Equipment
        </Button>}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <span className="font-semibold block">{error}</span>
            {validationErrors.length > 0 && (
              <ul className="list-disc list-inside mt-1 text-xs">
                {validationErrors.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Input aria-label="Search assignments" placeholder="Search equipment or employee..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select aria-label="Sort assignments" value={sortBy} onChange={e => setSortBy(e.target.value)} options={[{label:'Created Date',value:'createdAt'},{label:'Assigned Date',value:'assignedAt'},{label:'Return Date',value:'returnedAt'},{label:'Status',value:'status'}]} />
        <Select aria-label="Sort direction" value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')} options={[{label:'Descending',value:'desc'},{label:'Ascending',value:'asc'}]} />
      </div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {(['ACTIVE', 'RETURNED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === tab
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab === 'ACTIVE'
              ? 'Active Assignments'
              : tab === 'RETURNED'
              ? 'Returned Records'
              : 'All History'}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        paginate={false}
        sortable={false}
        data={assignments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage={`No ${statusFilter === 'ALL' ? '' : statusFilter.toLowerCase()} assignments found.`}
      />

      <Pagination meta={meta} onPageChange={setPage} />

      {/* Assign Equipment Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Available Equipment"
        maxWidth="lg"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs flex items-center gap-2">
            <Boxes className="w-4 h-4 shrink-0 text-indigo-600" />
            <span>
              Only assets with status <strong>AVAILABLE</strong> are listed for assignment.
            </span>
          </div>

          <Input label="Assigned Date (Optional)" type="datetime-local" value={assignForm.assignedAt || ''} onChange={e => setAssignForm({...assignForm, assignedAt: e.target.value})} />
          <Select
            label="Select Available Asset"
            required
            placeholder={availableAssets.length > 0 ? 'Choose an asset...' : 'No available assets'}
            options={availableAssets.map((a) => ({
              label: `${a.name} (${a.assetTag}) — ${a.category}`,
              value: a.id,
            }))}
            value={assignForm.assetId || ''}
            onChange={(e) => setAssignForm({ ...assignForm, assetId: Number(e.target.value) })}
          />

          <Select
            label="Assign to Employee"
            required
            placeholder={employees.length > 0 ? 'Choose an employee...' : 'No employees'}
            options={employees.map((e) => ({
              label: `${e.firstName} ${e.lastName} (${e.employeeNo}) — ${e.department}`,
              value: e.id,
            }))}
            value={assignForm.employeeId || ''}
            onChange={(e) => setAssignForm({ ...assignForm, employeeId: Number(e.target.value) })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Assignment Notes (Optional)</label>
            <textarea
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 min-h-20"
              placeholder="e.g. Issued for Q4 engineering project, desk workstation setup"
              value={assignForm.notes || ''}
              onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAssignOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={availableAssets.length === 0}
            >
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Process Return Modal */}
      <Modal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        title="Process Asset Return"
        maxWidth="md"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Equipment:</span>
              <span className="font-bold text-slate-800">
                {returnTarget?.asset?.name} ({returnTarget?.asset?.assetTag})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Returning Staff:</span>
              <span className="font-semibold text-slate-800">
                {returnTarget?.employee?.firstName} {returnTarget?.employee?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Since:</span>
              <span className="text-slate-600">
                {returnTarget ? new Date(returnTarget.assignedAt).toLocaleDateString() : ''}
              </span>
            </div>
          </div>

          <Input label="Returned Date (Optional)" type="datetime-local" value={returnForm.returnedAt || ''} onChange={e => setReturnForm({...returnForm, returnedAt: e.target.value})} />
          <Select
            label="Asset Return Condition"
            required
            options={[
              { label: 'Good (Ready for Reassignment)', value: 'GOOD' },
              { label: 'New / Like New', value: 'NEW' },
              { label: 'Fair (Usable, Minor Wear)', value: 'FAIR' },
              { label: 'Damaged (Requires Repair / Inspection)', value: 'DAMAGED' },
            ]}
            value={returnForm.condition}
            onChange={(e) => setReturnForm({ ...returnForm, condition: e.target.value })}
          />

          {returnForm.condition === 'DAMAGED' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Selecting <strong>Damaged</strong> will transition the asset status to <strong>DAMAGED</strong> instead of returning to stock.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Return Remarks / Condition Notes</label>
            <textarea
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 min-h-20"
              placeholder="e.g. Returned in good working condition, charger cable included"
              value={returnForm.notes || ''}
              onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReturnTarget(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Return
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
