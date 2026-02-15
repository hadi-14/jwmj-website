'use client';

import React, { useState } from 'react';
import { useAuth } from '../AuthContext'; // Adjust path as needed
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, Loader } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Invalid email or password');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#038DCD] to-[#0369A1] rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h1>
          <p className="text-slate-600">Sign in to access the admin panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-rose-800 font-semibold flex-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jwmj.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-slate-300 text-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/20"
                />
                <span className="text-sm font-medium text-slate-700">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-[#038DCD] hover:text-[#0369A1] transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            © 2024 Jamat Welfare Memon Jamaat. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}