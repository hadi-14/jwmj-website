'use client';

import { useState, useEffect } from 'react';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { useNotification, ConfirmationModal } from '@/components/Notification';
import Image from "next/image";

interface MemberInfo {
  MemComputerID: string;
  MemWehvariaNo?: string;
  MemMembershipNo?: string;
  MemName?: string;
  MemFatherName?: string;
  MemMotherName?: string;
  MemCNIC?: string;
  MemDOB?: string;
  MemRegistrationDate?: string;
  MemPostalAddress?: string;
  email?: string;
  cellNumbers: string[];
  surname?: string;
  gender?: string;
  area?: string;
  country?: string;
  maritalStatus?: string;
  occupation?: string;
  qualification?: string;
  memberStatus?: string;
  isDeceased: boolean;
  isDeActive: boolean;
  profileImage?: string | null;
  hasProfileImage?: boolean;
}

interface FeeData {
  summary: {
    totalDue: number;
    totalPaid: number;
    totalDiscount: number;
    balance: number;
    status: string;
  };
  yearlyBreakdown: Array<{
    fiscalYear: string;
    feeAmount: number;
    paidAmount: number;
    balance: number;
    status: string;
  }>;
  annualFees: Array<{
    invoiceNo: string;
    invoiceDate: string;
    fiscalYear: string;
    amount: number;
    details: string;
  }>;
  payments: Array<{
    voucherNo: string;
    receiveDate: string;
    amount: number;
    discount: number;
  }>;
}

interface FamilyMember {
  id?: string | number;
  name?: string;
  membershipNo?: string;
  dob?: string;
  [key: string]: unknown;
}

interface FamilyTree {
  self: FamilyMember;
  spouse: FamilyMember[];
  children: FamilyMember[];
  parents: FamilyMember[];
}

interface Application {
  id: string;
  formName: string;
  formType: string;
  submissionDate: string;
  status: string;
  notes: string;
}

interface EventRegistration {
  eventId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  desc: string;
  date: string;
  time?: string;
  islamicDate?: string;
  venue?: string;
  category: string;
  img: string;
  fb?: string;
  createdAt: string;
  updatedAt: string;
}

interface BusinessAdRequest {
  id: number;
  memberId: number;
  businessName: string;
  category: string;
  phone: string;
  email: string;
  website: string | null;
  address: string;
  established: string;
  owner: string;
  specialOffers: string | null;
  services: string;
  description: string;
  detailedDescription: string;
  logo: string | null;
  requestedStartDate: Date;
  requestedEndDate: Date;
  status: string;
  submittedAt: Date;
  member: {
    MemName: string;
    MemMembershipNo: string;
    MemFatherName: string;
  };
  approvals: Array<{
    id: number;
    approvedStartDate: Date;
    approvedEndDate: Date;
    adminNotes?: string;
    approvedAt: Date;
  }>;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function MemberDashboard() {
  const { logout, isLoading: authLoading } = useMemberAuth();
  const { showNotification } = useNotification();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => { fetchMemberInfo(); }, []);

  useEffect(() => {
    if (activeTab === 'family' && !familyTree) fetchFamilyTree();
    else if (activeTab === 'fees' && !feeData) fetchFeeData();
    else if (activeTab === 'applications' && applications.length === 0) fetchApplications();
    else if (activeTab === 'events' && events.length === 0) fetchEvents();
    // Also load family tree for events tab since it's needed for registration
    if (activeTab === 'events' && !familyTree) fetchFamilyTree();
  }, [activeTab, applications.length, familyTree, feeData, events.length]);

  const fetchMemberInfo = async () => {
    try {
      const response = await fetch('/api/member');
      if (response.ok) { const data = await response.json(); setMember(data); }
      else console.error('Failed to fetch member info');
    } catch (error) { console.error('Error fetching member info:', error); }
    finally { setLoading(false); }
  };

  const fetchFamilyTree = async () => {
    try {
      const response = await fetch('/api/member/family-tree');
      if (response.ok) { const data = await response.json(); setFamilyTree(data); }
    } catch (error) { console.error('Error fetching family tree:', error); }
  };

