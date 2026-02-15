'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, FileText, Shield, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import DynamicForm from '@/components/form/DynamicForm';

interface FormData {
    id: string;
    name: string;
    description: string;
    formType: string;
    fields: Record<string, unknown>[];
}

export default function FormPage({ params }: { params: Promise<{ formType: string }> }) {
    const [form, setForm] = useState<FormData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const unwrapParams = async () => {
            const { formType } = await params;
            fetchForm(formType);
        };
        unwrapParams();
    }, [params]);

    const fetchForm = async (type: string) => {
        try {
            const res = await fetch(`/api/forms/by-type/${type}`);
            const response = await res.json();

            if (response.success && response.data) {
                setForm(response.data);
            } else {
                setError('Form not found');
            }
        } catch (err) {
            console.error('Error fetching form:', err);
            setError('Failed to load form');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-[#038DCD]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Loading form...</p>
                </div>
            </div>
        );
    }

    if (error || !form) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Link
                            href="/forms"
                            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 font-medium group transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Forms</span>
                        </Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-rose-200 p-12 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-2xl mb-6">
                            <AlertCircle className="w-10 h-10 text-rose-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">Error Loading Form</h1>
                        <p className="text-lg text-rose-600 mb-6">{error}</p>
                        <Link
                            href="/forms"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#038DCD] hover:bg-[#0369A1] text-white rounded-xl font-semibold transition-all duration-200"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Return to Forms
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
                    <Link
                        href="/forms"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 font-medium group transition-all"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Forms</span>
                    </Link>

                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            {form.name}
                        </h1>
                        <p className="text-lg text-blue-100 leading-relaxed">
                            {form.description}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 border-2 border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-[#038DCD]" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Total Fields</p>
                            <p className="text-lg font-bold text-slate-900">{form.fields.length}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border-2 border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Secure</p>
                            <p className="text-sm font-bold text-slate-900">Confidential</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border-2 border-slate-200 flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase">Est. Time</p>
                            <p className="text-sm font-bold text-slate-900">{Math.ceil(form.fields.length / 3)} mins</p>
                        </div>
                    </div>
                </div>

                {/* Instructions Card */}
                <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl border-2 border-slate-200 p-6 mb-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#038DCD] rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        Instructions / ہدایات
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-start gap-2">
                            <span className="text-[#038DCD] font-bold">•</span>
                            <span>Fill all required fields marked with <span className="text-rose-500 font-bold">*</span></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#038DCD] font-bold">•</span>
                            <span>You can save your progress as a draft and continue later</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#038DCD] font-bold">•</span>
                            <span>All information provided will be kept confidential</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#038DCD] font-bold">•</span>
                            <span>تمام ضروری خانے پُر کریں جن پر <span className="text-rose-500 font-bold">*</span> کا نشان ہے</span>
                        </li>
                    </ul>
                </div>

                {/* Form Component */}
                <DynamicForm formType={form.formType} />

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-slate-200">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <p className="text-xs text-slate-500">
                            Jamnagar Wehvaria Memon Jamat - Secure & Confidential
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}