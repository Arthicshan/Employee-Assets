import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  sublabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color = 'indigo',
  sublabel,
}) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-2">
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {sublabel && <p className="text-xs text-slate-600 mt-0.5">{sublabel}</p>}
      </div>
      <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center border ${colorStyles[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
};
