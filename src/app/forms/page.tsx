'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight, Loader, Search, Filter, CheckCircle, Clock, AlertCircle, Calendar, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface FormData {
    id: string;
    name: string;
    description: string;
    formType: string;
    fields: any[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export default function FormsPage() {
    const [forms, setForms] = useState<FormData[]>([]);
    const [filteredForms, setFilteredForms] = useState<FormData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchForms();
    }, []);

    useEffect(() => {
        filterForms();
    }, [searchTerm, selectedCategory, forms]);

    const fetchForms = async () => {
        try {
            const res = await fetch('/api/forms?isActive=true');
            const response = await res.json();

            if (response.success && response.data) {
                setForms(response.data);
                setFilteredForms(response.data);
            } else {
                setError('Failed to load forms');
            }
        } catch (err) {
            console.error('Error fetching forms:', err);
            setError('Failed to load forms');
        } finally {
            setIsLoading(false);
        }
    };

    const filterForms = () => {
        let filtered = forms;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(form =>
                form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.formType.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(form => form.formType === selectedCategory);
        }

        setFilteredForms(filtered);
    };

    const getFormIcon = (formType: string) => {
        // You can customize icons based on form type
        return FileText;
    };

    const getFormColor = (formType: string) => {
        const colors: Record<string, string> = {
            'zakat_application': 'from-emerald-500 to-emerald-600',
            'membership': 'from-blue-500 to-blue-600',
            'donation': 'from-amber-500 to-amber-600',
            'welfare': 'from-purple-500 to-purple-600',
            'default': 'from-[#038DCD] to-[#0369A1]'
        };
        return colors[formType] || colors['default'];
    };

    const categories = ['all', ...Array.from(new Set(forms.map(f => f.formType)))];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-[#038DCD]/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Loading forms...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Available Forms</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Complete the forms below to submit your applications or information to JWMJ
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-rose-900">Error loading forms</p>
                                <p className="text-rose-700 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-slate-600 font-medium mb-2">Total Forms</p>
                                <p className="text-3xl font-bold text-[#038DCD]">{forms.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <FileText className="w-6 h-6 text-[#038DCD]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-slate-600 font-medium mb-2">Categories</p>
                                <p className="text-3xl font-bold text-emerald-600">{categories.length - 1}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-xl">
                                <Filter className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-slate-600 font-medium mb-2">Active Status</p>
                                <p className="text-3xl font-bold text-amber-600">Live</p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search forms by name, description, or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all bg-white appearance-none cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {categories.filter(cat => cat !== 'all').map(category => (
                                    <option key={category} value={category}>
                                        {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Results count */}
                    {searchTerm || selectedCategory !== 'all' ? (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                                Showing <span className="font-semibold text-slate-900">{filteredForms.length}</span> of{' '}
                                <span className="font-semibold text-slate-900">{forms.length}</span> forms
                            </p>
                        </div>
                    ) : null}
                </div>

                {/* Forms Grid */}
                {filteredForms.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {searchTerm || selectedCategory !== 'all' ? 'No forms match your search' : 'No Forms Available'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {searchTerm || selectedCategory !== 'all' 
                                ? 'Try adjusting your search or filters' 
                                : 'Check back later for available forms.'}
                        </p>
                        {(searchTerm || selectedCategory !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="px-6 py-2.5 bg-[#038DCD] hover:bg-[#0369A1] text-white rounded-xl font-semibold transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {filteredForms.map((form) => {
                            const FormIcon = getFormIcon(form.formType);
                            const colorGradient = getFormColor(form.formType);
                            
                            return (
                                <Link href={`/forms/${form.formType}`} key={form.id}>
                                    <div className="bg-white rounded-2xl shadow-sm border-2 border-slate-200 hover:shadow-xl hover:border-[#038DCD] transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden h-full flex flex-col">
                                        {/* Card Header with Gradient */}
                                        <div className={`bg-gradient-to-r ${colorGradient} p-6 relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                                            
                                            <div className="relative flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl mb-3">
                                                        <FormIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                                                        {form.name}
                                                    </h2>
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                                        <span className="text-xs font-semibold text-white">
                                                            {form.formType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-colors">
                                                    <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <p className="text-slate-600 mb-4 line-clamp-3 flex-1">
                                                {form.description || 'Complete this form to submit your information.'}
                                            </p>

                                            {/* Form Meta Info */}
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-4 h-4 text-[#038DCD]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Fields</p>
                                                        <p className="text-sm font-bold text-slate-900">{form.fields.length}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium">Status</p>
                                                        <p className="text-sm font-bold text-emerald-600">Active</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CTA Button */}
                                            <button className="mt-4 w-full py-3 bg-slate-50 hover:bg-[#038DCD] text-slate-700 hover:text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                                                Start Application
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-50 to-amber-50 rounded-2xl border-2 border-slate-200 p-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
                            <AlertCircle className="w-8 h-8 text-[#038DCD]" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">Need Help?</h3>
                        <p className="text-slate-600 mb-6">
                            If you have any questions about filling out these forms or need assistance, 
                            please don't hesitate to contact our support team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                href="/contact"
                                className="px-6 py-3 bg-[#038DCD] hover:bg-[#0369A1] text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 inline-flex items-center justify-center gap-2"
                            >
                                Contact Support
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/faq"
                                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold border-2 border-slate-200 transition-all duration-200 hover:scale-105 inline-flex items-center justify-center gap-2"
                            >
                                View FAQ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}