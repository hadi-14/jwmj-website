'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const validateToken = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/validate-reset-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            if (response.ok) {
                setTokenValid(true);
            } else {
                setTokenValid(false);
                setError('This password reset link is invalid or has expired. Please request a new one.');
            }
        } catch {
            setTokenValid(false);
            setError('Failed to validate reset link. Please try again.');
        }
    }, [token]);

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setError('Invalid reset link. Please request a new password reset.');
            return;
        }

        // Validate token on page load
        validateToken();
    }, [token, validateToken]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/member/login');
            }, 3000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (tokenValid === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="flex items-center justify-center text-center gap-4 mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <div className="w-25 h-25 rounded-2xl flex items-center justify-center mx-auto">
                                <Image
                                    src="/logo.png"
                                    alt="JWMJ Logo"
                                    width={100}
                                    height={100}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2 italic">Member Portal</h1>
                            <p className="text-gray-600 font-medium">Password Reset</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <Link
                                href="/member/forgot-password"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#038DCD] hover:bg-[#038DCD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#038DCD]"
                            >
                                Request New Reset Link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="flex items-center justify-center text-center gap-4 mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <div className="w-25 h-25 rounded-2xl flex items-center justify-center mx-auto">
                                <Image
                                    src="/logo.png"
                                    alt="JWMJ Logo"
                                    width={100}
                                    height={100}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2 italic">Member Portal</h1>
                            <p className="text-gray-600 font-medium">Password Reset</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
                            <p className="text-gray-600 mb-6">
                                Your password has been successfully reset. You can now log in with your new password.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Redirecting to login page in 3 seconds...
                            </p>
                            <Link
                                href="/member/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#038DCD] hover:bg-[#038DCD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#038DCD]"
                            >
                                Go to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (tokenValid === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    <div className="flex items-center justify-center text-center gap-4 mb-8">
                        <Link href="/" className="inline-block mb-6">
                            <div className="w-25 h-25 rounded-2xl flex items-center justify-center mx-auto">
                                <Image
                                    src="/logo.png"
                                    alt="JWMJ Logo"
                                    width={100}
                                    height={100}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2 italic">Member Portal</h1>
                            <p className="text-gray-600 font-medium">Password Reset</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                        <div className="text-center">
                            <div className="animate-spin mx-auto h-8 w-8 text-[#038DCD] mb-4"></div>
                            <p className="text-gray-600">Validating reset link...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">

                {/* Header Section */}
                <div className="flex items-center justify-center text-center gap-4 mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <div className="w-25 h-25 rounded-2xl flex items-center justify-center mx-auto">
                            <Image
                                src="/logo.png"
                                alt="JWMJ Logo"
                                width={100}
                                height={100}
                                className="object-contain"
                            />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 italic">Member Portal</h1>
                        <p className="text-gray-600 font-medium">Set your new password</p>
                    </div>
                </div>

                {/* Reset Form Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <span className="text-red-500 text-xl">⚠</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* New Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all duration-200 font-medium"
                                    placeholder="Enter your new password"
                                    disabled={isLoading}
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all duration-200 font-medium"
                                    placeholder="Confirm your new password"
                                    disabled={isLoading}
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#038DCD] hover:bg-[#038DCD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#038DCD] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Resetting Password...
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href="/member/login"
                        className="text-sm font-bold text-[#038DCD] hover:text-[#038DCD]/80 transition-colors"
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}