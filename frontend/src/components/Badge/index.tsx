import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'blue' | 'emerald';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'md' }) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  };


  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const norm = (status || '').toLowerCase();

  switch (norm) {
    case 'available':
      return <Badge variant="success">Available</Badge>;
    case 'assigned':
      return <Badge variant="info">Assigned</Badge>;
    case 'active':
      return <Badge variant="info">Active</Badge>;
    case 'returned':
      return <Badge variant="neutral">Returned</Badge>;
    case 'damaged':
      return <Badge variant="danger">Damaged</Badge>;
    case 'under_repair':
      return <Badge variant="warning">Under Repair</Badge>;
    case 'lost':
      return <Badge variant="danger">Lost</Badge>;
    case 'retired':
      return <Badge variant="neutral">Retired</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

