'use client';

import React from 'react';
import Link from 'next/link';
import { useDashboardPage } from './hooks/useDashboardPage';
import { StatCard } from './components/StatCard';
import { InventoryCharts } from './components/InventoryCharts';
import { StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Layers,
  ArrowUpRight,
  RotateCw,
  Activity,
} from 'lucide-react';
import { useSession } from '@/libs/api/use-session';
import { EmployeeDashboardView } from './components/EmployeeDashboardView';


export const DashboardPageContainer: React.FC = () => {
  const user = useSession();
  if (!user) return null;
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboardView />;
  }

  return <AdminDashboardView />;
};

const AdminDashboardView: React.FC = () => {
  const { summary, isLoading, error, refresh } = useDashboardPage();

  const utilization = summary?.totalAssets ? Math.round(summary.assignedAssets / summary.totalAssets * 100) : 0;
  const attention = summary?.byStatus.filter(item => ['damaged', 'under_repair', 'lost'].includes(item.status.toLowerCase())).reduce((sum, item) => sum + item.count, 0) ?? 0;

  return (
    <div className="space-y-4 text-slate-900">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory Overview</h1>
          <p className="text-sm text-slate-600 mt-1">
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
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard
          label="Total Assets"
          value={summary?.totalAssets ?? 0}
          icon={Boxes}
          color="indigo"
        />
        <StatCard
          label="Available"
          value={summary?.availableAssets ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          label="Assigned"
          value={summary?.assignedAssets ?? 0}
          icon={Clock}
          color="sky"
        />
        <StatCard
          label="Damaged"
          value={summary?.damagedAssets ?? 0}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          label="Employees"
          value={summary?.totalEmployees ?? 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Categories"
          value={summary?.totalCategories ?? 0}
          icon={Layers}
          color="amber"
        />
      </div>

      {isLoading && !summary ? (
        <div role="status" className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-600">Loading inventory overview...</div>
      ) : summary && <>
        <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-slate-900 px-3 py-2.5 text-white">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="text-sm text-slate-200 whitespace-nowrap">Utilization</span>
            <span className="text-xl font-bold">{utilization}%</span>
            <div className="h-2 min-w-12 max-w-48 flex-1 rounded-full bg-slate-700"><div className="h-full rounded-full bg-sky-400" style={{ width: `${utilization}%` }} /></div>
          </div>
          <p className="text-sm text-slate-200"><strong className="text-amber-300">{attention}</strong> assets need attention</p>
          <Link href="/assignments" className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline">Assign equipment <ArrowUpRight className="h-4 w-4" /></Link>
        </section>
        <InventoryCharts summary={summary} />
      </>}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Activity Log (2 cols) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Recent Activity
            </h2>
            <Link href="/assets" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              All assets
            </Link>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {summary?.recentActivity && summary.recentActivity.length > 0 ? (
              summary.recentActivity.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-start gap-3">
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
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {act.asset?.name || `Asset #${act.assetId}`}{' '}
                        <span className="text-slate-600 font-normal">({act.asset?.assetTag})</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {act.action.replaceAll('_', ' ').toLowerCase()} ·{' '}
                        <span className="font-medium text-slate-700">
                          {act.employee
                            ? `${act.employee.firstName} ${act.employee.lastName}`
                            : 'Unassigned'}
                        </span>
                        {act.notes && <span className="italic text-slate-600"> &mdash; &quot;{act.notes}&quot;</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 whitespace-nowrap">
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
              <p className="text-xs text-slate-600 py-6 text-center">No recent activity logged</p>
            )}
          </div>
        </div>

      {/* Recent Assignments Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs min-w-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">Recent Assignments</h2>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
              Latest equipment assignments and return states
            </p>
          </div>
          <Link href="/assignments" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            View all
          </Link>
        </div>

        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 uppercase font-semibold text-slate-600 tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Asset</th>
                <th className="px-3 py-2.5">Assigned To</th>
                <th className="px-3 py-2.5">Assigned Date</th>
                <th className="px-3 py-2.5">Return Date</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recentAssignments && summary.recentAssignments.length > 0 ? (
                summary.recentAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-semibold text-slate-800">
                      {a.asset?.name}{' '}
                      <span className="text-slate-600 font-normal">({a.asset?.assetTag})</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'N/A'}
                    </td>
                    <td className="px-3 py-2.5">
                      {new Date(a.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      {a.returnedAt ? new Date(a.returnedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-600">
                    No assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
};
