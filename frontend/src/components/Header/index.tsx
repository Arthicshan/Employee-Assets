'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  LogOut,
} from 'lucide-react';
import { Badge } from '@/components/Badge';
import { UserProfile } from '@/types';

interface HeaderProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
  onOpenMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenMobileNav,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/assets')) return 'Asset Inventory';
    if (pathname.startsWith('/categories')) return 'Asset Categories';
    if (pathname.startsWith('/employees')) return 'Employee Directory';
    if (pathname.startsWith('/assignments')) return 'Asset Assignments & Returns';
    return 'AssetFlow';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Navigation Controls: Back, Forward, Home, Breadcrumb */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Navigation History Controls */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => router.back()}
            title="Go Backward"
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            type="button"
            onClick={() => router.forward()}
            title="Go Forward"
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer active:scale-95"
            aria-label="Forward"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Home Button */}
        <Link
          href="/dashboard"
          title="Go to Home / Dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 bg-white shadow-2xs text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4 text-indigo-600" />
          <span>Home</span>
        </Link>

        {/* Current Page Title / Breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
          <span className="font-semibold text-slate-800">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right Side: Profile & Actions */}
      <div className="flex items-center gap-3">
        {/* User Profile Card */}
        <div className="flex items-center gap-3 pl-3 pr-2 py-1 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
          {/* Avatar Icon */}
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-indigo-100">
            {currentUser?.firstName ? currentUser.firstName.charAt(0) : <User className="w-4 h-4" />}
          </div>

          {/* Profile Name & Role Details */}
          <div className="text-left hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.firstName || 'User'} {currentUser?.lastName || ''}
              </span>
              <Badge variant="purple" size="sm">
                {currentUser?.role || 'EMPLOYEE'}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 leading-none truncate max-w-35 md:max-w-45">
              {currentUser?.email || 'user@assetflow.com'}
            </p>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Sign Out"
            className="p-1.5 ml-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
