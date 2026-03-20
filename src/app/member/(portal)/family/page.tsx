'use client';

import { useState, useEffect } from 'react';
import { Crown, X } from 'lucide-react';

interface MemberNode {
  id: string;
  name: string | null;
  membershipNo: string | null;
  dob: Date | null;
  cnic: string | null;
  genderCode: string | null;
  fatherName: string | null;
  motherName: string | null;
  isDeceased: boolean;
  deceasedDate: Date | null;
  relationToSelf?: string;
  isRegisteredMember?: boolean;
}

interface FamilyTree {
  self: MemberNode;
  spouse: MemberNode[];
  spouseParents: MemberNode[];
  children: MemberNode[];
  grandchildren: MemberNode[];
  parents: MemberNode[];
  grandparents: MemberNode[];
  siblings: MemberNode[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcAge(dob: Date | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) age--;
  return age;
}

function formatDate(d: Date | null): string | null {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function genderStr(code: string | null): string | null {
  if (!code) return null;
  return code === '1' || (code as unknown) === 1 ? 'Male' : 'Female';
}

// ── Member Card ────────────────────────────────────────────────────────────────

function MemberCard({
  member,
  isSelf = false,
  onSelect,
}: {
  member: MemberNode;
  isSelf?: boolean;
  onSelect: (m: MemberNode) => void;
}) {
  const age = calcAge(member.dob);
  const birthYear = member.dob ? new Date(member.dob).getFullYear() : null;
  const nameParts = (member.name || 'Unknown').split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return (
    <button
      onClick={() => onSelect(member)}
      className={[
        'group relative w-[190px] shrink-0 rounded-lg border text-center',
        'px-5 py-4 transition-all duration-200 outline-none',
        'hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(3,141,205,0.15)]',
        'focus-visible:ring-2 focus-visible:ring-[#038DCD]',
        isSelf
          ? 'border-[#038DCD] border-2 bg-blue-50'
          : member.isDeceased
            ? 'border-gray-300 bg-gray-100'
            : 'border-gray-200 bg-white',
        'hover:border-[#038DCD]',
      ].join(' ')}
      style={{ boxShadow: '0 2px 12px rgba(3,141,205,0.08)' }}
    >
      {/* Corner flourishes */}
      <span className="pointer-events-none absolute top-1 left-1 block h-2 w-2 border-t border-l border-[#038DCD]/40" />
      <span className="pointer-events-none absolute bottom-1 right-1 block h-2 w-2 border-b border-r border-[#038DCD]/40" />

      {/* Relation badge */}
      <span className="mb-2 block font-sans text-[9.5px] uppercase tracking-[0.22em] text-[#038DCD]">
        {member.relationToSelf || 'Family'}
      </span>

      {/* Name */}
      <p
        className={[
          'text-[15px] font-medium leading-snug',
          member.isDeceased ? 'text-gray-500' : 'text-gray-900',
        ].join(' ')}
      >
        {firstName}{' '}
        {restName && (
          <em className="not-italic font-light text-gray-500 text-[13px]">
            {restName}
          </em>
        )}
      </p>

      {/* Divider */}
      <span className="my-2 block h-px w-8 mx-auto bg-gradient-to-r from-transparent via-[#038DCD]/40 to-transparent" />

      {/* Meta */}
      <p className="text-[12px] italic font-light text-gray-500 leading-relaxed">
        {birthYear ? `b. ${birthYear}` : ''}
        {age && !member.isDeceased ? ` · ${age} yrs` : ''}
        {member.isDeceased && (
          <>
            <br />
            <em>
              † {member.deceasedDate ? new Date(member.deceasedDate).getFullYear() : 'Deceased'}
            </em>
          </>
        )}
      </p>

      {member.membershipNo && (
        <p className="mt-1 font-sans text-[10px] tracking-[0.14em] text-[#038DCD]/80">
          {member.membershipNo}
        </p>
      )}
      {!member.isRegisteredMember && (
        <p className="mt-1 text-[10px] italic text-gray-500">Unregistered</p>
      )}
    </button>
  );
}

// ── Generation Section ─────────────────────────────────────────────────────────

function GenSection({
  label,
  children,
  showLineIn = true,
}: {
  label: string;
  children: React.ReactNode;
  showLineIn?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      {showLineIn && (
        <div className="w-px h-10 bg-gradient-to-b from-[#038DCD]/40 to-[#038DCD]/20" />
      )}
      <div className="flex flex-col items-center w-full">
        {/* Gen label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[#038DCD]/40" />
          <span className="font-sans text-[10.5px] uppercase tracking-[0.22em] text-[#038DCD]">
            {label}
          </span>
          <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[#038DCD]/40" />
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Detail Modal ───────────────────────────────────────────────────────────────

function MemberDetailModal({
  member,
  onClose,
}: {
  member: MemberNode;
  onClose: () => void;
}) {
  const age = calcAge(member.dob);
  const nameParts = (member.name || 'Unknown').split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  const rows: [string, string][] = [];
  if (member.membershipNo) rows.push(['Membership', member.membershipNo]);
  if (member.cnic) rows.push(['CNIC', member.cnic]);
  if (member.dob) rows.push(['Date of birth', formatDate(member.dob)!]);
  if (age && !member.isDeceased) rows.push(['Age', `${age} years`]);
  const g = genderStr(member.genderCode);
  if (g) rows.push(['Gender', g]);
  if (member.fatherName) rows.push(['Father', member.fatherName]);
  if (member.motherName) rows.push(['Mother', member.motherName]);
  if (member.isDeceased && member.deceasedDate)
    rows.push(['Deceased', formatDate(member.deceasedDate)!]);
  if (!member.isRegisteredMember) rows.push(['Status', 'Unregistered']);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/55 backdrop-blur-sm animate-[fadeIn_0.18s_ease]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-lg border border-[#038DCD]/30 overflow-hidden animate-[slideUp_0.22s_ease] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-7 pt-7 pb-5 text-center border-b border-[#038DCD]/20 bg-gray-50">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 text-gray-500 text-sm hover:border-[#038DCD] hover:text-[#038DCD] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <span className="block font-sans text-[10px] uppercase tracking-[0.24em] text-[#038DCD] mb-2.5">
            {member.relationToSelf || 'Family Member'}
          </span>
          <h2 className="text-[26px] font-bold text-gray-900 leading-tight">
            {firstName}
            {restName && (
              <>
                <br />
                <em className="not-italic font-light text-[22px] text-gray-600">{restName}</em>
              </>
            )}
          </h2>
          <p className="mt-3 tracking-[0.4em] text-[#038DCD] text-sm">✦ ✦ ✦</p>
        </div>

        {/* Body */}
        <div className="px-7 py-5 max-h-[55vh] overflow-y-auto divide-y divide-gray-200">
          {rows.length === 0 ? (
            <p className="text-center text-gray-500 italic text-sm py-3">
              No additional details on record.
            </p>
          ) : (
            rows.map(([label, value]) => (
              <div key={label} className="flex justify-between items-baseline gap-3 py-2.5">
                <span className="text-[13px] italic font-light text-gray-500 shrink-0">
                  {label}
                </span>
                <span className="text-[14px] font-medium text-gray-900 text-right">{value}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-[#038DCD] font-sans text-[11px] uppercase tracking-[0.22em] text-[#038DCD] hover:bg-[#038DCD] hover:text-white transition-all duration-150"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function FamilyTreePage() {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberNode | null>(null);

  useEffect(() => {
    const fetchFamilyTree = async () => {
      try {
        const response = await fetch('/api/member/family-tree');
        if (response.ok) {
          const data = await response.json();
          setFamilyTree(data);
        }
      } catch (error) {
        console.error('Error fetching family tree:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyTree();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 rounded-full border-[1.5px] border-[#038DCD]/20 border-t-[#038DCD] animate-spin" />
        <p className="text-gray-600 italic text-[15px]">Tracing your lineage…</p>
      </div>
    );
  }

  if (!familyTree) {
    return (
      <div className="text-center py-12 text-gray-600 italic">
        Unable to load family tree.
      </div>
    );
  }

  const allMembers = [
    familyTree.self,
    ...familyTree.spouse,
    ...familyTree.spouseParents,
    ...familyTree.parents,
    ...familyTree.grandparents,
    ...familyTree.siblings,
    ...familyTree.children,
    ...(familyTree.grandchildren || []),
  ];
  const totalRegistered = allMembers.filter((m) => m?.isRegisteredMember).length;
  const totalDeceased = allMembers.filter((m) => m?.isDeceased).length;
  const generationCount = [
    familyTree.grandparents?.length,
    familyTree.parents?.length || familyTree.spouseParents?.length,
    1,
    familyTree.children?.length,
    familyTree.grandchildren?.length,
  ].filter(Boolean).length;

  return (
    <>
      {/* Keyframes injected via style tag — Next.js compatible */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(18px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      <div className="min-h-screen pb-16">
        {/* ── Header ── */}
        <div className="text-center px-6 pt-12 pb-8">
          <p className="text-[#038DCD] text-lg tracking-[0.4em] mb-2">✦ ✦ ✦</p>
          <h1 className="text-4xl font-bold text-gray-900 tracking-[0.1em]">
            Family Heritage
          </h1>
          <p className="mt-2 text-[15px] italic font-light text-gray-600 tracking-[0.04em]">
            Ancestral record of {familyTree.self?.name || 'the family'}
          </p>
          <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-[#038DCD]/40 to-transparent" />
        </div>

        {/* ── Stats bar ── */}
        <div className="flex justify-center gap-10 border-y border-[#038DCD]/20 py-4 mx-6 mb-2">
          {[
            { n: totalRegistered, l: 'Members' },
            { n: generationCount, l: 'Generations' },
            { n: totalDeceased, l: 'Departed' },
          ].map(({ n, l }) => (
            <div key={l} className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-medium text-gray-900">{n}</span>
              <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#038DCD]">
                {l}
              </span>
            </div>
          ))}
        </div>

        {/* ── Tree ── */}
        <div className="flex flex-col items-center gap-0 mt-6 px-4">

          {/* GRANDPARENTS */}
          {familyTree.grandparents?.length > 0 && (
            <GenSection label="Grandparents" showLineIn={false}>
              <div className="flex flex-wrap justify-center gap-4">
                {familyTree.grandparents.map((m) => (
                  <MemberCard key={m.id} member={m} onSelect={setSelectedMember} />
                ))}
              </div>
            </GenSection>
          )}

          {/* PARENTS & IN-LAWS */}
          {(familyTree.parents?.length > 0 || familyTree.spouseParents?.length > 0) && (
            <GenSection label="Parents & In-Laws">
              <div className="flex flex-wrap justify-center gap-8">
                {familyTree.parents?.length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[12px] italic text-gray-600">Your parents</span>
                    <div className="flex flex-wrap justify-center gap-4">
                      {familyTree.parents.map((m) => (
                        <MemberCard key={m.id} member={m} onSelect={setSelectedMember} />
                      ))}
                    </div>
                  </div>
                )}
                {familyTree.spouseParents?.length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[12px] italic text-gray-600">Parents-in-law</span>
                    <div className="flex flex-wrap justify-center gap-4">
                      {familyTree.spouseParents.map((m) => (
                        <MemberCard key={m.id} member={m} onSelect={setSelectedMember} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </GenSection>
          )}

          {/* YOUR GENERATION */}
          <GenSection label="Your Generation">
            <div className="flex flex-col items-center gap-6 w-full">
              {/* Self + Spouse */}
              <div className="flex flex-wrap justify-center gap-4">
                {familyTree.self && (
                  <div className="flex flex-col items-center gap-1">
                    <Crown className="w-4 h-4 text-[#038DCD]" />
                    <MemberCard
                      member={familyTree.self}
                      isSelf
                      onSelect={setSelectedMember}
                    />
                  </div>
                )}
                {familyTree.spouse?.map((s) => (
                  <MemberCard key={s.id} member={s} onSelect={setSelectedMember} />
                ))}
              </div>

              {/* Siblings */}
              {familyTree.siblings?.length > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[12px] italic text-gray-600">Siblings</span>
                  <div className="flex flex-wrap justify-center gap-4">
                    {familyTree.siblings.map((m) => (
                      <MemberCard key={m.id} member={m} onSelect={setSelectedMember} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GenSection>

          {/* CHILDREN */}
          {familyTree.children?.length > 0 && (
            <GenSection label="Children">
              <div className="flex flex-wrap justify-center gap-4">
                {familyTree.children.map((m) => (
                  <MemberCard key={m.id} member={m} onSelect={setSelectedMember} />
                ))}
              </div>
            </GenSection>
          )}

          {/* GRANDCHILDREN */}
          {familyTree.grandchildren?.length > 0 && (
            <GenSection label="Grandchildren">
              <div className="flex flex-wrap justify-center gap-4">
                {familyTree.grandchildren.map((m) => (
                  <MemberCard key={m.id} member={m} onSelect={setSelectedMember} />
                ))}
              </div>
            </GenSection>
          )}
        </div>

        {/* Footer ornament */}
        <p className="text-center mt-12 text-[#038DCD] tracking-[0.5em]">✦ ✦ ✦</p>
      </div>

      {/* Modal */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
}