'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setSuccess(true);
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                            <p className="text-gray-600 mb-6">
                                We&apos;ve sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Didn&apos;t receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-[#038DCD] hover:text-[#038DCD]/80 font-medium"
                                >
                                    try again
                                </button>
                            </p>
                            <Link
                                href="/member/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#038DCD] hover:bg-[#038DCD]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#038DCD]"
                            >
                                Back to Login
                            </Link>
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
                        <p className="text-gray-600 font-medium">Reset your password</p>
                    </div>
                </div>

                {/* Reset Form Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Alert */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <div className="flex items-start">
                                    <div className="shrink-0">
                                        <span className="text-red-500 text-xl">⚠</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#038DCD] focus:border-[#038DCD] transition-all duration-200 font-medium"
                                placeholder="your.email@example.com"
                                disabled={isLoading}
                            />
                            <p className="mt-2 text-sm text-gray-600">
                                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                            </p>
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
                                    Sending Reset Link...
                                </div>
                            ) : (
                                'Send Reset Link'
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