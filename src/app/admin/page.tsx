'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { useNotification } from '@/components/Notification';
import {
  Users,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import DashboardCharts from './_components/DashboardCharts';

interface ChartDataPoint {
  date: string;
  fullDate: string;
  members: number;
  applications: number;
}

interface Registration {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    date: string;
    category: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { showNotification } = useNotification();
  const [statsData, setStatsData] = useState({
    totalMembers: 0,
    newApplications: 0,
    pendingReview: 0,
    approvedToday: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Record<string, unknown>[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const { getDashboardStats } = await import('./actions');

        const statsResult = await getDashboardStats();

        if (!isMounted) return;
        setStatsData(statsResult.stats);
        setRecentApplications(statsResult.recentApplications);
        setChartData(statsResult.chartData || []);

        // Fetch event registrations
        const eventResponse = await fetch('/api/admin/events/registrations');
        if (eventResponse.ok && isMounted) {
          const eventData = await eventResponse.json();
          setEventRegistrations(eventData);
          setLoading(false);
        } else if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load dashboard data', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegistrationAction = async (id: string, status: string, notes?: string) => {
    try {
      const response = await fetch('/api/admin/events/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes })
      });

      if (response.ok) {
        showNotification('Registration updated successfully', 'success');
        // Update local state instead of re-fetching all registrations
        setEventRegistrations(prev => 
          prev.map(reg => 
            reg.id === id ? { ...reg, status: status as 'pending' | 'approved' | 'rejected' | 'cancelled' } : reg
          )
        );
      } else {
        showNotification('Failed to update registration', 'error');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      showNotification('Failed to update registration', 'error');
    }
  };

  const stats = [
    { name: 'Total Members', value: loading ? '...' : statsData.totalMembers.toLocaleString(), change: 'Active', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'New Applications', value: loading ? '...' : statsData.newApplications.toLocaleString(), change: 'Last 30 days', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Pending Review', value: loading ? '...' : statsData.pendingReview.toLocaleString(), change: 'To review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Event Registrations', value: loading ? '...' : eventRegistrations.filter(r => r.status === 'pending').length.toString(), change: 'Pending approval', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-slate-600">Welcome back, {user?.name || 'Admin'}! Here&apos;s what&apos;s happening today.</p>
        </div>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-slate-500 text-xs font-medium truncate">{stat.name}</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">{stat.value}</p>
              </div>
              <p className="text-slate-500 text-xs">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      {!loading && chartData.length > 0 && (
        <DashboardCharts data={chartData} />
      )}

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-3 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h2 className="text-lg font-bold text-slate-900">Recent Signups</h2>
            <button className="text-xs sm:text-sm font-semibold text-[#038DCD] hover:text-[#0369A1] self-start sm:self-auto">View All</button>
          </div>
          <div className="p-3 sm:p-6">
            {/* Mobile: Card layout, Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="pb-4">Applicant</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Date</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-4 text-sm">Loading recent activity...</td></tr>
                  ) : recentApplications.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4 text-sm">No recent activity.</td></tr>
                  ) : (
                    recentApplications.map((app) => (
                      <tr key={app.id as string} className="group hover:bg-slate-50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                              {app.avatar as string}
                            </div>
                            <span className="font-medium text-slate-900">{app.applicant as string}</span>
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">{app.type as string}</td>
                        <td className="py-4 text-slate-600">{app.date as string}</td>
                        <td className="py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700`}>
                            {app.status as string}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile: Card layout */}
            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="text-center py-4 text-sm text-slate-600">Loading recent activity...</div>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-4 text-sm text-slate-600">No recent activity.</div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id as string} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                        {app.avatar as string}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{app.applicant as string}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 whitespace-nowrap`}>
                        {app.status as string}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>{app.type as string}</span>
                      <span>{app.date as string}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Activity Summary */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => router.push('/admin/members')}
                className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 hover:border-[#038DCD] hover:bg-blue-50 transition-all group text-left cursor-pointer text-sm sm:text-base"
              >
                <div className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700 truncate">Manage Members</span>
              </button>
              <button
                onClick={() => router.push('/admin/form-builder')}
                className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left cursor-pointer text-sm sm:text-base"
              >
                <div className="p-1.5 sm:p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-purple-700 truncate">Create Form</span>
              </button>
              <button
                onClick={() => router.push('/admin/submissions')}
                className="w-full flex items-center gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all group text-left cursor-pointer text-sm sm:text-base"
              >
                <div className="p-1.5 sm:p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors shrink-0">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-green-700 truncate">View Submissions</span>
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-2xl border border-amber-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Pending Actions</h2>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 sm:p-3 bg-white rounded-lg border border-amber-100 gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">Forms Pending Review</p>
                  <p className="text-xs sm:text-sm text-slate-600">Applications awaiting approval</p>
                </div>
                <span className="bg-amber-100 text-amber-700 px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap">
                  {statsData.pendingReview}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2.5 sm:p-3 bg-white rounded-lg border border-amber-100 gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">Approved Today</p>
                  <p className="text-xs sm:text-sm text-slate-600">Successfully processed submissions</p>
                </div>
                <span className="bg-green-100 text-green-700 px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap">
                  {statsData.approvedToday}
                </span>
              </div>
              <button
                onClick={() => router.push('/admin/submissions')}
                className="w-full mt-2 p-2 sm:p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Review Pending Forms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Event Registrations Section */}
      <div className="bg-white rounded-lg sm:rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-3 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h2 className="text-lg font-bold text-slate-900">Event Registration Requests</h2>
          <button
            onClick={() => router.push('/admin/events')}
            className="text-xs sm:text-sm font-semibold text-[#038DCD] hover:text-[#0369A1] self-start sm:self-auto"
          >
            Manage Events
          </button>
        </div>
        <div className="p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-6 sm:py-8">
              <div className="w-8 h-8 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 text-sm sm:text-base">Loading event registrations...</p>
            </div>
          ) : eventRegistrations.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-slate-600 text-sm sm:text-base">No event registration requests.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {eventRegistrations.slice(0, 5).map((registration) => (
                <div key={registration.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200 gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base min-w-0 truncate">{registration.event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${registration.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        registration.status === 'approved' ? 'bg-green-100 text-green-700' :
                          registration.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {registration.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mb-1">
                      <span className="font-semibold">Member:</span> {registration.memberName}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      <span className="font-semibold">Event Date:</span> {new Date(registration.event.date).toLocaleDateString()}
                    </p>
                    {registration.notes && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
                        <span className="font-semibold">Notes:</span> {registration.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-end">
                    {registration.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleRegistrationAction(registration.id, 'approved')}
                          className="px-2 sm:px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRegistrationAction(registration.id, 'rejected')}
                          className="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {registration.status === 'approved' && (
                      <button
                        onClick={() => handleRegistrationAction(registration.id, 'cancelled')}
                        className="px-2 sm:px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {eventRegistrations.length > 5 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => router.push('/admin/events')}
                    className="text-sm font-semibold text-[#038DCD] hover:text-[#0369A1]"
                  >
                    View All Registrations ({eventRegistrations.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
