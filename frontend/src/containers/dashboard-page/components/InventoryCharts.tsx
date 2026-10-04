import Link from 'next/link';
import { ArrowUpRight, PieChart, Layers } from 'lucide-react';
import { DashboardSummary } from '@/types';

const statuses = [
  { key: 'available', label: 'Available', color: '#059669' },
  { key: 'assigned', label: 'Assigned', color: '#2563eb' },
  { key: 'damaged', label: 'Damaged', color: '#e11d48' },
  { key: 'under_repair', label: 'Under repair', color: '#d97706' },
  { key: 'lost', label: 'Lost', color: '#7c3aed' },
  { key: 'retired', label: 'Retired', color: '#475569' },
];
const categoryColors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#e11d48'];

export function InventoryCharts({ summary }: { summary: DashboardSummary }) {
  const total = summary.totalAssets;
  const slices = statuses.map(status => ({ ...status, count: summary.byStatus.find(item => item.status.toLowerCase() === status.key)?.count ?? 0 }));
  const categories = [...summary.byCategory].sort((a, b) => b.count - a.count);
  const circles = slices.map((slice, index) => {
    const share = total ? slice.count / total * 100 : 0;
    const start = total ? slices.slice(0, index).reduce((sum, item) => sum + item.count, 0) / total * 100 : 0;
    return { ...slice, share, start };
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 min-w-0 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><PieChart className="h-5 w-5 text-blue-700" />Asset status distribution</h2>
        <p className="mt-1 text-sm text-slate-600">See where your equipment stands. Select a status to explore.</p>
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-36 h-36 2xl:w-40 2xl:h-40 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={`Asset status distribution: ${slices.map(s => `${s.label} ${s.count}`).join(', ')}`}>
              <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="13" />
              {circles.filter(slice => slice.count > 0).map(slice => (
                <circle key={slice.key} cx="60" cy="60" r="48" fill="none" stroke={slice.color} strokeWidth="13" pathLength="100" strokeDasharray={`${slice.share} ${100 - slice.share}`} strokeDashoffset={-slice.start}>
                  <title>{slice.label}: {slice.count} assets ({Math.round(slice.share)}%)</title>
                </circle>
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tracking-tight text-slate-900">{total.toLocaleString()}</span>
              <span className="mt-1 text-sm font-medium text-slate-600">Total assets</span>
            </div>
          </div>
          <div className="w-full min-w-0 space-y-1">
            {slices.map(slice => <Link key={slice.key} href={`/assets?status=${slice.key}`} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="flex-1 font-medium">{slice.label}</span>
              <span className="font-bold text-slate-900">{slice.count}</span>
              <span className="w-10 text-right text-xs text-slate-600">{total ? Math.round(slice.count / total * 100) : 0}%</span>
              <ArrowUpRight className="h-4 w-4 text-slate-600" />
            </Link>)}
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 min-w-0 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900"><Layers className="h-5 w-5 text-violet-700" />Equipment by category</h2>
          <Link href="/categories" className="text-sm font-semibold text-blue-700 hover:underline">View all</Link>
        </div>
        <p className="mt-1 text-sm text-slate-600">Compare each category&apos;s share of the inventory.</p>
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2.5 pr-1">
          {categories.length ? categories.map((category, index) => {
            const share = total ? category.count / total * 100 : 0;
            return <Link key={category.category} href={`/assets?category=${encodeURIComponent(category.category)}`} className="block rounded-lg p-1 focus-visible:outline-2 focus-visible:outline-blue-600 hover:bg-slate-50">
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-800 break-words">{category.category}</span>
                <span className="shrink-0 font-bold text-slate-900">{category.count} <span className="font-normal text-slate-600">({Math.round(share)}%)</span></span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="meter" aria-label={category.category} aria-valuenow={category.count} aria-valuemin={0} aria-valuemax={Math.max(total, 1)}>
                <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: categoryColors[index % categoryColors.length] }} />
              </div>
            </Link>;
          }) : <p className="py-12 text-center text-sm text-slate-600">No categories recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}
