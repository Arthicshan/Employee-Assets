'use client';

import React, { useState } from 'react';
import { Pagination } from '../Pagination';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  paginate?: boolean;
  sortable?: boolean;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  paginate = true,
  sortable = true,
}: TableProps<T>) {
  const [pageState, setPage] = useState({page: 1, data});
  const [sort, setSort] = useState('');
  const [descending, setDescending] = useState(false);
  const page = pageState.data === data ? pageState.page : 1;
  const fields = data.length ? Object.keys(data[0] as object).filter(key => !['id','employeeId','assetId','passwordHash'].includes(key) && ['string','number','boolean'].includes(typeof (data[0] as Record<string, unknown>)[key])) : [];
  const ordered = sort ? [...data].sort((a,b) => {
    const av = (a as Record<string, unknown>)[sort], bv = (b as Record<string, unknown>)[sort];
    const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''));
    return descending ? -result : result;
  }) : data;
  const visible = paginate ? ordered.slice((page - 1) * 20, page * 20) : ordered;
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm">Loading records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {sortable && fields.length > 0 && <div className="flex gap-3 items-center px-5 py-3 border-b border-slate-100 text-xs">
        <label className="text-slate-600 font-medium">Sort by <select aria-label="Sort by" value={sort} onChange={e => {setSort(e.target.value); setPage({page: 1, data});}} className="ml-2 border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 shadow-2xs"><option value="">Default order</option>{fields.map(field => <option key={field} value={field}>{field.replace(/([A-Z])/g, ' $1')}</option>)}</select></label>
        <button type="button" onClick={() => setDescending(!descending)} className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs">{descending ? 'Descending' : 'Ascending'}</button>
      </div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visible.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`transition-colors ${
                    onRowClick ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/40'
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : col.accessor
                        ? (item[col.accessor] as unknown as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginate && <Pagination meta={{total: data.length, page, limit: 20, totalPages: Math.max(1, Math.ceil(data.length / 20))}} onPageChange={next => setPage({page: next, data})} />}
    </div>
  );
}

