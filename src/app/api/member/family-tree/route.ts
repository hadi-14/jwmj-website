// app/api/member/family-tree/route.ts
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getMemberIdFromPayload, verifyMemberExists } from '@/lib/memberHelpers';
import { Decimal } from '@prisma/client/runtime/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

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

interface FamilyTreeResponse {
  self: MemberNode;
  spouse: MemberNode[];
  spouseParents: MemberNode[];
  children: MemberNode[];
  grandchildren: MemberNode[];
  parents: MemberNode[];
  grandparents: MemberNode[];
  siblings: MemberNode[];
}

/**
 * Helper to convert member data to MemberNode
 */
function toMemberNode(member: {
  MemComputerID?: Decimal | string;
  id?: string;
  MemName?: string | null;
  name?: string | null;
  MemMembershipNo?: string | null;
  membershipNo?: string | null;
  MemDOB?: Date | null;
  dob?: Date | null;
  MemCNIC?: Decimal | string | null;
  cnic?: string | null;
  MemGenderCode?: Decimal | number | string | null;
  genderCode?: string | null;
  MemFatherName?: string | null;
  fatherName?: string | null;
  MemMotherName?: string | null;
  motherName?: string | null;
  Mem_DeceasedDate?: Date | null;
  deceasedDate?: Date | null;
  isDeceased?: boolean;
}, relation?: string, isRegistered: boolean = true): MemberNode {
  return {
    id: member.MemComputerID?.toString() || member.id || 'unknown',
    name: member.MemName?.trim() || member.name || null,
    membershipNo: member.MemMembershipNo?.trim() || member.membershipNo || null,
    dob: member.MemDOB || member.dob || null,
    cnic: member.MemCNIC?.toString() || member.cnic || null,
    genderCode: member.MemGenderCode?.toString() || member.genderCode || null,
    fatherName: member.MemFatherName?.trim() || member.fatherName || null,
    motherName: member.MemMotherName?.trim() || member.motherName || null,
    isDeceased: member.Mem_DeceasedDate !== null || member.isDeceased || false,
    deceasedDate: member.Mem_DeceasedDate || member.deceasedDate || null,
    relationToSelf: relation,
    isRegisteredMember: isRegistered,
  };
}

