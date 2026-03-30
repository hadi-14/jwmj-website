'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Clock,
  Check,
  X,
  AlertCircle,
  Filter,
  Search,
  ExternalLink
} from 'lucide-react';

interface Application {
  id: string;
  formName: string;
  formType: string;
  submissionDate: string;
  status: string;
  notes: string;
}

interface AvailableForm {
  id: string;
  name: string;
  formType: string;
  description?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [availableForms, setAvailableForms] = useState<AvailableForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inprogress' | 'history' | 'new'>('inprogress');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [appRes, formsRes] = await Promise.all([
          fetch('/api/member/applications'),
          fetch('/api/forms?isActive=true&limit=50')
        ]);

        if (!isMounted) return;

        if (appRes.ok) {
          const data = await appRes.json();
          setApplications(data.applications || []);
        }
        if (formsRes.ok) {
          const data = await formsRes.json();
          setAvailableForms(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-primary-blue-200 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground-300">Loading applications...</p>
      </div>
    );
  }

  const statusStyles: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    approved: {
      bg: 'bg-primary-green-100',
      text: 'text-primary-green-700',
      border: 'border-primary-green-200',
      icon: <Check className="w-3.5 h-3.5" />
    },
    pending: {
      bg: 'bg-primary-yellow-100',
      text: 'text-primary-yellow-700',
      border: 'border-primary-yellow-200',
      icon: <Clock className="w-3.5 h-3.5" />
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: <X className="w-3.5 h-3.5" />
    },
    default: {
      bg: 'bg-primary-silver-200',
      text: 'text-foreground-400',
      border: 'border-primary-silver-400',
      icon: <AlertCircle className="w-3.5 h-3.5" />
    },
  };

  const getStatusStyle = (status: string) => {
    return statusStyles[status.toLowerCase()] || statusStyles.default;
  };

  const inProgressApps = applications.filter(app => app.status.toLowerCase() === 'pending');
  const historyApps = applications.filter(app => ['approved', 'rejected'].includes(app.status.toLowerCase()));

  const filteredApplications = (activeTab === 'inprogress' ? inProgressApps : historyApps).filter(app => {
    const matchesSearch = !searchQuery ||
      app.formName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.formType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    inprogress: inProgressApps.length,
    history: historyApps.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Applications</h1>
        <p className="text-foreground-300 mt-1">Submit and track your applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-primary-silver-400 flex-wrap">
        <button
          onClick={() => {
            setActiveTab('inprogress');
            setFilterStatus('all');
            setSearchQuery('');
          }}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'inprogress'
            ? 'border-primary-blue text-primary-blue'
            : 'border-transparent text-foreground-300 hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            In Progress
            {stats.inprogress > 0 && <span className="ml-1 bg-primary-yellow-100 text-primary-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">{stats.inprogress}</span>}
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('history');
            setFilterStatus('all');
            setSearchQuery('');
          }}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'history'
            ? 'border-primary-blue text-primary-blue'
            : 'border-transparent text-foreground-300 hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            History
            {stats.history > 0 && <span className="ml-1 bg-primary-blue-100 text-primary-blue text-xs font-bold px-2 py-0.5 rounded-full">{stats.history}</span>}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'new'
            ? 'border-primary-blue text-primary-blue'
            : 'border-transparent text-foreground-300 hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Application
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {(activeTab === 'inprogress' || activeTab === 'history') && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-300" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary-silver-400 rounded-xl text-foreground placeholder:text-foreground-300 focus:border-primary-blue focus:outline-none transition-colors"
              />
            </div>
            {activeTab === 'history' && (
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-background border-2 border-primary-silver-400 rounded-xl text-sm font-semibold text-foreground hover:bg-primary-silver-200 transition-colors w-full sm:w-auto justify-center"
                >
                  <Filter className="w-4 h-4" />
                  {filterStatus === 'all' ? 'All Status' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </button>
                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-background border-2 border-primary-silver-400 rounded-xl shadow-xl z-20 py-2">
                      {['all', 'approved', 'rejected'].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setFilterStatus(status);
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-primary-silver-200 transition-colors ${filterStatus === status ? 'font-bold text-primary-blue' : 'text-foreground'
                            }`}
                        >
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-8 text-center">
              <div className="w-16 h-16 bg-primary-silver-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-foreground-200" />
              </div>
              <h3 className="font-bold text-foreground mb-2">
                {activeTab === 'inprogress' ? 'No Active Applications' : 'No Applications'}
              </h3>
              <p className="text-sm text-foreground-300 mb-6">
                {activeTab === 'inprogress'
                  ? "You don't have any pending applications. Submit one to get started!"
                  : 'No completed applications yet.'
                }
              </p>
              {activeTab === 'inprogress' && (
                <button
                  onClick={() => setActiveTab('new')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-blue text-primary-white text-sm font-bold rounded-xl hover:bg-primary-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Submit Application
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app) => {
                const statusStyle = getStatusStyle(app.status);
                return (
                  <div
                    key={app.id}
                    className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 sm:p-5 hover:border-primary-blue hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-primary-blue-100 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground truncate">{app.formName}</h3>
                          <p className="text-xs text-foreground-300 mb-2">{app.formType}</p>
                          {app.notes && (
                            <p className="text-sm text-foreground-400 bg-primary-silver-100 rounded-lg px-3 py-2 line-clamp-2">
                              {app.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1.5 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          {statusStyle.icon}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <p className="text-xs text-foreground-300">
                          {new Date(app.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* New Application Tab */}
      {activeTab === 'new' && (
        <div className="space-y-6">
          {availableForms.length === 0 ? (
            <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-8 text-center">
              <div className="w-16 h-16 bg-primary-silver-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-foreground-200" />
              </div>
              <h3 className="font-bold text-foreground mb-2">No Available Forms</h3>
              <p className="text-sm text-foreground-300">Check back later for new forms.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-foreground-300">
                <p>Select a form below to submit an application:</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableForms.map((form) => (
                  <Link
                    key={form.id}
                    href={`/forms/${encodeURIComponent(form.formType)}`}
                    className="flex flex-col gap-3 p-4 border-2 border-primary-silver-400 rounded-xl hover:border-primary-blue hover:bg-primary-blue-50/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary-blue-100 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-primary-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground group-hover:text-primary-blue transition-colors line-clamp-1">{form.name}</p>
                        <p className="text-xs text-foreground-300">{form.formType}</p>
                      </div>
                    </div>
                    {form.description && (
                      <p className="text-xs text-foreground-400 line-clamp-2">{form.description}</p>
                    )}
                    <button
                      className="w-full py-2 px-3 bg-primary-blue text-primary-white text-xs font-bold rounded-lg hover:bg-primary-blue-600 transition-colors"
                      onClick={() => {
                        // Link click will handle navigation
                      }}
                    >
                      Apply Now
                    </button>
                  </Link>
                ))}
              </div>

              {availableForms.length > 6 && (
                <Link
                  href="/forms"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-primary-blue hover:underline"
                >
                  View all forms
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
