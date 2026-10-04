'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export const toast = {
  show(item: Omit<ToastItem, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9);
    const newItem: ToastItem = { ...item, id };
    toasts = [newItem, ...toasts].slice(0, 5);
    notify();

    const duration = item.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },
  success(message: string, title: string = 'Success') {
    return this.show({ type: 'success', message, title });
  },
  error(message: string, title: string = 'Error') {
    return this.show({ type: 'error', message, title });
  },
  info(message: string, title: string = 'Notice') {
    return this.show({ type: 'info', message, title });
  },
  warning(message: string, title: string = 'Warning') {
    return this.show({ type: 'warning', message, title });
  },
  dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },
};

export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => setItems(newToasts);
    listeners.add(listener);
    setItems([...toasts]);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {items.map((item) => {
        let borderClass = 'border-emerald-200 bg-white';
        let iconBg = 'bg-emerald-50 text-emerald-600';
        let Icon = CheckCircle2;
        let titleColor = 'text-emerald-950';

        if (item.type === 'error') {
          borderClass = 'border-rose-200 bg-white';
          iconBg = 'bg-rose-50 text-rose-600';
          Icon = AlertCircle;
          titleColor = 'text-rose-950';
        } else if (item.type === 'warning') {
          borderClass = 'border-amber-200 bg-white';
          iconBg = 'bg-amber-50 text-amber-600';
          Icon = AlertTriangle;
          titleColor = 'text-amber-950';
        } else if (item.type === 'info') {
          borderClass = 'border-blue-200 bg-white';
          iconBg = 'bg-blue-50 text-blue-600';
          Icon = Info;
          titleColor = 'text-blue-950';
        }

        return (
          <div
            key={item.id}
            className={`pointer-events-auto rounded-xl border p-4 shadow-xl shadow-slate-900/10 flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${borderClass}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              {item.title && (
                <h4 className={`text-sm font-bold leading-none mb-1 ${titleColor}`}>
                  {item.title}
                </h4>
              )}
              <p className="text-xs text-slate-600 leading-relaxed font-medium break-words">
                {item.message}
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(item.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
