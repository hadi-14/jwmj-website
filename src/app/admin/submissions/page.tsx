'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Calendar, CheckCircle, Clock, Trash2, Eye, Download,
  AlertCircle, X, FileText, User, Mail, Hash, SlidersHorizontal,
  RefreshCw, ChevronLeft, ChevronRight, XCircle
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNotification, ConfirmationModal } from '@/components/Notification';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormField { fieldLabel: string; fieldName: string; }
interface FieldValue { fieldId: string; value: string | null; field: FormField; }
interface FormSubmission {
  id: string; formId: string;
  form: { name: string; formType: string; };
  memberComputerId: bigint | null;
  submissionDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedBy: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  notes: string | null;
  fieldValues: FieldValue[];
}
interface PaginationData { page: number; limit: number; total: number; pages: number; }
interface SubmissionsResponse { success: boolean; data: FormSubmission[]; pagination: PaginationData; }
interface StatsData {
  totalSubmissions: number;
  byStatus: Record<string, number>;
  recentSubmissions: Array<{ id: string; submissionDate: string; status: string; }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  submitted: { label: 'Submitted', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: <FileText className="w-3 h-3" /> },
  rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: <AlertCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 ${accent ? 'bg-[#038DCD] border-[#038DCD]' : 'bg-white border-slate-200'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-white/20' : 'bg-[#038DCD]/8'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[#038DCD]'}`} />
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${accent ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-2xl font-bold leading-none ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SubmissionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [filterForm, setFilterForm] = useState(searchParams.get('formId') || 'all');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  const limit = 20;
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selected, setSelected] = useState<FormSubmission | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams();
      params.set('page', currentPage.toString()); params.set('limit', limit.toString());
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterForm !== 'all' && filterForm !== '') params.set('formId', filterForm);
      const res = await fetch(`/api/submissions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data: SubmissionsResponse = await res.json();
      setSubmissions(data.data); setPagination(data.pagination);
      const np = new URLSearchParams();
      np.set('page', currentPage.toString());
      if (filterStatus !== 'all') np.set('status', filterStatus);
      if (filterForm !== 'all' && filterForm !== '') np.set('formId', filterForm);
      router.push(`?${np}`, { scroll: false });
    } catch (e) { setError(e instanceof Error ? e.message : 'An error occurred'); }
    finally { setLoading(false); }
  }, [currentPage, limit, filterStatus, filterForm, router]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterForm !== 'all' && filterForm !== '') params.set('formId', filterForm);
      const res = await fetch(`/api/submissions/stats?${params}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data.data);
    } catch { /* silent */ }
  }, [filterForm]);

  useEffect(() => { fetchSubmissions(); fetchStats(); }, [fetchSubmissions, fetchStats]);

  const handleDelete = (id: string) => {
    setSubmissionToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    try {
      const res = await fetch(`/api/submissions/${submissionToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSubmissions(s => s.filter(x => x.id !== submissionToDelete));
      if (selected?.id === submissionToDelete) setSelected(null);
      fetchStats();
      showNotification('Submission deleted successfully', 'success');
    } catch (e) {
      showNotification(e instanceof Error ? e.message : 'Failed to delete', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setSubmissionToDelete(null);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterForm !== 'all' && filterForm !== '') params.set('formId', filterForm);
      const res = await fetch(`/api/submissions/export?${params}`);
      if (!res.ok) throw new Error('Failed to export');
      const csv = await res.text();
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      const a = document.createElement('a'); a.href = url;
      a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { showNotification(e instanceof Error ? e.message : 'Failed to export', 'error'); }
  };

  const handleStatusUpdate = async (id: string, status: FormSubmission['status']) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setSubmissions(s => s.map(x => x.id === id ? { ...x, status } : x));
      if (selected?.id === id) setSelected({ ...selected, status });
      fetchStats();
    } catch (e) { showNotification(e instanceof Error ? e.message : 'Failed to update', 'error'); }
  };

  const filtered = submissions.filter(s => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return s.form.name.toLowerCase().includes(q) ||
      s.submittedBy?.toLowerCase().includes(q) ||
      s.memberComputerId?.toString().includes(q) ||
      s.id.toLowerCase().includes(q);
  });

  const chartData = Object.entries(stats?.byStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1), count
  }));

  const PIE_COLORS = ['#038DCD', '#0260a8', '#10b981', '#f59e0b', '#ef4444'];

  if (loading && submissions.length === 0) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-10 h-10 mx-auto mb-3">
          <div className="absolute inset-0 border-2 border-[#038DCD]/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-[#038DCD] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading submissions...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">

      {/* ── Toast error ── */}
      {error && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium bg-white border border-red-200 text-red-800"
          style={{ animation: 'slideIn 0.2s ease' }}>
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="Total" value={stats?.totalSubmissions || 0} accent />
          <StatCard icon={CheckCircle} label="Approved" value={stats?.byStatus['approved'] || 0} />
          <StatCard icon={Clock} label="Pending" value={stats?.byStatus['pending'] || stats?.byStatus['submitted'] || 0} />
          <StatCard icon={AlertCircle} label="Rejected" value={stats?.byStatus['rejected'] || 0} />
        </div>

        {/* ── Charts ── */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-bold text-slate-900 mb-5">Status Distribution</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#038DCD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-bold text-slate-900 mb-5">Status Breakdown</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="count" paddingAngle={3}>
                    {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by member ID, name, form, or submission ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm
                focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all"
            />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors
              ${showFilters ? 'bg-[#038DCD]/10 border-[#038DCD]/30 text-[#038DCD]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={fetchSubmissions} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Status</label>
                <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all cursor-pointer">
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Form ID</label>
                <input type="text" placeholder="Enter Form ID" value={filterForm === 'all' ? '' : filterForm}
                  onChange={(e) => { setFilterForm(e.target.value || 'all'); setCurrentPage(1); }}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all" />
              </div>
              <div className="flex items-end">
                <button onClick={() => { setFilterStatus('all'); setFilterForm('all'); setSearchTerm(''); setCurrentPage(1); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                  <X className="w-4 h-4" /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-700 mb-1">No submissions found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      {['Form', 'Member ID', 'Submitted By', 'Date', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#038DCD]/8 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-[#038DCD]" />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 line-clamp-1">{s.form.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm text-slate-600 font-mono">
                              {s.memberComputerId ? s.memberComputerId.toString() : '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {s.submittedBy
                              ? <><Mail className="w-3.5 h-3.5 text-slate-400" /><span className="text-sm text-slate-600">{s.submittedBy}</span></>
                              : <><User className="w-3.5 h-3.5 text-slate-300" /><span className="text-sm text-slate-400 italic">Anonymous</span></>
                            }
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDate(s.submissionDate)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelected(s)}
                              className="p-2 hover:bg-[#038DCD]/10 rounded-lg text-slate-400 hover:text-[#038DCD] transition-colors" title="View details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.id)}
                              className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
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
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{((currentPage - 1) * limit) + 1}</span>–<span className="font-semibold text-slate-700">{Math.min(currentPage * limit, pagination.total)}</span> of <span className="font-semibold text-slate-700">{pagination.total}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let p = i + 1;
                        if (pagination.pages > 5) {
                          if (currentPage <= 3) p = i + 1;
                          else if (currentPage >= pagination.pages - 2) p = pagination.pages - 4 + i;
                          else p = currentPage - 2 + i;
                        }
                        return (
                          <button key={p} onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors
                              ${currentPage === p ? 'bg-[#038DCD] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <span className="sm:hidden text-sm text-slate-600 font-medium px-2">
                      {currentPage} / {pagination.pages}
                    </span>
                    <button onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))} disabled={currentPage >= pagination.pages}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          DETAIL MODAL
      ══════════════════════════════════════════════════════════ */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          style={{ animation: 'fadeIn 0.15s ease' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#038DCD]/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#038DCD]" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selected.form.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{selected.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors ml-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Member ID', value: selected.memberComputerId?.toString() || '—', mono: true },
                  { label: 'Submitted By', value: selected.submittedBy || 'Anonymous' },
                  { label: 'Date', value: formatDate(selected.submissionDate) },
                  ...(selected.approvedBy ? [{ label: 'Approved By', value: selected.approvedBy }] : []),
                  ...(selected.approvedDate ? [{ label: 'Approved Date', value: formatDate(selected.approvedDate) }] : []),
                ].map(({ label, value, mono }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className={`text-sm font-semibold text-slate-900 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Field values */}
              {selected.fieldValues.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Form Data</p>
                  <div className="space-y-2">
                    {selected.fieldValues.map((fv, idx) => (
                      <div key={fv.fieldId} className="bg-white rounded-xl border border-slate-200 hover:border-[#038DCD]/30 transition-colors p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{fv.field.fieldLabel}</p>
                          <span className="text-[10px] text-slate-300 font-mono">#{idx + 1}</span>
                        </div>
                        <p className="text-sm text-slate-900">
                          {fv.value || <span className="text-slate-400 italic text-xs">Empty</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selected.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-2">Notes</p>
                  <p className="text-sm text-slate-800">{selected.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between">
              <button onClick={() => handleDelete(selected.id)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-semibold transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <div className="flex items-center gap-3">
                {selected.status !== 'approved' && (
                  <button onClick={() => handleStatusUpdate(selected.id, 'approved')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-sm font-semibold transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button onClick={() => handleStatusUpdate(selected.id, 'rejected')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-semibold transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                <button onClick={() => setSelected(null)}
                  className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Submission"
        message="Delete this submission? This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSubmission}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSubmissionToDelete(null);
        }}
        type="danger"
      />

      {/* <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      `}</style> */}
    </div>
  );
}