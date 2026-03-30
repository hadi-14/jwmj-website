'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft, Calendar, File, Hash, Mail, Phone, Users, CheckCircle,
  Clock, AlertCircle, FileText, Loader
} from 'lucide-react';

interface MemberInfo {
  MemComputerID: number;
  MemName: string | null;
  MemMembershipNo: string | null;
  MemCNIC: number | null;
  MemEmail: string | null;
  MemCell: string | null;
  Mem_Pic: string | null;
}

interface FormSubmission {
  id: string;
  formId: string;
  form: { name: string; formType: string };
  memberComputerId: number | null;
  submissionDate: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedBy: string | null;
  approvedBy: string | null;
  approvedDate: string | null;
  notes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  approved: { label: 'Approved', color: 'text-emerald-700', bgColor: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-3 h-3" /> },
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-50 border-amber-200', icon: <Clock className="w-3 h-3" /> },
  draft: { label: 'Draft', color: 'text-slate-600', bgColor: 'bg-slate-100 border-slate-200', icon: <FileText className="w-3 h-3" /> },
  rejected: { label: 'Rejected', color: 'text-rose-700', bgColor: 'bg-rose-50 border-rose-200', icon: <AlertCircle className="w-3 h-3" /> },
};

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  const [member, setMember] = useState<MemberInfo | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch member info
        const memberRes = await fetch(`/api/members/${memberId}`);
        if (!memberRes.ok) throw new Error('Member not found');
        const memberData = await memberRes.json();
        setMember(memberData.data);

        // Fetch member's form submissions
        const submissionsRes = await fetch(`/api/members/${memberId}/submissions`);
        if (!submissionsRes.ok) throw new Error('Failed to fetch submissions');
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (memberId) fetchData();
  }, [memberId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#038DCD] mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading member profile...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#038DCD] hover:bg-[#038DCD]/10 rounded-lg transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-red-700 mb-2">Error Loading Profile</p>
            <p className="text-sm text-slate-600">{error || 'Member not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const statuses = submissions.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="pt-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#038DCD] hover:bg-[#038DCD]/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Submissions
          </button>
        </div>

        {/* Member Info Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="h-24 bg-linear-to-r from-[#038DCD] to-[#0260a8]" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16 mb-6">
              {/* Avatar */}
              <div className="shrink-0">
                {member.Mem_Pic ? (
                  <Image
                    src={member.Mem_Pic}
                    alt={member.MemName || 'Member'}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-[#038DCD]/10 flex items-center justify-center">
                    <Users className="w-10 h-10 text-[#038DCD]" />
                  </div>
                )}
              </div>

              {/* Member Details */}
              <div className="flex-1 pt-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{member.MemName || 'Unknown'}</h1>
                <p className="text-sm text-slate-500 mb-4">Member ID: <span className="font-mono font-semibold">{member.MemComputerID}</span></p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {member.MemMembershipNo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">Membership: <span className="font-semibold">{member.MemMembershipNo}</span></span>
                    </div>
                  )}
                  {member.MemCNIC && (
                    <div className="flex items-center gap-2 text-sm">
                      <File className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">CNIC: <span className="font-semibold">{member.MemCNIC}</span></span>
                    </div>
                  )}
                  {member.MemEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 truncate">{member.MemEmail}</span>
                    </div>
                  )}
                  {member.MemCell && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{member.MemCell}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            {submissions.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{submissions.length}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Total Forms</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{statuses.approved || 0}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Approved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{(statuses.pending || 0) + (statuses.submitted || 0)}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-rose-600">{statuses.rejected || 0}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Rejected</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Submissions History */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Form Submission History</h2>

          {submissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <File className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-medium mb-1">No form submissions</p>
              <p className="text-sm text-slate-500">This member hasn&apos;t submitted any forms yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Form</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submission Date</th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((submission) => {
                      const cfg = STATUS_CONFIG[submission.status] || STATUS_CONFIG.draft;
                      return (
                        <tr key={submission.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#038DCD]/8 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-[#038DCD]" />
                              </div>
                              <span className="text-sm font-semibold text-slate-900 line-clamp-1">{submission.form.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-slate-600">{submission.form.formType}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {new Date(submission.submissionDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bgColor} ${cfg.color}`}>
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => router.push(`/admin/submissions?id=${submission.id}`)}
                                className="p-2 hover:bg-[#038DCD]/10 rounded-lg text-slate-400 hover:text-[#038DCD] transition-colors"
                                title="View details"
                              >
                                <File className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
