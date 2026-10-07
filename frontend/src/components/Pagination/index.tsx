'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginatedMeta } from '@/types';

interface PaginationProps {
  meta: PaginatedMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ meta, onPageChange }) => {
  const { page, totalPages, total, limit } = meta;
  if (totalPages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <span className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}</span> to{' '}
        <span className="font-semibold text-slate-700">{end}</span> of{' '}
        <span className="font-semibold text-slate-700">{total}</span> entries
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