  const fetchFeeData = async () => {
    try {
      const response = await fetch('/api/member/fees');
      if (response.ok) { const data = await response.json(); setFeeData(data); }
    } catch (error) { console.error('Error fetching fee data:', error); }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/member/applications');
      if (response.ok) { const data = await response.json(); setApplications(data.applications || []); }
    } catch (error) { console.error('Error fetching applications:', error); }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) { const data = await response.json(); setEvents(data); }
    } catch (error) { console.error('Error fetching events:', error); }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-10 h-10 border-[3px] border-[#038DCD]/20 border-t-[#038DCD] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <p className="text-red-500 font-semibold">Failed to load member information</p>
        <button
          onClick={fetchMemberInfo}
          className="px-5 py-2.5 bg-[#038DCD] text-white text-sm font-bold rounded-full hover:bg-[#026fa0] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'Events' },
    { id: 'family', label: 'Family Tree' },
    { id: 'fees', label: 'Fee Status' },
    { id: 'applications', label: 'Applications' },
    { id: 'business-ads', label: 'Business Ads' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top nav bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo / brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#038DCD] to-[#F9C856] flex items-center justify-center">
              <span className="text-white font-bold text-sm">J</span>
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">Member Portal</span>
          </div>

          {/* Welcome + logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              Welcome, <span className="font-semibold text-gray-800">{member?.MemName?.split(' ')[0]}</span>
            </span>
            <button
              onClick={logout}
              className="px-4 py-1.5 text-sm font-bold text-red-500 border border-red-200 rounded-full hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Accent stripe */}
          <div className="h-1 bg-linear-to-r from-[#038DCD] to-[#F9C856]" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">

              {/* Avatar */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                {member?.profileImage ? (
                  <Image
                    src={member.profileImage}
                    alt={member?.MemName || 'Profile'}
                    width={96} height={96}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-linear-to-br from-[#038DCD] to-[#F9C856] flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-3xl">
                      {member?.MemName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'M'}
                    </span>
                  </div>
                )}
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{member?.MemName || 'Member'}</h2>
                  {member?.surname && (
                    <span className="text-xs font-bold text-[#038DCD] bg-[#e8f6fd] px-3 py-0.5 rounded-full uppercase tracking-wider">
                      {member.surname}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 font-medium mb-5">
                  # {member?.MemMembershipNo || 'N/A'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                  {[
                    { label: 'CNIC', value: member?.MemCNIC },
                    { label: "Father's Name", value: member?.MemFatherName },
                    { label: 'Date of Birth', value: member?.MemDOB ? new Date(member.MemDOB).toLocaleDateString() : undefined },
                    { label: 'Email', value: member?.email },
                    { label: 'Contact', value: member?.cellNumbers?.[0] },
                    { label: 'Gender', value: member?.gender },
                    member?.occupation ? { label: 'Occupation', value: member.occupation } : null,
                    member?.area ? { label: 'Area', value: member.area } : null,
                    member?.maritalStatus ? { label: 'Marital Status', value: member.maritalStatus } : null,
                  ].filter(Boolean).map((field) => (
                    <div key={field!.label}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{field!.label}</p>
                      <p className="text-sm font-semibold text-gray-700">{field!.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-1.5 shadow-sm flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-fit px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 ${activeTab === tab.id
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          {activeTab === 'overview' && <OverviewTab feeData={feeData} familyTree={familyTree} applications={applications} />}
          {activeTab === 'events' && <EventsTab events={events} member={member} familyTree={familyTree} showNotification={showNotification} showDeleteConfirm={showDeleteConfirm} setShowDeleteConfirm={setShowDeleteConfirm} eventToDelete={eventToDelete} setEventToDelete={setEventToDelete} />}
          {activeTab === 'family' && <FamilyTreeTab familyTree={familyTree} />}
          {activeTab === 'fees' && <FeeStatusTab feeData={feeData} />}
          {activeTab === 'applications' && <ApplicationsTab applications={applications} />}
          {activeTab === 'business-ads' && <BusinessAdsTab />}
        </div>

      </main>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ feeData, familyTree, applications }: {
  feeData: FeeData | null;
  familyTree: FamilyTree | null;
  applications: Application[];
}) {
  const totalFamily = familyTree
    ? (familyTree.spouse?.length || 0) + (familyTree.children?.length || 0) + (familyTree.parents?.length || 0)
    : null;
  const paidPct = feeData ? Math.round((feeData.summary.totalPaid / feeData.summary.totalDue) * 100) : 0;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Dashboard Overview</h3>
      <p className="text-sm text-gray-400 mb-6">Your membership summary at a glance</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Family */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#038DCD]/8" />
          <div className="w-10 h-10 rounded-xl bg-[#e8f6fd] flex items-center justify-center text-xl mb-3">👨‍👩‍👧‍👦</div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Family Members</p>
          <p className="text-3xl font-bold text-[#038DCD]">{totalFamily ?? '…'}</p>
          <p className="text-xs text-gray-400 mt-1">Registered in system</p>
        </div>

        {/* Fee balance */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-[#F9C856]/20" />
          <div className="w-10 h-10 rounded-xl bg-[#fefaec] flex items-center justify-center text-xl mb-3">💰</div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fee Balance</p>
          <p className="text-3xl font-bold text-[#c8920f]">{feeData ? feeData.summary.balance.toLocaleString() : '…'}</p>
          <p className="text-xs text-gray-400 mt-1">{feeData ? `PKR ${feeData.summary.totalDue.toLocaleString()} total due` : 'Loading…'}</p>
          {feeData && (
            <div className="h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-linear-to-r from-[#038DCD] to-[#F9C856]" style={{ width: `${paidPct}%` }} />
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-violet-500/8" />
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-xl mb-3">📝</div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Applications</p>
          <p className="text-3xl font-bold text-violet-600">{applications?.length || 0}</p>
          <p className="text-xs text-gray-400 mt-1">{applications?.filter((a) => a.status === 'pending').length || 0} pending review</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <p className="text-sm font-bold text-gray-700 mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-[#038DCD] hover:bg-[#e8f6fd] transition-all group text-left">
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#e8f6fd] flex items-center justify-center text-xl transition-colors">📄</div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover:text-[#038DCD] transition-colors">Submit New Application</p>
              <p className="text-xs text-gray-400">Welfare, scholarship, medical & more</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-[#038DCD] transition-colors">→</span>
          </button>
          <button className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-[#F9C856] hover:bg-[#fefaec] transition-all group text-left">
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#fefaec] flex items-center justify-center text-xl transition-colors">💳</div>
            <div>
              <p className="text-sm font-bold text-gray-800 group-hover:text-[#c8920f] transition-colors">Pay Annual Fees</p>
              <p className="text-xs text-gray-400">{feeData ? `PKR ${feeData.summary.balance.toLocaleString()} outstanding` : 'View balance'}</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-[#c8920f] transition-colors">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Family Tree ──────────────────────────────────────────────────────────────
function FamilyTreeTab({ familyTree }: { familyTree: FamilyTree | null }) {
  if (!familyTree) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-[3px] border-[#038DCD]/20 border-t-[#038DCD] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Loading family tree…</p>
      </div>
    );
  }

  const avatarGradient: Record<string, string> = {
    parent: 'from-violet-600 to-violet-700',
    spouse: 'from-pink-500 to-rose-600',
    child: 'from-[#038DCD] to-[#026fa0]',
  };
  const sectionColors: Record<string, { iconBg: string; countBg: string; countText: string }> = {
    parent: { iconBg: 'bg-violet-50', countBg: 'bg-violet-100', countText: 'text-violet-700' },
    spouse: { iconBg: 'bg-pink-50', countBg: 'bg-pink-100', countText: 'text-pink-700' },
    child: { iconBg: 'bg-[#e8f6fd]', countBg: 'bg-[#e8f6fd]', countText: 'text-[#026fa0]' },
  };

  const FamCard = ({ member, rel }: { member: FamilyMember; rel: string }) => {
    const initials = (member.name as string)?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';
    return (
      <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
        <div className={`w-11 h-11 rounded-xl bg-linear-to-br ${avatarGradient[rel]} flex items-center justify-center shrink-0`}>
          <span className="text-white font-bold text-sm">{initials}</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{member.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">ID: <span className="font-semibold text-gray-600">{member.membershipNo}</span></p>
          {member.dob && (
            <p className="text-xs text-gray-400 mt-0.5">DOB: <span className="font-semibold text-gray-600">{new Date(member.dob).toLocaleDateString()}</span></p>
          )}
        </div>
      </div>
    );
  };

  const Section = ({ emoji, title, members, rel }: { emoji: string; title: string; members: FamilyMember[]; rel: string }) => {
    if (!members?.length) return null;
    const c = sectionColors[rel];
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center text-lg`}>{emoji}</div>
          <span className="font-bold text-gray-900">{title}</span>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.countBg} ${c.countText}`}>{members.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((m, i) => <FamCard key={i} member={m} rel={rel} />)}
        </div>
      </div>
    );
  };

  const noFamily = !familyTree.parents?.length && !familyTree.spouse?.length && !familyTree.children?.length;

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Family Tree</h3>
      <p className="text-sm text-gray-400 mb-6">Your registered family members in the Jamat system</p>

      {noFamily ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3 opacity-50">👨‍👩‍👧‍👦</p>
          <p className="font-bold text-gray-900 text-lg mb-2">No Family Members Found</p>
          <p className="text-sm text-gray-400 mb-5">No family members are currently registered in the system.</p>
          <button className="px-5 py-2.5 bg-[#038DCD] text-white text-sm font-bold rounded-full hover:bg-[#026fa0] transition-colors">
            Add Family Member
          </button>
        </div>
      ) : (
        <>
          <Section emoji="👴" title="Parents" members={familyTree.parents} rel="parent" />
          <Section emoji="💑" title="Spouse" members={familyTree.spouse} rel="spouse" />
          <Section emoji="👶" title="Children" members={familyTree.children} rel="child" />
        </>
      )}
    </div>
  );
}

// ─── Fee Status ───────────────────────────────────────────────────────────────
function FeeStatusTab({ feeData }: { feeData: FeeData | null }) {
  if (!feeData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-8 h-8 border-[3px] border-[#038DCD]/20 border-t-[#038DCD] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-400">Loading fee status…</p>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'paid') return 'bg-emerald-100 text-emerald-700';
    if (s === 'partial') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Annual Fee Status</h3>
      <p className="text-sm text-gray-400 mb-6">Your annual fee breakdown and payment history</p>

      {/* Summary pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Due', value: feeData.summary.totalDue, cls: 'bg-[#e8f6fd] text-[#026fa0]', border: 'border-[#038DCD]/20' },
          { label: 'Total Paid', value: feeData.summary.totalPaid, cls: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200' },
          { label: 'Discount', value: feeData.summary.totalDiscount, cls: 'bg-violet-50 text-violet-800', border: 'border-violet-200' },
          { label: 'Balance', value: feeData.summary.balance, cls: feeData.summary.balance > 0 ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-700', border: feeData.summary.balance > 0 ? 'border-red-200' : 'border-gray-200' },
        ].map((item) => (
          <div key={item.label} className={`${item.cls} border ${item.border} rounded-xl p-4`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1.5">{item.label}</p>
            <p className="text-lg font-bold">PKR {item.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Yearly breakdown */}
      {feeData.yearlyBreakdown?.length > 0 && (
        <div className="mb-7">
          <p className="text-sm font-bold text-gray-800 mb-3">Yearly Breakdown</p>
          <div className="space-y-2.5">
            {feeData.yearlyBreakdown.map((year) => (
              <div key={year.fiscalYear} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="font-bold text-gray-900 text-sm">FY {year.fiscalYear}</p>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${statusBadge(year.status)}`}>
                      {year.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400 mb-2">
                    <span>Due: PKR {year.feeAmount.toLocaleString()}</span>
                    <span>Paid: PKR {year.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-[#038DCD] to-[#F9C856]"
                      style={{ width: `${Math.min(100, (year.paidAmount / year.feeAmount) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">PKR {year.balance.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="mb-7">
        <p className="text-sm font-bold text-gray-800 mb-3">Annual Fee Invoices</p>
        <div className="space-y-2.5">
          {feeData.annualFees.map((fee) => (
            <div key={fee.invoiceNo} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 transition-all">
              <div>
                <p className="font-bold text-gray-900 text-sm mb-1">FY {fee.fiscalYear}</p>
                <p className="text-xs text-gray-400">Invoice: {fee.invoiceNo} · {new Date(fee.invoiceDate).toLocaleDateString()}</p>
                {fee.details && <p className="text-xs text-gray-600 font-medium mt-0.5">{fee.details}</p>}
              </div>
              <p className="font-bold text-gray-900 shrink-0">PKR {fee.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payments */}
      {feeData.payments.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-800 mb-3">Payment History</p>
          <div className="space-y-2.5">
            {feeData.payments.map((payment) => (
              <div key={payment.voucherNo} className="flex items-center justify-between gap-4 p-4 rounded-xl border-l-[3px] border-l-emerald-500 border border-gray-100 bg-gray-50 hover:shadow-sm transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-600 text-sm">✓</span>
                    <p className="font-bold text-gray-900 text-sm">Payment Received</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Voucher: {payment.voucherNo} · {new Date(payment.receiveDate).toLocaleDateString()}
                  </p>
                  {payment.discount > 0 && (
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                      Discount: PKR {payment.discount.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-emerald-700">PKR {payment.amount.toLocaleString()}</p>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-1 inline-block">PAID</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Applications ─────────────────────────────────────────────────────────────
function ApplicationsTab({ applications }: { applications: Application[] }) {
  const statusCls = (s: string) => {
    switch (s.toLowerCase()) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">My Applications</h3>
          <p className="text-sm text-gray-400">Track your submitted applications and their status</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors">
          + New Application
        </button>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3 opacity-50">📝</p>
          <p className="font-bold text-gray-900 text-lg mb-2">No Applications Yet</p>
          <p className="text-sm text-gray-400 mb-5">You haven&apos;t submitted any applications yet.</p>
          <button className="px-5 py-2.5 bg-[#038DCD] text-white text-sm font-bold rounded-full hover:bg-[#026fa0] transition-colors">
            Submit New Application
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="flex items-start justify-between gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 mb-0.5">{app.formName}</p>
                <p className="text-xs font-semibold text-gray-400 mb-2">{app.formType}</p>
                {app.notes && (
                  <p className="text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-2 leading-relaxed">{app.notes}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusCls(app.status)}`}>
                  {app.status}
                </span>
                <p className="text-xs text-gray-400">{new Date(app.submissionDate).toLocaleDateString()}</p>
                <button className="text-xs font-bold text-[#038DCD] hover:underline mt-1">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────
function EventsTab({
  events,
  member,
  familyTree,
  showNotification,
  showDeleteConfirm,
  setShowDeleteConfirm,
  eventToDelete,
  setEventToDelete
}: {
  events: Event[];
  member: MemberInfo | null;
  familyTree: FamilyTree | null;
  showNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  eventToDelete: string | null;
  setEventToDelete: (id: string | null) => void;
}) {
  const { member: authMember } = useMemberAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', desc: '', date: '', category: '', img: '', fb: '' });
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSpouse, setSelectedSpouse] = useState<string[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedParents, setSelectedParents] = useState<string[]>([]);

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => { fetchRegistrations(); }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/events/register', { credentials: 'include' });
      if (response.ok) { const data = await response.json(); setRegistrations(data); }
    } catch (error) { console.error('Error fetching registrations:', error); }
  };

  const handleRegister = async (eventId: string) => {
    const familyMembers = {
      spouse: selectedSpouse,
      children: selectedChildren,
      parents: selectedParents
    };
    setRegistering(eventId);
    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId, familyMembers }),
      });
      if (response.ok) {
        await fetchRegistrations();
        showNotification('Registration request submitted successfully!', 'success');
        setShowFamilyModal(false);
        setSelectedEvent(null);
        setSelectedSpouse([]);
        setSelectedChildren([]);
        setSelectedParents([]);
      } else {
        const error = await response.json();
        showNotification(error.error || 'Failed to register', 'error');
      }
    } catch (error) {
      console.error('Error registering:', error);
      showNotification('Failed to register for event', 'error');
    } finally { setRegistering(null); }
  };

  const getRegistrationStatus = (eventId: string) =>
    registrations.find(r => r.eventId === eventId)?.status || null;

  const handleAddEvent = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEvent),
      });
      if (response.ok) window.location.reload();
    } catch (error) { console.error('Error adding event:', error); }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const response = await fetch(`/api/events/${eventToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('Event deleted successfully', 'success');
        window.location.reload();
      } else {
        showNotification('Failed to delete event', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  const isAdmin = authMember?.role === 'admin';

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Upcoming Events</h3>
          <p className="text-sm text-gray-400">Stay updated with our community events</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[#F9C856] text-gray-900 text-sm font-bold rounded-xl hover:bg-[#e0a830] transition-colors"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* Admin add form */}
      {showAddForm && isAdmin && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <p className="font-bold text-gray-800 mb-4">Add New Event</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text" placeholder="Event Title" value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#038DCD] bg-white"
            />
            <input
              type="date" value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#038DCD] bg-white"
            />
            <input
              type="text" placeholder="Category" value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#038DCD] bg-white"
            />
            <input
              type="text" placeholder="Image URL" value={newEvent.img}
              onChange={(e) => setNewEvent({ ...newEvent, img: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#038DCD] bg-white"
            />
            <input
              type="text" placeholder="Facebook Link (optional)" value={newEvent.fb}
              onChange={(e) => setNewEvent({ ...newEvent, fb: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#038DCD] bg-white sm:col-span-2"
            />
            <textarea
              placeholder="Event Description" value={newEvent.desc} rows={3}
              onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#038DCD] bg-white sm:col-span-2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAddEvent} className="px-4 py-2 bg-[#038DCD] text-white text-sm font-bold rounded-xl hover:bg-[#026fa0] transition-colors">
              Add Event
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3 opacity-50">📅</p>
          <p className="font-bold text-gray-900 text-lg mb-2">No Upcoming Events</p>
          <p className="text-sm text-gray-400">Check back later for upcoming events.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const d = new Date(event.date);
            const status = getRegistrationStatus(event.id);
            return (
              <div key={event.id} className="flex gap-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all">
                {/* Date block */}
                <div className="shrink-0 w-14 bg-gray-900 rounded-xl text-white text-center py-3 px-2">
                  <p className="text-2xl font-bold leading-none">{d.getDate()}</p>
                  <p className="text-[9px] font-bold tracking-widest uppercase opacity-60 mt-1">{MONTHS[d.getMonth()]}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{event.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#038DCD] bg-[#e8f6fd] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          {event.category}
                        </span>
                        {new Date(event.date) >= new Date() && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                            🚀 Upcoming
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{d.toLocaleDateString()}</span>
                        {event.time && <span className="text-xs text-gray-400">⏰ {event.time}</span>}
                        {event.venue && <span className="text-xs text-gray-400">📍 {event.venue}</span>}
                      </div>
                      {event.islamicDate && (
                        <div className="text-xs text-gray-500">☪️ {event.islamicDate}</div>
                      )}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{event.desc}</p>

                  {event.img && (
                    <div className="mb-3">
                      <Image
                        src={event.img} alt={event.title} width={200} height={150}
                        className="w-full max-w-50 h-28 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      if (status === 'approved') return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg">✓ Registered</span>
                      );
                      if (status === 'pending') return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-lg">⏳ Registration Pending</span>
                      );
                      if (status === 'rejected') return (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg">✗ Registration Rejected</span>
                      );
                      return (
                        <button
                          disabled={registering === event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowFamilyModal(true);
                            setSelectedSpouse([]);
                            setSelectedChildren([]);
                            setSelectedParents([]);
                          }}
                          className="text-xs font-bold text-white bg-[#038DCD] px-4 py-1.5 rounded-lg hover:bg-[#026fa0] transition-colors disabled:opacity-50"
                        >
                          {registering === event.id ? 'Registering…' : 'Register for Event'}
                        </button>
                      );
                    })()}
                    {event.fb && (
                      <a href={event.fb} target="_blank" rel="noopener noreferrer">
                        <button className="text-xs font-bold text-gray-800 bg-[#F9C856] px-4 py-1.5 rounded-lg hover:bg-[#e0a830] transition-colors">
                          Facebook Event
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Family selection modal */}
      {showFamilyModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowFamilyModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Register for Event</h3>
            <p className="text-sm text-gray-400 mb-4">{selectedEvent.title}</p>

            {!familyTree ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#038DCD] mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading family information...</p>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select attendees</p>

                <div className="space-y-2 mb-5">
                  {/* Self — always checked */}
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent cursor-default">
                    <input type="checkbox" checked disabled className="accent-[#038DCD] w-4 h-4" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{member?.MemName || 'You'}</p>
                      <p className="text-xs text-gray-400">Member (you)</p>
                    </div>
                  </label>

                  {familyTree?.spouse?.filter(spouse => String(spouse.id || '').trim() !== String(member?.MemComputerID || '').trim()).map((spouse, idx) => {
                    const spouseId = String(spouse.id || '');
                    return (
                      <label key={`spouse-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-[#038DCD] hover:bg-[#e8f6fd] transition-all cursor-pointer">
                        <input
                          type="checkbox" className="accent-[#038DCD] w-4 h-4"
                          checked={selectedSpouse.includes(spouseId)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedSpouse(prev => [...prev, spouseId]);
                            else setSelectedSpouse(prev => prev.filter(id => id !== spouseId));
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{spouse.name}</p>
                          <p className="text-xs text-gray-400">Spouse</p>
                        </div>
                      </label>
                    );
                  })}

                  {familyTree?.children?.filter(child => String(child.id || '').trim() !== String(member?.MemComputerID || '').trim()).map((child, idx) => {
                    const childId = String(child.id || '');
                    return (
                      <label key={`child-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-[#038DCD] hover:bg-[#e8f6fd] transition-all cursor-pointer">
                        <input
                          type="checkbox" className="accent-[#038DCD] w-4 h-4"
                          checked={selectedChildren.includes(childId)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedChildren(prev => [...prev, childId]);
                            else setSelectedChildren(prev => prev.filter(id => id !== childId));
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{child.name}</p>
                          <p className="text-xs text-gray-400">Child</p>
                        </div>
                      </label>
                    );
                  })}

                  {familyTree?.parents?.filter(parent => String(parent.id || '').trim() !== String(member?.MemComputerID || '').trim()).map((parent, idx) => {
                    const parentId = String(parent.id || '');
                    return (
                      <label key={`parent-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-[#038DCD] hover:bg-[#e8f6fd] transition-all cursor-pointer">
                        <input
                          type="checkbox" className="accent-[#038DCD] w-4 h-4"
                          checked={selectedParents.includes(parentId)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedParents(prev => [...prev, parentId]);
                            else setSelectedParents(prev => prev.filter(id => id !== parentId));
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{parent.name}</p>
                          <p className="text-xs text-gray-400">Parent</p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={registering === selectedEvent.id}
                    onClick={() => handleRegister(selectedEvent.id)}
                    className="flex-1 py-2.5 bg-[#038DCD] text-white text-sm font-bold rounded-xl hover:bg-[#026fa0] transition-colors disabled:opacity-50"
                  >
                    {registering === selectedEvent.id ? 'Registering…' : 'Confirm Registration'}
                  </button>
                  <button
                    onClick={() => {
                      setShowFamilyModal(false);
                      setSelectedEvent(null);
                      setSelectedSpouse([]);
                      setSelectedChildren([]);
                      setSelectedParents([]);
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEvent}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setEventToDelete(null);
        }}
        type="danger"
      />
    </div>
  );
}

// ─── Business Ads ──────────────────────────────────────────────────────────────
function BusinessAdsTab() {
  const [requests, setRequests] = useState<BusinessAdRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessAdRequests();
  }, []);

  const fetchBusinessAdRequests = async () => {
    try {
      const response = await fetch('/api/member/business-ads');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching business ad requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (request: BusinessAdRequest) => {
    const now = new Date();

    if (request.status === 'rejected') {
      return {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800',
        icon: '❌',
        description: 'Your request was not approved'
      };
    }

    if (request.status === 'pending') {
      return {
        label: 'Pending Review',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
        description: 'Waiting for administrator approval'
      };
    }

    if (request.status === 'approved') {
      if (request.approvals && request.approvals.length > 0) {
        const approvedStart = new Date(request.approvals[0].approvedStartDate);
        const approvedEnd = new Date(request.approvals[0].approvedEndDate);

        if (now >= approvedStart && now <= approvedEnd) {
          return {
            label: 'Live',
            color: 'bg-green-100 text-green-800',
            icon: '🟢',
            description: `Active until ${approvedEnd.toLocaleDateString()}`
          };
        } else if (now > approvedEnd) {
          return {
            label: 'Completed',
            color: 'bg-blue-100 text-blue-800',
            icon: '✅',
            description: `Ran from ${approvedStart.toLocaleDateString()} to ${approvedEnd.toLocaleDateString()}`
          };
        } else {
          return {
            label: 'Approved - Scheduled',
            color: 'bg-emerald-100 text-emerald-800',
            icon: '📅',
            description: `Will go live on ${approvedStart.toLocaleDateString()}`
          };
        }
      }
    }

    return {
      label: request.status,
      color: 'bg-gray-100 text-gray-800',
      icon: '❓',
      description: 'Unknown status'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#038DCD]/20 border-t-[#038DCD] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business ad requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Business Advertisement Requests</h3>
          <p className="text-sm text-gray-400">Manage your business advertisement requests</p>
        </div>
        <button
          onClick={() => window.location.href = '/member/business-ads'}
          className="px-4 py-2 bg-[#038DCD] text-white text-sm font-bold rounded-xl hover:bg-[#026fa0] transition-colors"
        >
          Submit New Request
        </button>
      </div>

      {/* Status Summary */}
      {requests.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', count: requests.length, color: 'bg-gray-100 text-gray-800', icon: '📊' },
            { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
            { label: 'Live', count: requests.filter(r => getStatusInfo(r).label === 'Live').length, color: 'bg-green-100 text-green-800', icon: '🟢' },
            { label: 'Completed', count: requests.filter(r => getStatusInfo(r).label === 'Completed').length, color: 'bg-blue-100 text-blue-800', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-center`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Business Ad Requests</h4>
          <p className="text-gray-600 mb-6">You haven&apos;t submitted any business advertisement requests yet.</p>
          <button
            onClick={() => window.location.href = '/member/business-ads'}
            className="px-6 py-3 bg-[#038DCD] text-white font-semibold rounded-xl hover:bg-[#026fa0] transition-colors"
          >
            Submit Your First Request
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{request.businessName}</h4>
                  <p className="text-gray-600">{request.category}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusInfo(request).color}`}>
                      <span>{getStatusInfo(request).icon}</span>
                      {getStatusInfo(request).label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{getStatusInfo(request).description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Requested Period:</span>
                  <p className="text-gray-600">
                    {new Date(request.requestedStartDate).toLocaleDateString()} - {new Date(request.requestedEndDate).toLocaleDateString()}
                  </p>
                </div>
                {request.approvals && request.approvals.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Approved Period:</span>
                    <p className="text-gray-600">
                      {new Date(request.approvals[0].approvedStartDate).toLocaleDateString()} - {new Date(request.approvals[0].approvedEndDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {request.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">This request was rejected. You can submit a new request with updated information.</p>
                </div>
              )}

              {request.status === 'approved' && request.approvals && request.approvals.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <span className="font-medium">✓ Approved!</span> Your business ad is scheduled to run from{' '}
                    {new Date(request.approvals[0].approvedStartDate).toLocaleDateString()} to{' '}
                    {new Date(request.approvals[0].approvedEndDate).toLocaleDateString()}.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}