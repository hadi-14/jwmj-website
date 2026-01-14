'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Calendar, CheckCircle, Clock, Trash2, Eye, Download, Loader, AlertCircle, X, FileText, User, Mail, Hash, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormField {
  fieldLabel: string;
  fieldName: string;
}

interface FieldValue {
  fieldId: string;
  value: string | null;
  field: FormField;
}

interface FormSubmission {
  id: string;
  formId: string;
  form: {
    name: string;
    formType: string;
  };
  memberComputerId: bigint | null;
  submissionDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedBy: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  notes: string | null;
  fieldValues: FieldValue[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface SubmissionsResponse {
  success: boolean;
  data: FormSubmission[];
  pagination: PaginationData;
}

interface StatsData {
  totalSubmissions: number;
  byStatus: Record<string, number>;
  recentSubmissions: Array<{
    id: string;
    submissionDate: string;
    status: string;
  }>;
}

export default function SubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [filterForm, setFilterForm] = useState(searchParams.get('formId') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [limit] = useState(20);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());

      if (filterStatus !== 'all') {
        params.set('status', filterStatus);
      }
      if (filterForm !== 'all' && filterForm !== '') {
        params.set('formId', filterForm);
      }

      const response = await fetch(`/api/submissions?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data: SubmissionsResponse = await response.json();
      setSubmissions(data.data);
      setPagination(data.pagination);

      // Update URL params
      const newParams = new URLSearchParams();
      newParams.set('page', currentPage.toString());
      if (filterStatus !== 'all') newParams.set('status', filterStatus);
      if (filterForm !== 'all' && filterForm !== '') newParams.set('formId', filterForm);
      router.push(`?${newParams.toString()}`, { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filterStatus, filterForm, router]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterForm !== 'all' && filterForm !== '') {
        params.set('formId', filterForm);
      }

      const response = await fetch(`/api/submissions/stats?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [filterForm]);

  // Initial load
  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, [fetchSubmissions, fetchStats]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
      case 'submitted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'draft':
        return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      setSubmissions(submissions.filter(s => s.id !== id));
      alert('Submission deleted successfully');
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete submission');
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterForm !== 'all' && filterForm !== '') params.set('formId', filterForm);

