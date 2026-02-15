'use client';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  Users,
  User,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState({
    totalMembers: 0,
    newApplications: 0,
    pendingReview: 0,
    approvedToday: 0,
  });
  const [recentApplications, setRecentApplications] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { getDashboardStats } = await import('./actions');
        const data = await getDashboardStats();
        setStatsData(data.stats);
        setRecentApplications(data.recentApplications);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    { name: 'Total Members', value: loading ? '...' : statsData.totalMembers.toLocaleString(), change: '+0% (Dyn)', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'New Applications', value: loading ? '...' : statsData.newApplications.toLocaleString(), change: '+0% (30d)', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Pending Review', value: loading ? '...' : statsData.pendingReview.toLocaleString(), change: '0%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Joined Today', value: loading ? '...' : statsData.approvedToday.toLocaleString(), change: 'Today', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600">Welcome back, {user?.name || 'Admin'}! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={'text-green-600 font-medium'}>
                  {stat.change}
                </span>
                <span className="text-slate-500 ml-2">reference</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

        {/* Quick Actions / System Health */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-[#038DCD] hover:bg-blue-50 transition-all group text-left">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">Add New Member</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group text-left">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-purple-700">Create Form</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#038DCD] to-[#0369A1] rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h2 className="text-lg font-bold">System Status</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Server Load</span>
                <span className="font-bold">24%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-1.5">
                <div className="bg-white/90 h-1.5 rounded-full w-1/4"></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-100">Database</span>
                <span className="font-bold text-green-300">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}