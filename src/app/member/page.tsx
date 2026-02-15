'use client';

import { useState, useEffect } from 'react';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
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

export default function MemberDashboard() {
  const { logout, isLoading: authLoading } = useMemberAuth();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberInfo();
  }, []);

  useEffect(() => {
    if (activeTab === 'family' && !familyTree) {
      fetchFamilyTree();
    } else if (activeTab === 'fees' && !feeData) {
      fetchFeeData();
    } else if (activeTab === 'applications' && applications.length === 0) {
      fetchApplications();
    }
  }, [activeTab, applications.length, familyTree, feeData]);

  const fetchMemberInfo = async () => {
    try {
      const response = await fetch('/api/member');
      if (response.ok) {
        const data = await response.json();
        setMember(data);
      } else {
        console.error('Failed to fetch member info');
      }
    } catch (error) {
      console.error('Error fetching member info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyTree = async () => {
    try {
      const response = await fetch('/api/member/family-tree');
      if (response.ok) {
        const data = await response.json();
        setFamilyTree(data);
      }
    } catch (error) {
      console.error('Error fetching family tree:', error);
    }
  };

  const fetchFeeData = async () => {
    try {
      const response = await fetch('/api/member/fees');
      if (response.ok) {
        const data = await response.json();
        setFeeData(data);
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/member/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">Failed to load member information</p>
          <button
            onClick={fetchMemberInfo}
            className="px-6 py-3 bg-[#038DCD] text-white rounded-full font-bold hover:bg-[#038DCD]/90 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching main page style */}
      {/* <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="pl-35">
                <h1 className="text-xl font-bold text-gray-900 italic">Member Portal</h1>
                <p className="text-xs text-gray-600 font-medium">Welcome back, {member?.MemName?.split(' ')[0]}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="px-5 py-2.5 text-[#038DCD] hover:text-[#038DCD]/80 font-bold tracking-wide transition-colors"
              >
                HOME
              </Link>
              <button
                onClick={logout}
                className="px-5 py-2.5 bg-white/80 border-2 border-gray-300 hover:border-[#038DCD] text-gray-700 hover:text-[#038DCD] font-bold rounded-full transition-all duration-200"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile Header Card - inspired by main page president section */}
        <div className="bg-gradient-to-br from-[#038DCD]/5 to-[#F9D98F]/5 rounded-3xl border border-gray-200 shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">

            {/* Profile Image */}
            <div className="flex-shrink-0">
              {member?.profileImage ? (
                <Image
                  src={member.profileImage}
                  alt={member?.MemName || 'Profile'}
                  width={160}
                  height={160}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#038DCD] to-[#F9C856] rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white font-bold text-5xl">
                    {member?.MemName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'M'}
                  </span>
                </div>
              )}
            </div>

            {/* Member Info */}
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{member?.MemName || 'Member'}</h2>
                {member?.surname && (
                  <span className="px-4 py-1.5 bg-[#038DCD]/10 text-[#038DCD] rounded-full text-sm font-bold tracking-wide">
                    {member.surname}
                  </span>
                )}
              </div>

              <p className="text-gray-600 font-medium mb-6">Member ID: {member?.MemMembershipNo || 'N/A'}</p>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#038DCD] rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">CNIC</p>
                    <p className="font-semibold text-gray-900">{member?.MemCNIC || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F9C856] rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Father&apos;s Name</p>
                    <p className="font-semibold text-gray-900">{member?.MemFatherName || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#038DCD] rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Date of Birth</p>
                    <p className="font-semibold text-gray-900">
                      {member?.MemDOB ? new Date(member.MemDOB).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F9C856] rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</p>
                    <p className="font-semibold text-gray-900">{member?.email || 'N/A'}</p>
                  </div>
                </div>

                {member?.cellNumbers && member.cellNumbers.length > 0 && (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#038DCD] rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Contact</p>
                      <p className="font-semibold text-gray-900">{member.cellNumbers[0]}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-[#F9C856] rounded-full mt-2"></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Gender</p>
                    <p className="font-semibold text-gray-900">{member?.gender || 'N/A'}</p>
                  </div>
                </div>

                {member?.occupation && (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#038DCD] rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Occupation</p>
                      <p className="font-semibold text-gray-900">{member.occupation}</p>
                    </div>
                  </div>
                )}

                {member?.area && (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#F9C856] rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Area</p>
                      <p className="font-semibold text-gray-900">{member.area}</p>
                    </div>
                  </div>
                )}

                {member?.maritalStatus && (
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#038DCD] rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Marital Status</p>
                      <p className="font-semibold text-gray-900">{member.maritalStatus}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - matching main page services style */}
        <div className="mb-8">
          <div className="bg-white/80 rounded-2xl shadow-lg border border-gray-200 p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'overview', name: 'OVERVIEW', gradient: 'from-[#038DCD] to-[#03BDCD]' },
                { id: 'family', name: 'FAMILY TREE', gradient: 'from-[#F9C856] to-[#F9D98F]' },
                { id: 'fees', name: 'FEE STATUS', gradient: 'from-[#038DCD] to-[#03BDCD]' },
                { id: 'applications', name: 'APPLICATIONS', gradient: 'from-[#F9C856] to-[#F9D98F]' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-4 font-bold text-sm tracking-wide rounded-xl transition-all duration-200 ${activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          {activeTab === 'overview' && <OverviewTab feeData={feeData} familyTree={familyTree} applications={applications} />}
          {activeTab === 'family' && <FamilyTreeTab familyTree={familyTree} />}
          {activeTab === 'fees' && <FeeStatusTab feeData={feeData} />}
          {activeTab === 'applications' && <ApplicationsTab applications={applications} />}
        </div>

      </main>

      {/* Floating Logout Button */}
      <button
        onClick={logout}
        className="fixed bottom-8 right-8 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 z-100"
      >
        <span>🚪</span>
        LOGOUT
      </button>
    </div>

  );
}

function OverviewTab({ feeData, familyTree, applications }: { feeData: FeeData | null, familyTree: FamilyTree | null, applications: Application[] }) {
  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Family Members Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#038DCD]/10 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#038DCD] to-[#03BDCD] rounded-xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-white text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">Family Members</p>
            <p className="text-4xl font-bold text-[#038DCD] mb-2">
              {familyTree ? ((familyTree.spouse?.length || 0) + (familyTree.children?.length || 0) + (familyTree.parents?.length || 0)) : '...'}
            </p>
            <p className="text-sm text-gray-600">Registered in system</p>
          </div>
        </div>

        {/* Fee Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F9C856]/10 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F9C856] to-[#F9D98F] rounded-xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-white text-2xl">💰</span>
            </div>
            <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">Fee Balance</p>
            <p className="text-4xl font-bold text-[#F9C856] mb-2">
              {feeData ? `${feeData.summary.balance.toLocaleString()}` : '...'}
            </p>
            <p className="text-sm text-gray-600">
              {feeData ? `PKR ${feeData.summary.totalDue.toLocaleString()} total due` : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Applications Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-gray-200 p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-shadow duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#038DCD]/10 to-transparent rounded-bl-full"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-[#038DCD] to-[#03BDCD] rounded-xl flex items-center justify-center mb-4 shadow-md">
              <span className="text-white text-2xl">📝</span>
            </div>
            <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">Applications</p>
            <p className="text-4xl font-bold text-[#038DCD] mb-2">{applications?.length || 0}</p>
            <p className="text-sm text-gray-600">
              {applications?.filter((a: Application) => a.status === 'pending').length || 0} pending review
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-[#038DCD] transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#038DCD]/10 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-xl">📄</span>
              </div>
              <span className="font-bold text-gray-700 group-hover:text-[#038DCD] transition-colors">Submit New Application</span>
            </div>
            <span className="text-gray-400 group-hover:text-[#038DCD] transition-colors">&rarr;</span>
          </button>

          <button className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 hover:border-[#F9C856] transition-all duration-200 group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-[#F9C856]/10 rounded-lg flex items-center justify-center transition-colors">
                <span className="text-xl">💳</span>
              </div>
              <span className="font-bold text-gray-700 group-hover:text-[#F9C856] transition-colors">Pay Annual Fees</span>
            </div>
            <span className="text-gray-400 group-hover:text-[#F9C856] transition-colors">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FamilyTreeTab({ familyTree }: { familyTree: FamilyTree | null }) {
  if (!familyTree) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading family tree...</p>
      </div>
    );
  }

  const FamilyMemberCard = ({ member, relationship }: { member: FamilyMember, relationship: string }) => {
    const initials = (member.name as string)?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?';
    const colors: Record<string, { bg: string, border: string, accent: string }> = {
      parent: { bg: 'from-purple-500 to-purple-600', border: 'border-purple-200', accent: 'bg-purple-100' },
      spouse: { bg: 'from-pink-500 to-rose-600', border: 'border-pink-200', accent: 'bg-pink-100' },
      child: { bg: 'from-[#038DCD] to-[#03BDCD]', border: 'border-blue-200', accent: 'bg-blue-100' },
    };

    return (
      <div className={`bg-white rounded-2xl p-5 border-2 ${colors[relationship].border} hover:shadow-lg transition-all duration-300`}>
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${colors[relationship].bg} rounded-xl flex items-center justify-center shadow-md`}>
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div className="flex-grow min-w-0">
            <p className="font-bold text-gray-900 text-lg mb-2">{member.name}</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 ${colors[relationship].accent} rounded-full mt-1.5`}></div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Member ID</p>
                  <p className="text-sm font-semibold text-gray-700">{member.membershipNo}</p>
                </div>
              </div>
              {member.dob && (
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 ${colors[relationship].accent} rounded-full mt-1.5`}></div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Date of Birth</p>
                    <p className="text-sm font-semibold text-gray-700">{new Date(member.dob).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="text-center pb-6">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Family Tree</h3>
        <p className="text-gray-600">Your registered family members in the Jamat system</p>
      </div>

      {familyTree.parents && familyTree.parents.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">👴</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Parents</h4>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
              {familyTree.parents.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {familyTree.parents.map((parent: FamilyMember, idx: number) => (
              <FamilyMemberCard key={idx} member={parent} relationship="parent" />
            ))}
          </div>
        </div>
      )}

      {familyTree.spouse && familyTree.spouse.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">💑</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Spouse</h4>
            <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-bold">
              {familyTree.spouse.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {familyTree.spouse.map((spouse: FamilyMember, idx: number) => (
              <FamilyMemberCard key={idx} member={spouse} relationship="spouse" />
            ))}
          </div>
        </div>
      )}

      {familyTree.children && familyTree.children.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#038DCD] to-[#03BDCD] rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">👶</span>
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Children</h4>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {familyTree.children.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {familyTree.children.map((child: FamilyMember, idx: number) => (
              <FamilyMemberCard key={idx} member={child} relationship="child" />
            ))}
          </div>
        </div>
      )}

      {!familyTree.parents?.length && !familyTree.spouse?.length && !familyTree.children?.length && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">No Family Members Found</h4>
          <p className="text-gray-600 mb-6">No family members are currently registered in the system.</p>
          <button className="px-6 py-3 bg-[#038DCD] hover:bg-[#038DCD]/90 text-white font-bold rounded-full transition-all duration-200 shadow-md">
            Add Family Member
          </button>
        </div>
      )}
    </div>
  );
}

function FeeStatusTab({ feeData }: { feeData: FeeData | null }) {
  if (!feeData) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading fee status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Annual Fee Status</h3>
        <p className="text-gray-600">Your annual fee breakdown and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border-2 border-blue-200">
          <p className="text-sm text-blue-700 font-bold uppercase tracking-wide mb-2">Total Due</p>
          <p className="text-3xl font-bold text-blue-900">PKR {feeData.summary.totalDue.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border-2 border-green-200">
          <p className="text-sm text-green-700 font-bold uppercase tracking-wide mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-green-900">PKR {feeData.summary.totalPaid.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border-2 border-purple-200">
          <p className="text-sm text-purple-700 font-bold uppercase tracking-wide mb-2">Discount</p>
          <p className="text-3xl font-bold text-purple-900">PKR {feeData.summary.totalDiscount.toLocaleString()}</p>
        </div>

        <div className={`bg-gradient-to-br rounded-2xl p-6 border-2 ${feeData.summary.balance > 0
          ? 'from-red-50 to-red-100/50 border-red-200'
          : 'from-gray-50 to-gray-100/50 border-gray-200'
          }`}>
          <p className={`text-sm font-bold uppercase tracking-wide mb-2 ${feeData.summary.balance > 0 ? 'text-red-700' : 'text-gray-700'
            }`}>
            Balance
          </p>
          <p className={`text-3xl font-bold ${feeData.summary.balance > 0 ? 'text-red-900' : 'text-gray-900'
            }`}>
            PKR {feeData.summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Yearly Breakdown */}
      {feeData.yearlyBreakdown && feeData.yearlyBreakdown.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4">Yearly Breakdown</h4>
          <div className="space-y-3">
            {feeData.yearlyBreakdown.map((year) => (
              <div key={year.fiscalYear} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#038DCD]/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-gray-900">FY {year.fiscalYear}</p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-gray-500 font-semibold uppercase tracking-wide text-xs">Fee Amount</p>
                        <p className="font-bold text-gray-900">PKR {year.feeAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-semibold uppercase tracking-wide text-xs">Paid Amount</p>
                        <p className="font-bold text-gray-900">PKR {year.paidAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-3 ${year.status === 'Paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {year.status.toUpperCase()}
                    </span>
                    <p className="text-2xl font-bold text-gray-900">PKR {year.balance.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Annual Fees */}
      <div>
        <h4 className="text-xl font-bold text-gray-900 mb-4">Annual Fees Invoices</h4>
        <div className="space-y-3">
          {feeData.annualFees.map((fee) => (
            <div key={fee.invoiceNo} className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-lg font-bold text-gray-900">FY {fee.fiscalYear}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold">Invoice:</span> {fee.invoiceNo}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Date:</span> {new Date(fee.invoiceDate).toLocaleDateString()}
                    </p>
                    {fee.details && <p className="text-gray-700 font-medium">{fee.details}</p>}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">PKR {fee.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {feeData.payments.length > 0 && (
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-4">Payment History</h4>
          <div className="space-y-3">
            {feeData.payments.map((payment) => (
              <div key={payment.voucherNo} className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-6 border-2 border-green-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">✓</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">Payment Received</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">Voucher:</span> {payment.voucherNo}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Date:</span> {new Date(payment.receiveDate).toLocaleDateString()}
                      </p>
                      {payment.discount > 0 && (
                        <p className="text-green-700 font-semibold">
                          Discount Applied: PKR {payment.discount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">PKR {payment.amount.toLocaleString()}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      PAID
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationsTab({ applications }: { applications: Application[] }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Applications Yet</h3>
        <p className="text-slate-500">You haven&apos;t submitted any applications yet.</p>
        <button className="px-8 py-3 bg-gradient-to-r from-[#038DCD] to-[#03BDCD] hover:opacity-90 text-white font-bold rounded-full transition-all duration-200 shadow-lg">
          Submit New Application
        </button>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h3>
          <p className="text-gray-600">Track your submitted applications and their status</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-[#038DCD] to-[#03BDCD] hover:opacity-90 text-white font-bold rounded-full transition-all duration-200 shadow-md">
          + New Application
        </button>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#038DCD]/30 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-grow">
                <h4 className="text-xl font-bold text-gray-900 mb-1">{app.formName}</h4>
                <p className="text-sm text-gray-600 font-semibold">{app.formType}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusStyle(app.status)}`}>
                {app.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              <span className="font-semibold">Submitted:</span>
              <span>{new Date(app.submissionDate).toLocaleDateString()}</span>
            </div>

            {app.notes && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 font-medium">{app.notes}</p>
              </div>
            )}

            <button className="text-[#038DCD] hover:text-[#038DCD]/80 font-bold text-sm flex items-center gap-2 transition-colors">
              View Details
              <span>→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}