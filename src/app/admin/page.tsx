'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [statsData, setStatsData] = useState({
    totalMembers: 0,
    newApplications: 0,
    pendingReview: 0,
    approvedToday: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Record<string, unknown>[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { getDashboardStats } = await import('./actions');

        const statsResult = await getDashboardStats();

        setStatsData(statsResult.stats);
        setRecentApplications(statsResult.recentApplications);
        setChartData(statsResult.chartData || []);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = [
    { name: 'Total Members', value: loading ? '...' : statsData.totalMembers.toLocaleString(), change: 'Active', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'New Applications', value: loading ? '...' : statsData.newApplications.toLocaleString(), change: 'Last 30 days', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Pending Review', value: loading ? '...' : statsData.pendingReview.toLocaleString(), change: 'To review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Joined Today', value: loading ? '...' : statsData.approvedToday.toLocaleString(), change: 'Today', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-600">Welcome back, {user?.name || 'Admin'}! Here&apos;s what&apos;s happening today.</p>
        </div>
        {/* Compact Stats Row */}
        <div className="flex gap-4 mt-4 sm:mt-0">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-slate-500 text-xs font-medium">{stat.name}</p>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      {!loading && chartData.length > 0 && (
        <DashboardCharts data={chartData} />
      )}

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Signups</h2>
            <button className="text-sm font-semibold text-[#038DCD] hover:text-[#0369A1]">View All</button>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
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
                    <tr><td colSpan={5} className="text-center py-4">Loading recent activity...</td></tr>
                  ) : recentApplications.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No recent activity.</td></tr>
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
          </div>
        </div>

        {/* Quick Actions / Activity Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/admin/members')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#038DCD] hover:bg-blue-50 transition-all group text-left cursor-pointer"
              >
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">Manage Members</span>
              </button>
              <button
                onClick={() => router.push('/admin/form-builder')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left cursor-pointer"
              >
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-purple-700">Create Form</span>
              </button>
              <button
                onClick={() => router.push('/admin/submissions')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all group text-left cursor-pointer"
              >
                <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-green-700">View Submissions</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Pending Actions</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100">
                <div>
                  <p className="font-semibold text-slate-900">Forms Pending Review</p>
                  <p className="text-sm text-slate-600">Applications awaiting approval</p>
                </div>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold text-sm">
                  {statsData.pendingReview}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-amber-100">
                <div>
                  <p className="font-semibold text-slate-900">Approved Today</p>
                  <p className="text-sm text-slate-600">Successfully processed submissions</p>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                  {statsData.approvedToday}
                </span>
              </div>
              <button
                onClick={() => router.push('/admin/submissions')}
                className="w-full mt-2 p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
              >
                Review Pending Forms
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}