function createUnregisteredNameNode(name: string, relation: string): MemberNode {
  const idSafe = name.replace(/[\s\\/\\#\?\%]/g, '-').toLowerCase().slice(0, 40);
  return {
    id: `unreg-${relation.toLowerCase().replace(/\s+/g, '-')}-${idSafe}`,
    name: name.trim() || null,
    membershipNo: null,
    dob: null,
    cnic: null,
    genderCode: null,
    fatherName: null,
    motherName: null,
    isDeceased: false,
    deceasedDate: null,
    relationToSelf: relation,
    isRegisteredMember: false,
  };
}

/**
 * Get member's basic info
 */
async function getMemberInfo(memberId: Decimal) {
  return await prisma.member_Information.findUnique({
    where: { MemComputerID: memberId },
    select: {
      MemComputerID: true,
      MemName: true,
      MemMembershipNo: true,
      MemDOB: true,
      MemCNIC: true,
      MemGenderCode: true,
      MemFatherName: true,
      MemMotherName: true,
      Mem_DeceasedDate: true,
    },
  });
}

/**
 * Get all spouses of a member
 */
async function getSpouses(memberId: Decimal): Promise<MemberNode[]> {
  // Find spouse records where member is either side of spouse relationship
  const spouseRecords = await prisma.spouse_List.findMany({
    where: {
      AND: [
        {
          OR: [
            { Spu_ParentMemberID: memberId },
            { Spu_MemberId: memberId }
          ]
        },
        {
          OR: [
            { Spu_Deactive: null },
            { Spu_Deactive: 0 }
          ]
        }
      ]
    },
    select: {
      Spu_ParentMemberID: true,
      Spu_MemberId: true,
      Spu_WehvariaNo: true,
    }
  });

  if (spouseRecords.length === 0) return [];

  // Map the related spouse ID (the opposite side of the relationship)
  const spouseIds = spouseRecords
    .map(r => {
      if (r.Spu_ParentMemberID?.toString() === memberId.toString()) return r.Spu_MemberId || r.Spu_WehvariaNo;
      if (r.Spu_MemberId?.toString() === memberId.toString()) return r.Spu_ParentMemberID || r.Spu_WehvariaNo;
      return null;
    })
    .filter((id): id is Decimal => id !== null);

  // console.log('Spouse IDs:', spouseIds, spouseRecords);
  const spouses = await prisma.member_Information.findMany({
    where: {
      MemComputerID: { in: spouseIds }
    },
    select: {
      MemComputerID: true,
      MemName: true,
      MemMembershipNo: true,
      MemDOB: true,
      MemCNIC: true,
      MemGenderCode: true,
      MemFatherName: true,
      MemMotherName: true,
      Mem_DeceasedDate: true,
    },
  });

  return spouses.map(s => toMemberNode(s, 'Spouse'));
}

/**
 * Get all parents of spouse members
 */
async function getSpouseParents(spouseIds: Decimal[]): Promise<MemberNode[]> {
  if (spouseIds.length === 0) return [];

  const spouseParents: MemberNode[] = [];
  const addedParentIds = new Set<string>();

  // Lookup spouse info for fallback names if no parent rows.
  if (spouseIds.length > 0 && spouseParents.length === 0) {
    const spouseInfos = await prisma.member_Information.findMany({
      where: { MemComputerID: { in: spouseIds } },
      select: {
        MemComputerID: true,
        MemFatherName: true,
        MemMotherName: true,
      },
    });

    spouseInfos.forEach(sp => {
      if (sp.MemFatherName) {
        const node = createUnregisteredNameNode(sp.MemFatherName, 'Father-in-law');
        if (!addedParentIds.has(node.id)) {
          spouseParents.push(node);
          addedParentIds.add(node.id);
        }
      }
      if (sp.MemMotherName) {
        const node = createUnregisteredNameNode(sp.MemMotherName, 'Mother-in-law');
        if (!addedParentIds.has(node.id)) {
          spouseParents.push(node);
          addedParentIds.add(node.id);
        }
      }
    });
  }

  return spouseParents;
}

/**
 * Get all children of a member
 */
async function getChildren(memberId: Decimal): Promise<MemberNode[]> {
  const children = await prisma.children_List.findMany({
    where: {
      OR: [
        { Chd_MotherMemberID: memberId },
        { Chd_FatherMemberID: memberId }
      ],
    },
    include: {
      member: {
        select: {
          MemComputerID: true,
          MemName: true,
          MemMembershipNo: true,
          MemDOB: true,
          MemCNIC: true,
          MemGenderCode: true,
          MemFatherName: true,
          MemMotherName: true,
          Mem_DeceasedDate: true,
        },
      },
    },
  });

  return children.map(c => toMemberNode(c.member, 'Child'));
}

/**
 * Get all parents of a member - Only registered relationships
 */
async function getParents(memberId: Decimal): Promise<MemberNode[]> {
  const parents: MemberNode[] = [];
  const addedParentIds = new Set<string>();

  // Lookup member info for fallback names if no parent rows.
  // console.log('Parents found from relationships:', parents, memberId.toString());
  if (memberId && parents.length === 0) {
    const memberInfo = await getMemberInfo(memberId);
    // console.log('Member info for parent fallback:', memberInfo);
    if (memberInfo) {
      if (memberInfo.MemFatherName) {
        const node = createUnregisteredNameNode(memberInfo.MemFatherName, 'Father');
        if (!addedParentIds.has(node.id)) {
          parents.push(node);
          addedParentIds.add(node.id);
        }
      }
      if (memberInfo.MemMotherName) {
        const node = createUnregisteredNameNode(memberInfo.MemMotherName, 'Mother');
        if (!addedParentIds.has(node.id)) {
          parents.push(node);
          addedParentIds.add(node.id);
        }
      }
    }
  }

  return parents;
}

/**
 * Get siblings (children of same parents)
 */
async function getSiblings(memberId: Decimal, parentIds: Decimal[]): Promise<MemberNode[]> {
  if (parentIds.length === 0) return [];

  const siblings = await prisma.children_List.findMany({
    where: {
      AND: [
        {
          OR: [
            { Chd_MotherMemberID: { in: parentIds } },
            { Chd_FatherMemberID: { in: parentIds } }
          ]
        },
        { Chd_memberId: { not: memberId } },
        {
          OR: [
            { Chd_deactive: null },
            { Chd_deactive: 0 }
          ]
        }
      ]
    },
    include: {
      member: {
        select: {
          MemComputerID: true,
          MemName: true,
          MemMembershipNo: true,
          MemDOB: true,
          MemCNIC: true,
          MemGenderCode: true,
          MemFatherName: true,
          MemMotherName: true,
          Mem_DeceasedDate: true,
        },
      },
    },
    distinct: ['Chd_memberId'],
  });

  return siblings.map(s => toMemberNode(s.member, 'Sibling'));
}

/**
 * Get grandchildren (children of children)
 */
async function getGrandchildren(childrenIds: Decimal[]): Promise<MemberNode[]> {
  if (childrenIds.length === 0) return [];

  const grandchildren = await prisma.children_List.findMany({
    where: {
      AND: [
        {
          OR: [
            { Chd_MotherMemberID: { in: childrenIds } },
            { Chd_FatherMemberID: { in: childrenIds } }
          ]
        },
        {
          OR: [
            { Chd_deactive: null },
            { Chd_deactive: 0 }
          ]
        }
      ]
    },
    include: {
      member: {
        select: {
          MemComputerID: true,
          MemName: true,
          MemMembershipNo: true,
          MemDOB: true,
          MemCNIC: true,
          MemGenderCode: true,
          MemFatherName: true,
          MemMotherName: true,
          Mem_DeceasedDate: true,
        },
      },
    },
  });

  return grandchildren.map(gc => toMemberNode(gc.member, 'Grandchild'));
}

/**
 * Get grandparents (parents of parents) - Only registered relationships
 */
async function getGrandparents(parentIds: Decimal[], parents: MemberNode[]): Promise<MemberNode[]> {
  const grandparents: MemberNode[] = [];
  const addedGrandparentIds = new Set<string>();

  // Get registered grandparents from Parents_List only
  if (parentIds.length > 0) {
    const grandparentRelations = await prisma.parents_List.findMany({
      where: {
        Par_MemberID: { in: parentIds },
        OR: [
          { Par_Deactive: null },
          { Par_Deactive: 0 }
        ]
      },
      include: {
        parent: {
          select: {
            MemComputerID: true,
            MemName: true,
            MemMembershipNo: true,
            MemDOB: true,
            MemCNIC: true,
            MemGenderCode: true,
            Mem_DeceasedDate: true,
          },
        },
      },
    });

    grandparentRelations
      .filter(gp => gp.parent !== null)
      .forEach(gp => {
        const gpId = gp.parent!.MemComputerID.toString();
        if (!addedGrandparentIds.has(gpId)) {
          // Create node without fatherName/motherName (those are just unverified text)
          const grandparentNode: MemberNode = {
            id: gpId,
            name: gp.parent!.MemName?.trim() || null,
            membershipNo: gp.parent!.MemMembershipNo?.trim() || null,
            dob: gp.parent!.MemDOB || null,
            cnic: gp.parent!.MemCNIC?.toString() || null,
            genderCode: gp.parent!.MemGenderCode?.toString() || null,
            fatherName: null,
            motherName: null,
            isDeceased: gp.parent!.Mem_DeceasedDate !== null || false,
            deceasedDate: gp.parent!.Mem_DeceasedDate || null,
            relationToSelf: 'Grandparent',
            isRegisteredMember: true,
          };
          grandparents.push(grandparentNode);
          addedGrandparentIds.add(gpId);
        }
      });
  }

  // If no registered grandparents found, fallback to parent name fields from input parent nodes
  if (grandparents.length === 0 && parents.length > 0) {
    for (const parent of parents) {
      if (parent.fatherName) {
        const gp = createUnregisteredNameNode(parent.fatherName, 'Grandparent');
        if (!addedGrandparentIds.has(gp.id)) {
          grandparents.push(gp);
          addedGrandparentIds.add(gp.id);
        }
      }
      if (parent.motherName) {
        const gp = createUnregisteredNameNode(parent.motherName, 'Grandparent');
        if (!addedGrandparentIds.has(gp.id)) {
          grandparents.push(gp);
          addedGrandparentIds.add(gp.id);
        }
      }
    }
  }

  return grandparents;
}

export async function GET() {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token.value, JWT_SECRET);

    if (payload.role !== 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get member computer ID from payload
    const memberComputerId = await getMemberIdFromPayload(payload as { memberData?: { MemComputerID?: string | number }, email?: string });

    if (!memberComputerId) {
      return NextResponse.json({ error: 'Member data not found' }, { status: 404 });
    }

    // Verify member exists and is active
    const memberExists = await verifyMemberExists(memberComputerId);
    if (!memberExists) {
      return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
    }

    const memberDecimal = new Decimal(memberComputerId);

    // Fetch member's own information
    const member = await getMemberInfo(memberDecimal);

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Build family tree in parallel for better performance
    const [spouses, children, parents] = await Promise.all([
      getSpouses(memberDecimal),
      getChildren(memberDecimal),
      getParents(memberDecimal),
    ]);

    // Get spouse IDs for further queries
    const spouseIds = spouses
      .filter(s => s.isRegisteredMember)
      .map(s => new Decimal(s.id));

    // Get IDs for next generation queries (only registered members)
    const childrenIds = children
      .filter(c => c.isRegisteredMember)
      .map(c => new Decimal(c.id));
    const parentIds = parents
      .filter(p => p.isRegisteredMember)
      .map(p => new Decimal(p.id));

    // Fetch extended family
    const [grandchildren, siblings, spouseParents] = await Promise.all([
      getGrandchildren(childrenIds),
      getSiblings(memberDecimal, parentIds),
      getSpouseParents(spouseIds),
    ]);

    // Get grandparents (pass parents array for name extraction)
    const grandparents = await getGrandparents(parentIds, parents);

    // Build complete family tree response
    const familyTree: FamilyTreeResponse = {
      self: toMemberNode(member, 'Self'),
      spouse: spouses,
      spouseParents: spouseParents,
      children: children,
      grandchildren: grandchildren,
      parents: parents,
      grandparents: grandparents,
      siblings: siblings,
    };

    return NextResponse.json(familyTree);
  } catch (error) {
    console.error('Family tree error:', error);

    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { error: 'An error occurred while fetching family tree' },
      { status: 500 }
    );
  }
}