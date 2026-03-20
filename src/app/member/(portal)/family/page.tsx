'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  Baby,
  User,
  Calendar,
  Hash,
  ChevronRight,
  Search
} from 'lucide-react';

interface FamilyMember {
  id?: string | number;
  name?: string;
  membershipNo?: string;
  dob?: string;
  gender?: string;
  relation?: string;
  [key: string]: unknown;
}

interface FamilyTree {
  self: FamilyMember;
  spouse: FamilyMember[];
  children: FamilyMember[];
  parents: FamilyMember[];
}

export default function FamilyTreePage() {
  const [familyTree, setFamilyTree] = useState<FamilyTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    parents: true,
    spouse: true,
    children: true
  });

  useEffect(() => {
    fetchFamilyTree();
  }, []);

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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-primary-blue-200 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground-300">Loading family tree...</p>
      </div>
    );
  }

  const totalFamily = familyTree
    ? (familyTree.parents?.length || 0) + (familyTree.spouse?.length || 0) + (familyTree.children?.length || 0)
    : 0;

  const noFamily = !familyTree?.parents?.length && !familyTree?.spouse?.length && !familyTree?.children?.length;

  // Filter members based on search
  const filterMembers = (members: FamilyMember[] | undefined) => {
    if (!members || !searchQuery) return members || [];
    return members.filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.membershipNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const FamilyMemberCard = ({ member, relation }: { member: FamilyMember; relation: string }) => {
    const initials = (member.name as string)?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '?';
    
    const gradientStyles: Record<string, string> = {
      parent: 'from-accent-navy to-accent-navy-600',
      spouse: 'from-pink-500 to-rose-600',
      child: 'from-primary-blue to-primary-blue-600',
    };

    const bgStyles: Record<string, string> = {
      parent: 'bg-accent-navy-100',
      spouse: 'bg-pink-50',
      child: 'bg-primary-blue-50',
    };

    return (
      <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 hover:shadow-md hover:border-primary-blue transition-all">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientStyles[relation]} flex items-center justify-center shrink-0`}>
            <span className="text-primary-white font-bold text-sm">{initials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate">{member.name || 'Unknown'}</h3>
            <p className="text-xs text-foreground-300 capitalize mb-2">{relation}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-300">
              {member.membershipNo && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {member.membershipNo}
                </span>
              )}
              {member.dob && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(member.dob).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FamilySection = ({ 
    title, 
    icon: Icon, 
    members, 
    relation,
    colorClass,
    sectionKey
  }: { 
    title: string; 
    icon: React.ElementType; 
    members: FamilyMember[]; 
    relation: string;
    colorClass: string;
    sectionKey: string;
  }) => {
    const filteredMembers = filterMembers(members);
    const isExpanded = expandedSections[sectionKey];

    if (!members?.length) return null;

    return (
      <div className="bg-background rounded-2xl border-2 border-primary-silver-400 overflow-hidden">
        {/* Section Header */}
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-primary-silver-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="font-bold text-foreground">{title}</h2>
              <p className="text-xs text-foreground-300">{members.length} member{members.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-foreground-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Section Content */}
        {isExpanded && (
          <div className="p-4 pt-0 border-t-2 border-primary-silver-300">
            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                {filteredMembers.map((member, idx) => (
                  <FamilyMemberCard key={member.id || idx} member={member} relation={relation} />
                ))}
              </div>
            ) : searchQuery ? (
              <p className="text-sm text-foreground-300 text-center py-4">
                No {title.toLowerCase()} match your search
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Family Tree</h1>
        <p className="text-foreground-300 mt-1">Your registered family members in the Jamat system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
          <p className="text-2xl font-bold text-primary-blue">{totalFamily}</p>
          <p className="text-xs font-medium text-foreground-300">Total Members</p>
        </div>
        <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
          <p className="text-2xl font-bold text-accent-navy">{familyTree?.parents?.length || 0}</p>
          <p className="text-xs font-medium text-foreground-300">Parents</p>
        </div>
        <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
          <p className="text-2xl font-bold text-pink-600">{familyTree?.spouse?.length || 0}</p>
          <p className="text-xs font-medium text-foreground-300">Spouse</p>
        </div>
        <div className="bg-background rounded-xl border-2 border-primary-silver-400 p-4 text-center">
          <p className="text-2xl font-bold text-primary-green">{familyTree?.children?.length || 0}</p>
          <p className="text-xs font-medium text-foreground-300">Children</p>
        </div>
      </div>

      {/* Search */}
      {!noFamily && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-300" />
          <input
            type="text"
            placeholder="Search family members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-background border-2 border-primary-silver-400 rounded-xl text-foreground placeholder:text-foreground-300 focus:border-primary-blue focus:outline-none transition-colors"
          />
        </div>
      )}

      {noFamily ? (
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-8 text-center">
          <div className="w-20 h-20 bg-primary-silver-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-foreground-200" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Family Members Found</h3>
          <p className="text-foreground-300 mb-6 max-w-md mx-auto">
            No family members are currently registered in the system. Contact administration to add family members.
          </p>
          <button className="px-6 py-3 bg-primary-blue text-primary-white font-bold rounded-xl hover:bg-primary-blue-600 transition-colors">
            Contact Support
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Parents Section */}
          <FamilySection
            title="Parents"
            icon={User}
            members={familyTree?.parents || []}
            relation="parent"
            colorClass="bg-accent-navy-100 text-accent-navy"
            sectionKey="parents"
          />

          {/* Spouse Section */}
          <FamilySection
            title="Spouse"
            icon={Heart}
            members={familyTree?.spouse || []}
            relation="spouse"
            colorClass="bg-pink-100 text-pink-600"
            sectionKey="spouse"
          />

          {/* Children Section */}
          <FamilySection
            title="Children"
            icon={Baby}
            members={familyTree?.children || []}
            relation="child"
            colorClass="bg-primary-blue-100 text-primary-blue"
            sectionKey="children"
          />
        </div>
      )}
    </div>
  );
}
