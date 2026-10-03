'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Users,
  ClipboardList,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { UserProfile } from '@/types';
import { Badge } from '../Badge';

interface SidebarProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  const pathname = usePathname();

  const getNavItems = () => {
    if (currentUser?.role === 'EMPLOYEE') {
      return [
        { label: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'My Assigned Assets', href: '/dashboard#my-assets', icon: Boxes },
        { label: 'My History', href: '/dashboard#my-history', icon: ClipboardList },
      ];
    }
    if (currentUser?.role === 'MANAGER') {
      return [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Assets', href: '/assets', icon: Boxes },
        { label: 'Employees', href: '/employees', icon: Users },
        { label: 'Assignments', href: '/assignments', icon: ClipboardList },
      ];
    }
    return [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Assets', href: '/assets', icon: Boxes },
      { label: 'Categories', href: '/categories', icon: Layers },
      { label: 'Employees', href: '/employees', icon: Users },
      { label: 'Assignments', href: '/assignments', icon: ClipboardList },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
          AF
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">AssetFlow</h1>
          <span className="text-[11px] text-slate-400">Inventory Management</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>


      {/* User profile footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] text-slate-400 truncate">{currentUser?.email}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge
            variant={
              currentUser?.role === 'ADMIN'
                ? 'blue'
                : currentUser?.role === 'EMPLOYEE'
                ? 'emerald'
                : 'neutral'
            }
            size="sm"
          >
            <Shield className="w-3 h-3 mr-1" />
            {currentUser?.role || 'User'}
          </Badge>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};

