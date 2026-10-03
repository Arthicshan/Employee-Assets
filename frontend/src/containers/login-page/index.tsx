'use client';

import React, { useState } from 'react';
import { useLoginPage } from './hooks/useLoginPage';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Shield, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
  } = useLoginPage();

  const [showPassword, setShowPassword] = useState(false);

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
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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


