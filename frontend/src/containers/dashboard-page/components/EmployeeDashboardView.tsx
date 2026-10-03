'use client';

import React, { useEffect, useState } from 'react';
import { employeePortalService } from '@/services/employee-portal/employee-portal.service';
import { EmployeeDashboardData } from '@/types';
import { Badge, StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  Boxes,
  ClipboardList,
  CheckCircle2,
  Clock,
  RotateCw,
  Laptop,
  AlertCircle,
  Calendar,
  Building,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export const EmployeeDashboardView: React.FC = () => {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await employeePortalService.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load employee portal details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const employee = data?.employee || data?.profile;
  const metrics = (data?.summary as any) || (data?.metrics as any);
  const assignedAssets = data?.assignedAssets || [];
  const assignments = data?.recentAssignments || data?.assignments || [];


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {employee ? `${employee.firstName} ${employee.lastName}` : 'Employee'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Member
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Employee Self-Service Portal &bull; Company Asset Management
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>Department: <strong className="text-slate-800">{employee?.department || 'Operations'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Position: <strong className="text-slate-800">{employee?.position || 'Staff'}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">ID:</span>
              <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{employee?.employeeNo}</code>
            </div>
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={fetchDashboard} isLoading={isLoading}>
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Portal
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Currently Assigned Assets
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics?.assignedAssetsCount ?? metrics?.currentlyAssignedCount ?? assignedAssets.length}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">In your custody</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Assignment History
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics?.totalAssignmentsCount ?? assignments.length}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">All-time asset records</p>
          </div>
        </div>


        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Profile Status
            </span>
            <div className="mt-1">
              <Badge variant="emerald" size="md">
                Active Employee
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">Eligible for equipment custody</p>
          </div>
        </div>
      </div>

      {/* Section 1: My Assigned Assets */}
      <div id="my-assets" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              My Assigned Assets
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Equipment currently assigned to you for corporate work
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {assignedAssets.length} {assignedAssets.length === 1 ? 'Asset' : 'Assets'}
          </span>
        </div>

        {assignedAssets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Laptop className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No assets currently assigned</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              No assets currently assigned. Please contact your manager or IT administrator if you require equipment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Asset Code / Tag</th>
                  <th className="px-5 py-3.5">Asset Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Brand &amp; Model</th>
                  <th className="px-5 py-3.5">Serial Number</th>
                  <th className="px-5 py-3.5">Custody Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">
                      {asset.assetTag}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {asset.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {asset.brand} &bull; {asset.model}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500">
                      {asset.serialNumber || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status="assigned" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Assignment History */}
      <div id="my-history" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Assignment History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete chronological audit log of all equipment assigned to you
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {assignments.length} Records
          </span>
        </div>

        {assignments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No previous assignment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Asset</th>
                  <th className="px-5 py-3.5">Assigned Date</th>
                  <th className="px-5 py-3.5">Returned Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assignment Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {item.asset?.name || `Asset #${item.assetId}`}
                      <span className="text-slate-400 font-mono font-normal ml-1.5">
                        ({item.asset?.assetTag})
                      </span>
                    </td>
                    <td className="px-5 py-4 flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      {item.returnedAt ? (
                        <span className="text-slate-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {new Date(item.returnedAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700">
                          Currently In Possession
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-500 italic max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
