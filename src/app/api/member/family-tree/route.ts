// app/api/member/family-tree/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
  children: MemberNode[];
  grandchildren: MemberNode[];
  parents: MemberNode[];
  grandparents: MemberNode[];
  siblings: MemberNode[];
}

/**
 * Helper to convert member data to MemberNode
 */
function toMemberNode(member: any, relation?: string, isRegistered: boolean = true): MemberNode {
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
  // Find where this member is listed as spouse
  const spouseRecords = await prisma.spouse_List.findMany({
    where: {
      Spu_WehvariaNo: memberId,
      OR: [
        { Spu_Deactive: null },
        { Spu_Deactive: 0 }
      ]
    },
    select: {
      Spu_MemberId: true,
    }
  });

  if (spouseRecords.length === 0) return [];

  // Get full member info for spouses
  const spouseIds = spouseRecords.map(s => s.Spu_MemberId);
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
 * Create a parent node from name strings (when parent is not a registered member)
 */
function createUnregisteredParentNode(
  name: string | null,
  relation: 'Father' | 'Mother',
  genderCode?: string
): MemberNode | null {
  if (!name || name.trim() === '' || name.trim() === '-' || name.trim().toLowerCase() === 'n/a') {
    return null;
  }

  return {
    id: `unregistered-${relation.toLowerCase()}-${Date.now()}`,
    name: name.trim(),
    membershipNo: null,
    dob: null,
    cnic: null,
    genderCode: genderCode || (relation === 'Father' ? '1' : '2'),
    fatherName: null,
    motherName: null,
    isDeceased: false,
    deceasedDate: null,
    relationToSelf: relation,
    isRegisteredMember: false,
  };
}

/**
 * Get all parents of a member - Enhanced to get data from Member_Information
 */
async function getParents(memberId: Decimal): Promise<MemberNode[]> {
  const parents: MemberNode[] = [];
  const addedParentIds = new Set<string>();

  // Get the member's own record to extract father/mother names
  const memberInfo = await prisma.member_Information.findUnique({
    where: { MemComputerID: memberId },
    select: {
      MemFatherName: true,
      MemMotherName: true,
    }
  });

  // Method 1: Try Parents_List table
  const parentRelations = await prisma.parents_List.findMany({
    where: {
      Par_MemberID: memberId,
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
          MemFatherName: true,
          MemMotherName: true,
          Mem_DeceasedDate: true,
        },
      },
    },
  });

  parentRelations
    .filter(p => p.parent !== null)
    .forEach(p => {
      const parentId = p.parent!.MemComputerID.toString();
      if (!addedParentIds.has(parentId)) {
        const relation = p.parent!.MemGenderCode?.toString() === '2' ? 'Mother' : 'Father';
        parents.push(toMemberNode(p.parent!, relation));
        addedParentIds.add(parentId);
      }
    });

  // Method 2: Check Children_List table (where current member is the child)
  const childRecord = await prisma.children_List.findFirst({
    where: {
      Chd_memberId: memberId,
      OR: [
        { Chd_deactive: null },
        { Chd_deactive: 0 }
      ]
    },
    select: {
      Chd_MotherMemberID: true,
      Chd_FatherMemberID: true,
    }
  });

  if (childRecord) {
    const parentIds: Decimal[] = [];
    if (childRecord.Chd_MotherMemberID) parentIds.push(childRecord.Chd_MotherMemberID);
    if (childRecord.Chd_FatherMemberID) parentIds.push(childRecord.Chd_FatherMemberID);

    if (parentIds.length > 0) {
      const parentMembers = await prisma.member_Information.findMany({
        where: {
          MemComputerID: { in: parentIds }
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
        }
      });

      parentMembers.forEach(pm => {
        const parentId = pm.MemComputerID.toString();
        if (!addedParentIds.has(parentId)) {
          const relation = pm.MemGenderCode?.toString() === '2' ? 'Mother' : 'Father';
          parents.push(toMemberNode(pm, relation));
          addedParentIds.add(parentId);
        }
      });
    }
  }

  // Method 3: If parents still not found, use father/mother names from Member_Information
  // Check if we have a father in the list
  const hasFather = parents.some(p => p.relationToSelf === 'Father');
  const hasMother = parents.some(p => p.relationToSelf === 'Mother');

  if (!hasFather && memberInfo?.MemFatherName) {
    // Try to find father by name in the database
    const fatherByName = await prisma.member_Information.findFirst({
      where: {
        MemName: memberInfo.MemFatherName,
        MemGenderCode: 1, // Male
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
      }
    });

    if (fatherByName && !addedParentIds.has(fatherByName.MemComputerID.toString())) {
      parents.push(toMemberNode(fatherByName, 'Father'));
      addedParentIds.add(fatherByName.MemComputerID.toString());
    } else {
      // Create unregistered parent node
      const unregisteredFather = createUnregisteredParentNode(
        memberInfo.MemFatherName,
        'Father',
        '1'
      );
      if (unregisteredFather) {
        parents.push(unregisteredFather);
      }
    }
  }

  if (!hasMother && memberInfo?.MemMotherName) {
    // Try to find mother by name in the database
    const motherByName = await prisma.member_Information.findFirst({
      where: {
        MemName: memberInfo.MemMotherName,
        MemGenderCode: 2, // Female
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
      }
    });

    if (motherByName && !addedParentIds.has(motherByName.MemComputerID.toString())) {
      parents.push(toMemberNode(motherByName, 'Mother'));
      addedParentIds.add(motherByName.MemComputerID.toString());
    } else {
      // Create unregistered parent node
      const unregisteredMother = createUnregisteredParentNode(
        memberInfo.MemMotherName,
        'Mother',
        '2'
      );
      if (unregisteredMother) {
        parents.push(unregisteredMother);
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
      OR: [
        { Chd_MotherMemberID: { in: parentIds } },
        { Chd_FatherMemberID: { in: parentIds } }
      ],
      Chd_memberId: { not: memberId },
      OR: [
        { Chd_deactive: null },
        { Chd_deactive: 0 }
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
      OR: [
        { Chd_MotherMemberID: { in: childrenIds } },
        { Chd_FatherMemberID: { in: childrenIds } }
      ],
      OR: [
        { Chd_deactive: null },
        { Chd_deactive: 0 }
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
 * Get grandparents (parents of parents) - Enhanced to get more data
 */
async function getGrandparents(parentIds: Decimal[], parents: MemberNode[]): Promise<MemberNode[]> {
  const grandparents: MemberNode[] = [];
  const addedGrandparentIds = new Set<string>();

  // Get registered grandparents from Parents_List
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
            MemFatherName: true,
            MemMotherName: true,
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
          grandparents.push(toMemberNode(gp.parent!, 'Grandparent'));
          addedGrandparentIds.add(gpId);
        }
      });
  }

  // Get grandparent names from registered parents' records
  for (const parent of parents) {
    if (parent.isRegisteredMember && parent.fatherName) {
      const unregisteredGrandfather = createUnregisteredParentNode(
        parent.fatherName,
        'Father',
        '1'
      );
      if (unregisteredGrandfather && !addedGrandparentIds.has(unregisteredGrandfather.id)) {
        unregisteredGrandfather.relationToSelf = 'Grandparent';
        grandparents.push(unregisteredGrandfather);
        addedGrandparentIds.add(unregisteredGrandfather.id);
      }
    }

    if (parent.isRegisteredMember && parent.motherName) {
      const unregisteredGrandmother = createUnregisteredParentNode(
        parent.motherName,
        'Mother',
        '2'
      );
      if (unregisteredGrandmother && !addedGrandparentIds.has(unregisteredGrandmother.id)) {
        unregisteredGrandmother.relationToSelf = 'Grandparent';
        grandparents.push(unregisteredGrandmother);
        addedGrandparentIds.add(unregisteredGrandmother.id);
      }
    }
  }

  return grandparents;
}

export async function GET(request: NextRequest) {
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
    const memberComputerId = await getMemberIdFromPayload(payload);

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

    // Get IDs for next generation queries (only registered members)
    const childrenIds = children
      .filter(c => c.isRegisteredMember)
      .map(c => new Decimal(c.id));
    const parentIds = parents
      .filter(p => p.isRegisteredMember)
      .map(p => new Decimal(p.id));

    // Fetch extended family
    const [grandchildren, siblings] = await Promise.all([
      getGrandchildren(childrenIds),
      getSiblings(memberDecimal, parentIds),
    ]);

    // Get grandparents (pass parents array for name extraction)
    const grandparents = await getGrandparents(parentIds, parents);

    // Build complete family tree response
    const familyTree: FamilyTreeResponse = {
      self: toMemberNode(member, 'Self'),
      spouse: spouses,
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