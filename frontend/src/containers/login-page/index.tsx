'use client';

import React from 'react';
import { useLoginPage } from './hooks/useLoginPage';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Shield, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPageContainer: React.FC = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    validationErrors,
    handleSubmit,
    fillCredentials,
  } = useLoginPage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl shadow-xl shadow-indigo-600/30 mb-3 ring-4 ring-indigo-500/20">
            AF
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AssetFlow</h1>
          <p className="text-sm text-slate-400 mt-1">
            Employee Asset & Inventory Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials to access the inventory system
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">
                <span className="font-semibold block">{error}</span>
                {validationErrors.length > 0 && (
                  <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-rose-600">
                    {validationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold shadow-lg shadow-indigo-600/20"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Quick Demo Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('ADMIN')}
                className="px-2.5 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('MANAGER')}
                className="px-2.5 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                <span>Manager</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('EMPLOYEE')}
                className="px-2.5 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-colors flex flex-col items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Employee</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Click a role above to auto-fill credentials for demo testing
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Employee Asset & Inventory Management &bull; NestJS + Next.js + PostgreSQL
        </p>
      </div>
    </div>
  );
};