      const response = await fetch(`/api/submissions/export?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to export submissions');
      }

      const csv = await response.text();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `submissions-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export submissions');
    }
  };

  const resetFilters = () => {
    setFilterStatus('all');
    setFilterForm('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const statCards = [
    {
      label: 'Total Submissions',
      value: stats?.totalSubmissions || 0,
      icon: FileText,
      gradient: 'from-[#038DCD] to-[#0369A1]',
      bgColor: 'bg-sky-50',
      iconColor: 'text-sky-600'
    },
    {
      label: 'Approved',
      value: stats?.byStatus['approved'] || 0,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'Pending',
      value: stats?.byStatus['pending'] || stats?.byStatus['submitted'] || 0,
      icon: Clock,
      gradient: 'from-amber-400 to-amber-500',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      label: 'Rejected',
      value: stats?.byStatus['rejected'] || 0,
      icon: AlertCircle,
      gradient: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600'
    }
  ];

  const filteredSubmissions = submissions.filter(submission => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      submission.form.name.toLowerCase().includes(search) ||
      submission.submittedBy?.toLowerCase().includes(search) ||
      submission.memberComputerId?.toString().includes(search) ||
      submission.id.toLowerCase().includes(search)
    );
  });

  if (loading && submissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#038DCD]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Form Submissions</h1>
              <p className="text-blue-100">Manage and review all member submissions</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleExport}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Export</span>
              </button>
              <button
                onClick={fetchSubmissions}
                disabled={loading}
                className="px-5 py-2.5 bg-white text-[#038DCD] hover:bg-blue-50 rounded-xl flex items-center gap-2 transition-all duration-200 hover:scale-105 font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-rose-900">Error loading submissions</p>
                <p className="text-rose-700 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-rose-500 hover:text-rose-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={idx}
                className={`${stat.bgColor} rounded-2xl border-2 border-transparent hover:border-current p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl ${stat.iconColor} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${stat.iconColor}`}>{stat.value}</p>
                  </div>
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Member ID, Name, Form, or Submission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
            />
          </div>

          {/* Filter Toggle Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium mb-4"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Filters */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none bg-white transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Form ID</label>
              <input
                type="text"
                placeholder="Enter Form ID"
                value={filterForm}
                onChange={(e) => {
                  setFilterForm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Reset Filters
              </button>
            </div>

            <div className="flex items-end md:hidden">
              <button
                onClick={handleExport}
                className="w-full px-4 py-2.5 bg-[#038DCD] hover:bg-[#0369A1] text-white rounded-xl flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-900 text-lg font-semibold mb-2">No submissions found</p>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Form</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Member ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Submitted By</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#038DCD]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-[#038DCD]" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 line-clamp-2">{submission.form.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 font-mono">{submission.memberComputerId ? submission.memberComputerId.toString() : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {submission.submittedBy ? (
                              <>
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">{submission.submittedBy}</span>
                              </>
                            ) : (
                              <>
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-400 italic">Anonymous</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(submission.submissionDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${getStatusColor(submission.status)}`}>
                            {getStatusIcon(submission.status)}
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowDetailModal(true);
                              }}
                              className="p-2 hover:bg-[#038DCD]/10 rounded-lg text-[#038DCD] transition-colors group"
                              title="View details"
                            >
                              <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors group"
                              title="Delete submission"
                            >
                              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="bg-slate-50 border-t-2 border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">
                    Showing <span className="font-semibold">{((currentPage - 1) * limit) + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(currentPage * limit, pagination.total)}</span> of{' '}
                    <span className="font-semibold">{pagination.total}</span> submissions
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                ? 'bg-[#038DCD] text-white'
                                : 'hover:bg-slate-100 text-slate-700'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <span className="sm:hidden px-3 py-1.5 text-sm text-slate-600 font-medium">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                      disabled={currentPage >= pagination.pages}
                      className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white p-6 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">{selectedSubmission.form.name}</h2>
                </div>
                <p className="text-blue-100 text-sm">Submission Details</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Submission Info */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6 border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#038DCD] rounded-full"></div>
                  Submission Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submission ID</p>
                    <p className="text-slate-900 font-mono text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">{selectedSubmission.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Member ID</p>
                    <p className="text-slate-900 font-semibold text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">
                      {selectedSubmission.memberComputerId ? selectedSubmission.memberComputerId.toString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submitted By</p>
                    <p className="text-slate-900 font-semibold text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">{selectedSubmission.submittedBy || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border-2 ${getStatusColor(selectedSubmission.status)}`}>
                      {getStatusIcon(selectedSubmission.status)}
                      {selectedSubmission.status.charAt(0).toUpperCase() + selectedSubmission.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Submission Date</p>
                    <p className="text-slate-900 font-semibold text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">{formatDate(selectedSubmission.submissionDate)}</p>
                  </div>
                  {selectedSubmission.approvedBy && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Approved By</p>
                      <p className="text-slate-900 font-semibold text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">{selectedSubmission.approvedBy}</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Field Values */}
              {selectedSubmission.fieldValues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#F9C856] rounded-full"></div>
                    Form Data
                  </h3>
                  <div className="space-y-3">
                    {selectedSubmission.fieldValues.map((fv, idx) => (
                      <div key={fv.fieldId} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-[#038DCD] transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{fv.field.fieldLabel}</p>
                          <span className="text-xs text-slate-400 font-mono">#{idx + 1}</span>
                        </div>
                        <p className="text-slate-900 break-words">{fv.value || <span className="text-slate-400 italic">(empty)</span>}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSubmission.notes && (
                <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-xl">
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-slate-900 text-sm">{selectedSubmission.notes}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t-2 border-slate-200 p-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-semibold transition-colors border-2 border-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(selectedSubmission.id)}
                className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
}