'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { sessionManager } from '@/libs/api/session-storage';
import { UserProfile } from '@/types';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // If on login page, don't wrap in shell
    if (pathname === '/login') return;

    const user = sessionManager.getUser();
    if (!sessionManager.isAuthenticated() || !user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
    }
  }, [pathname, router]);

  // If on login page, render children directly without sidebar/header
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    sessionManager.clear();
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Assets', href: '/assets', icon: Boxes },
    { label: 'Categories', href: '/categories', icon: Layers },
    { label: 'Employees', href: '/employees', icon: Users },
    { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Brand Top Bar */}
        <div className="md:hidden h-14 bg-slate-900 text-white flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              AF
            </div>
            <span className="font-bold text-sm">AssetFlow</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-rose-400 hover:bg-slate-800 rounded-lg text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Top Header with Home, Back, Forward navigation and Profile */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenMobileNav={() => setIsMobileOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
