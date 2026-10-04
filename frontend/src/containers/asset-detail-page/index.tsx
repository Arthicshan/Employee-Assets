'use client';

import React from 'react';
import Link from 'next/link';
import { useAssetDetailPage } from './hooks/useAssetDetailPage';
import { StatusBadge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
  ArrowLeft,
  Boxes,
  Calendar,
  Tag,
  Hash,
  User,
  History,
  AlertCircle,
  Clock,
  RotateCw,
} from 'lucide-react';

interface AssetDetailPageProps {
  id: number;
}

export const AssetDetailPageContainer: React.FC<AssetDetailPageProps> = ({ id }) => {
  const { asset, history, isLoading, error, refresh } = useAssetDetailPage(id);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Loading asset details...</span>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Asset Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || `No asset found with ID #${id}`}</p>
        <Link href="/assets" className="inline-block mt-4">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Asset List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl border p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div><p className="text-slate-500">Condition</p><p>{asset.condition}</p></div>
        <div><p className="text-slate-500">Purchase Price</p><p>{asset.purchasePrice ?? 'Not recorded'}</p></div>
        <div><p className="text-slate-500">Warranty Expiry</p><p>{asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate).toLocaleDateString() : 'Not recorded'}</p></div>
        <div><p className="text-slate-500">Notes</p><p>{asset.notes || '-'}</p></div>
      </div>
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/assets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assets</span>
        </Link>
        <Button variant="secondary" size="sm" onClick={refresh}>
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Asset Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Boxes className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                  {asset.assetTag}
                </span>
                <StatusBadge status={asset.status} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1.5">{asset.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {[asset.brand, asset.model].filter(Boolean).join(' • ') || 'No brand/model specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Category
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">{asset.category}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" /> Serial Number
            </span>
            <p className="text-sm font-mono font-medium text-slate-800 mt-1">
              {asset.serialNumber || 'N/A'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Purchase Date
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Registered
            </span>
            <p className="text-sm font-medium text-slate-800 mt-1">
              {new Date(asset.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Current Assignment & History Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Custody Card (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs h-fit">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-indigo-600" />
            Current Assignment
          </h2>

          {asset.employee ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Assigned Employee</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {asset.employee.firstName} {asset.employee.lastName}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{asset.employee.employeeNo}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Department</span>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{asset.employee.department}</p>
                <p className="text-xs text-slate-500">{asset.employee.position}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mb-2"></span>
              <p className="text-sm font-semibold text-slate-800">In Stock</p>
              <p className="text-xs text-slate-400 mt-1">
                This asset is currently available in inventory and not assigned to anyone.
              </p>
              <Link href="/assignments" className="inline-block mt-4">
                <Button variant="primary" size="sm">
                  Assign Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Chronological Audit Timeline (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Asset Lifecycle &amp; Audit History
            </h2>
            <span className="text-xs text-slate-400">{history.length} events recorded</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No lifecycle events recorded for this asset yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {history.map((event) => (
                <div key={event.id} className="relative">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                      event.action === 'ASSIGNED'
                        ? 'border-sky-500 text-sky-500'
                        : event.action === 'RETURNED'
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-slate-400 text-slate-400'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  </div>

                  {/* Content */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 tracking-wide uppercase">
                        {event.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(event.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      {event.employee ? (
                        <>
                          Employee:{' '}
                          <span className="font-semibold text-slate-800">
                            {event.employee.firstName} {event.employee.lastName}
                          </span>{' '}
                          <span className="text-slate-400 font-mono">({event.employee.employeeNo})</span>
                        </>
                      ) : (
                        'No employee associated'
                      )}
                    </p>

                    {event.previousStatus && event.newStatus && <p className="text-xs text-slate-500 mt-1">{event.previousStatus} → {event.newStatus}</p>}
                    {event.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                        &quot;{event.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
