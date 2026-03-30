'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import {
  Users,
  Receipt,
  FileText,
  Calendar,
  Briefcase,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

interface DashboardData {
  member: {
    MemComputerID: string;
    MemMembershipNo?: string;
    MemName?: string;
    MemFatherName?: string;
    MemCNIC?: string;
    MemRegistrationDate?: string;
    email?: string;
    cellNumbers: string[];
    surname?: string;
    gender?: string;
    area?: string;
    profileImage?: string | null;
  };
  fees: {
    summary: {
      totalDue: number;
      totalPaid: number;
      totalDiscount: number;
      balance: number;
      status: string;
    };
  };
  family: {
    spouse: number;
    children: number;
    parents: number;
    total: number;
  };
  applications: Array<{
    id: string;
    status: string;
  }>;
}

export default function MemberDashboard() {
  const { isLoading: authLoading } = useMemberAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/member/dashboard');
      if (res.ok) {
        setDashboardData(await res.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };



  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-primary-blue-200 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground-300">Loading your dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500 font-semibold">Failed to load dashboard data</p>
        <button
          onClick={fetchDashboardData}
          className="px-5 py-2.5 bg-primary-blue text-primary-white text-sm font-bold rounded-full hover:bg-primary-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const member = dashboardData.member;
  const feeData = dashboardData.fees;
  const family = dashboardData.family;
  const applications = dashboardData.applications;

  const totalFamily = family.total;
  const paidPct = feeData ? Math.round((feeData.summary.totalPaid / feeData.summary.totalDue) * 100) || 0 : 0;

  const quickLinks = [
    {
      title: 'Submit Application',
      description: 'Apply for welfare, scholarship, or medical assistance',
      href: '/forms',
      icon: FileText,
      color: 'bg-primary-blue-100 text-primary-blue-700 hover:border-primary-blue'
    },
    {
      title: 'Register for Events',
      description: 'View and register for upcoming community events',
      href: '/member/events',
      icon: Calendar,
      color: 'bg-primary-green-100 text-primary-green-700 hover:border-primary-green'
    },
    {
      title: 'Submit Business Ad',
      description: 'Advertise your business on our platform',
      href: '/member/business-ads/new',
      icon: Briefcase,
      color: 'bg-primary-yellow-100 text-primary-yellow-700 hover:border-primary-yellow'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-foreground-300 mt-1">Welcome back, {member?.MemName?.split(' ')[0] || 'Member'}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-background rounded-2xl border-2 border-primary-silver-400 overflow-hidden shadow-sm">
        {/* Accent stripe */}
        <div className="h-1.5 bg-gradient-to-r from-primary-blue via-primary-green to-primary-yellow" />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0 relative">
              {member?.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member?.MemName || 'Profile'}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary-blue to-primary-yellow flex items-center justify-center shadow-md">
                  <span className="text-primary-white font-bold text-2xl">
                    {member?.MemName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'M'}
                  </span>
                </div>
              )}
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-green-600">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-green inline-block" />
                Active
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">{member?.MemName || 'Member'}</h2>
                {member?.surname && (
                  <span className="text-xs font-bold text-primary-blue bg-primary-blue-100 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {member.surname}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground-300 font-medium mb-4">
                # {member?.MemMembershipNo || 'N/A'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                {[
                  { label: 'CNIC', value: member?.MemCNIC },
                  { label: "Father's Name", value: member?.MemFatherName },
                  { label: 'Email', value: member?.email },
                  { label: 'Contact', value: member?.cellNumbers?.[0] },
                  { label: 'Gender', value: member?.gender },
                  { label: 'Area', value: member?.area },
                ].filter(field => field.value).slice(0, 6).map((field) => (
                  <div key={field.label}>
                    <p className="text-[10px] font-bold text-foreground-200 uppercase tracking-widest mb-0.5">{field.label}</p>
                    <p className="font-semibold text-foreground-400 truncate">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Family Members */}
        <Link
          href="/member/family"
          className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 sm:p-5 hover:border-primary-blue hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-blue" />
            </div>
            <ArrowRight className="w-4 h-4 text-foreground-200 group-hover:text-primary-blue transition-colors" />
          </div>
          <p className="text-xs font-bold text-foreground-200 uppercase tracking-widest mb-1">Family</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary-blue">{totalFamily}</p>
          <p className="text-xs text-foreground-300 mt-2">
            {family.spouse + family.children + family.parents === 0
              ? 'No family members'
              : `Spouse: ${family.spouse}, Children: ${family.children}, Parents: ${family.parents}`
            }
          </p>
        </Link>

        {/* Fee Balance */}
        <Link
          href="/member/fees"
          className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 sm:p-5 hover:border-primary-yellow hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-yellow-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary-yellow-700" />
            </div>
            <ArrowRight className="w-4 h-4 text-foreground-200 group-hover:text-primary-yellow-700 transition-colors" />
          </div>
          <p className="text-xs font-bold text-foreground-200 uppercase tracking-widest mb-1">Balance</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary-yellow-700">
            {feeData ? feeData.summary.balance.toLocaleString() : '...'}
          </p>
          <div className="mt-2">
            <div className="h-1.5 bg-primary-silver-300 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-blue to-primary-yellow"
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <p className="text-xs text-foreground-300 mt-1">{paidPct}% paid</p>
          </div>
        </Link>

        {/* Applications */}
        <Link
          href="/member/applications"
          className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 sm:p-5 hover:border-primary-green hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-green-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-green-700" />
            </div>
            <ArrowRight className="w-4 h-4 text-foreground-200 group-hover:text-primary-green transition-colors" />
          </div>
          <p className="text-xs font-bold text-foreground-200 uppercase tracking-widest mb-1">Applications</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary-green-700">{applications.length}</p>
          <p className="text-xs text-foreground-300 mt-1">
            {applications.filter(a => a.status === 'pending').length} pending
          </p>
        </Link>

        {/* Quick Stats */}
        <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-navy-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-navy" />
            </div>
            <Clock className="w-4 h-4 text-foreground-200" />
          </div>
          <p className="text-xs font-bold text-foreground-200 uppercase tracking-widest mb-1">Member Since</p>
          <p className="text-lg sm:text-xl font-bold text-accent-navy">
            {member?.MemRegistrationDate
              ? new Date(member.MemRegistrationDate).getFullYear()
              : 'N/A'
            }
          </p>
          <p className="text-xs text-foreground-300 mt-1">
            {member?.MemRegistrationDate
              ? `${Math.floor((Date.now() - new Date(member.MemRegistrationDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years`
              : ''
            }
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.title}
                href={link.href}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 border-primary-silver-400 ${link.color} transition-all group`}
              >
                <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground group-hover:text-inherit transition-colors">{link.title}</p>
                  <p className="text-xs text-foreground-300 truncate">{link.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary-silver-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-foreground-200" />
          </div>
          <p className="font-semibold text-foreground-400 mb-1">No recent activity</p>
          <p className="text-sm text-foreground-300">Your recent actions will appear here</p>
        </div>
      </div>


    </div>
  );
}
