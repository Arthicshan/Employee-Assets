'use client';

import React from 'react';
import Link from 'next/link';
import { useEmployeeDetailPage } from './hooks/useEmployeeDetailPage';
import { StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  ArrowLeft,
  Users,
  Mail,
  Building,
  Briefcase,
  Boxes,
  Calendar,
  AlertCircle,
  RotateCw,
} from 'lucide-react';

interface EmployeeDetailPageProps {
  id: number;
}

export const EmployeeDetailPageContainer: React.FC<EmployeeDetailPageProps> = ({ id }) => {
  const { employee, assignments, isLoading, error, refresh } = useEmployeeDetailPage(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Loading employee details...</span>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Employee Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || `No employee with ID #${id}`}</p>
        <Link href="/employees" className="inline-block mt-4">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const pastAssignments = assignments.filter((a) => a.status === 'RETURNED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Employees</span>
        </Link>
        <Button variant="secondary" size="sm" onClick={refresh}>
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Employee Profile Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {employee.employeeNo}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Staff
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{employee.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> Department
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">{employee.department}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Position
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1">{employee.position}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5" /> Active Equipment
            </span>
            <p className="text-sm font-bold text-indigo-600 mt-1">
              {activeAssignments.length} asset{activeAssignments.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Member Since
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {new Date(employee.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Currently Assigned Assets */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-600" />
              Currently Assigned Equipment ({activeAssignments.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hardware and accessories actively held by this team member
            </p>
          </div>
          <Link href="/assignments">
            <Button variant="primary" size="sm">
              Assign Equipment
            </Button>
          </Link>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No active equipment currently assigned to this employee.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeAssignments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {a.asset?.assetTag}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1.5">{a.asset?.name}</h3>
                  <p className="text-xs text-slate-500">
                    Category: <span className="font-medium text-slate-700">{a.asset?.category}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Assigned: {new Date(a.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={a.asset?.status || 'assigned'} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Equipment History */}
      {pastAssignments.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800">Past Assignment History</h2>
          <div className="divide-y divide-slate-100">
            {pastAssignments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">
                    {p.asset?.name} ({p.asset?.assetTag})
                  </p>
                  <p className="text-slate-400">
                    Held from {new Date(p.assignedAt).toLocaleDateString()} to{' '}
                    {p.returnedAt ? new Date(p.returnedAt).toLocaleDateString() : 'Returned'}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
