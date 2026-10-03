'use client';

import React, { useState } from 'react';
import { useLoginPage } from './hooks/useLoginPage';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Shield, KeyRound, AlertCircle, Eye, EyeOff, UserCheck, Layers } from 'lucide-react';

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

  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<'ADMIN' | 'MANAGER' | 'EMPLOYEE' | null>(null);

  const handleSelectDemo = (role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE') => {
    setSelectedDemo(role);
    fillCredentials(role);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-md mb-3 ring-4 ring-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AssetFlow</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Asset &amp; Inventory Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl p-8 shadow-xl border border-slate-200">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your corporate credentials to access the system
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
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
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedDemo(null);
              }}
              disabled={isLoading}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setSelectedDemo(null);
              }}
              disabled={isLoading}
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>

          {/* Demo Access */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Demo Access
              </span>
              <span className="text-[11px] text-slate-400">Pre-configured roles</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('ADMIN')}
                className={`px-2.5 py-2.5 rounded-lg text-xs font-medium border transition-colors flex flex-col items-center gap-1 cursor-pointer w-full text-center ${
                  selectedDemo === 'ADMIN'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('MANAGER')}
                className={`px-2.5 py-2.5 rounded-lg text-xs font-medium border transition-colors flex flex-col items-center gap-1 cursor-pointer w-full text-center ${
                  selectedDemo === 'MANAGER'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemo('EMPLOYEE')}
                className={`px-2.5 py-2.5 rounded-lg text-xs font-medium border transition-colors flex flex-col items-center gap-1 cursor-pointer w-full text-center ${
                  selectedDemo === 'EMPLOYEE'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Employee</span>
              </button>
            </div>

            {/* Subtle role indicator */}
            <div className="mt-3 py-2 px-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-center justify-between border border-slate-100">
              <span className="font-medium text-slate-600">
                {selectedDemo === 'ADMIN' && 'Admin: System Administrator (Full CRUD)'}
                {selectedDemo === 'MANAGER' && 'Manager: Operations & Assignments'}
                {selectedDemo === 'EMPLOYEE' && 'Employee: Self-Service Portal (Assigned Assets)'}
                {!selectedDemo && 'Click any role above to pre-fill credentials'}
              </span>
              {selectedDemo && (
                <span className="text-blue-600 font-semibold">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Security Note Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>Protected by enterprise-grade role-based access control (RBAC).</span>
        </p>
      </div>
    </div>
  );
};


