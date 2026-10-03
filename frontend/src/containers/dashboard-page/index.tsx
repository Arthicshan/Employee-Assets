'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardPage } from './hooks/useDashboardPage';
import { StatCard } from './components/StatCard';
import { StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Layers,
  ArrowRight,
  RotateCw,
  Activity,
} from 'lucide-react';
import { sessionManager } from '@/libs/api/session-storage';
import { EmployeeDashboardView } from './components/EmployeeDashboardView';


export const DashboardPageContainer: React.FC = () => {
  const user = sessionManager.getUser();
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboardView />;
  }

  const { summary, isLoading, error, refresh } = useDashboardPage();

  return (
    <div className="space-y-8">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time status of company equipment, assignments, and lifecycle events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={refresh} isLoading={isLoading}>
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Link href="/assets">
            <Button variant="primary" size="sm">
              <Boxes className="w-3.5 h-3.5 mr-1.5" />
              Manage Assets
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Assets"
          value={summary?.totalAssets ?? 0}
          icon={Boxes}
          color="indigo"
          sublabel="All registered assets"
        />
        <StatCard
          label="Available"
          value={summary?.availableAssets ?? 0}
          icon={CheckCircle2}
          color="emerald"
          sublabel="Ready to assign"
        />
        <StatCard
          label="Assigned"
          value={summary?.assignedAssets ?? 0}
          icon={Clock}
          color="sky"
          sublabel="In active use"
        />
        <StatCard
          label="Damaged"
          value={summary?.damagedAssets ?? 0}
          icon={AlertTriangle}
          color="rose"
          sublabel="Needs inspection"
        />
        <StatCard
          label="Employees"
          value={summary?.totalEmployees ?? 0}
          icon={Users}
          color="purple"
          sublabel="Company workforce"
        />
        <StatCard
          label="Categories"
          value={summary?.totalCategories ?? 0}
          icon={Layers}
          color="amber"
          sublabel="Asset classifications"
        />
      </div>

      {/* Grid: Categories Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Assets by Category
              </h2>
              <Link href="/categories" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                View all
              </Link>
            </div>

            <div className="space-y-3.5">
              {summary?.byCategory && summary.byCategory.length > 0 ? (
                summary.byCategory.map((cat, i) => {
                  const percentage = summary.totalAssets > 0
                    ? Math.round((cat.count / summary.totalAssets) * 100)
                    : 0;

                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat.category}</span>
                        <span>
                          {cat.count} <span className="text-slate-400 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No categories recorded</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6">
            <Link
              href="/assignments"
              className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 p-2 rounded-lg bg-indigo-50/60 hover:bg-indigo-50 transition-colors"
            >
              <span>Assign an Asset to Employee</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Activity Log (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Recent Asset Lifecycle Events
            </h2>
            <Link href="/assets" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View Asset Directory
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recentActivity && summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        act.action === 'ASSIGNED'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : act.action === 'RETURNED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {act.action === 'ASSIGNED' ? 'AS' : act.action === 'RETURNED' ? 'RT' : 'EV'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {act.asset?.name || `Asset #${act.assetId}`}{' '}
                        <span className="text-slate-400 font-normal">({act.asset?.assetTag})</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {act.action === 'ASSIGNED' ? 'Assigned to' : 'Action for'}{' '}
                        <span className="font-medium text-slate-700">
                          {act.employee
                            ? `${act.employee.firstName} ${act.employee.lastName}`
                            : 'Unassigned'}
                        </span>
                        {act.notes && <span className="italic text-slate-400"> &mdash; "{act.notes}"</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(act.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity logged</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Assignments</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest equipment assignments and return states
            </p>
          </div>
          <Link href="/assignments" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View all assignments
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 border-b border-slate-200 uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Assigned Date</th>
                <th className="px-4 py-3">Return Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recentAssignments && summary.recentAssignments.length > 0 ? (
                summary.recentAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {a.asset?.name}{' '}
                      <span className="text-slate-400 font-normal">({a.asset?.assetTag})</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(a.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {a.returnedAt ? new Date(a.returnedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
