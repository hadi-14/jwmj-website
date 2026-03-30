import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEventInvitationEmail } from "@/lib/email";

interface Registration {
  id: string;
  memberId: string;
  isHead: boolean;
  memberName?: string;
  memberEmail?: string;
  wehvariaNo?: string;
  relation?: string;
  groupId?: string;
}

async function getRelation(headMemberId: string, familyMemberId: string): Promise<string> {
  const headId = parseInt(headMemberId);
  const familyId = parseInt(familyMemberId);

  // Check if spouse
  const spouse = await prisma.spouse_List.findFirst({
    where: {
      OR: [
        { Spu_MemberId: headId, Spu_WehvariaNo: familyId },
        { Spu_MemberId: familyId, Spu_WehvariaNo: headId }
      ]
    }
  });
  if (spouse) return 'Spouse';

  // Check if child
  const child = await prisma.children_List.findFirst({
    where: {
      Chd_memberId: familyId,
      OR: [
        { Chd_FatherMemberID: headId },
        { Chd_MotherMemberID: headId }
      ]
    }
  });
  if (child) return 'Child';

  // Check if parent
  const parent = await prisma.parents_List.findFirst({
    where: {
      Par_MemberID: headId,
      Par_WehvariaNo: familyId
    }
  });
  if (parent) return 'Parent';

  return 'Family Member';
}

// GET all event registrations for admin
export async function GET() {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            category: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // pending first
        { createdAt: 'desc' }
      ]
    });

    // Fetch wehvaria numbers for all members
    const memberIds = new Set<number>();
    registrations.forEach(reg => memberIds.add(parseInt(reg.memberId)));

    const members = await prisma.member_Information.findMany({
      where: {
        MemComputerID: { in: Array.from(memberIds) }
      },
      select: {
        MemComputerID: true,
        MemWehvariaNo: true
      }
    });

    const wehvariaMap: Record<string, string> = {};
    members.forEach(m => {
      wehvariaMap[m.MemComputerID.toString()] = m.MemWehvariaNo?.toString() || 'N/A';
    });

    // Group registrations by groupId
    const groupedRegistrations = registrations.reduce((acc, reg) => {
      if (!acc[reg.groupId]) {
        acc[reg.groupId] = {
          groupId: reg.groupId,
          head: reg.isHead ? reg : null,
          family: [],
          event: {
            id: reg.event.id,
            title: reg.event.title,
            date: reg.event.date instanceof Date ? reg.event.date.toISOString() : String(reg.event.date),
            category: reg.event.category
          },
          status: reg.status,
          createdAt: reg.createdAt
        };
      }
      if (reg.isHead) {
        const regWithWehvaria: Registration = { ...reg, wehvariaNo: wehvariaMap[reg.memberId] } as Registration;
        acc[reg.groupId].head = regWithWehvaria;
        acc[reg.groupId].status = reg.status;
      } else {
        const familyMember: Registration = { ...reg, wehvariaNo: wehvariaMap[reg.memberId] } as Registration;
        acc[reg.groupId].family.push(familyMember);
      }
      return acc;
    }, {} as Record<string, { groupId: string; head?: Registration; family: Registration[]; status?: string; event?: { id: string; title: string; date: string; category: string }; createdAt: Date }>);

    // Add relations to family members
    for (const group of Object.values(groupedRegistrations)) {
      if (group.head && group.family.length > 0) {
        for (const member of group.family) {
          member.relation = await getRelation(group.head.memberId, member.memberId);
        }
      }
    }

    const result = Object.values(groupedRegistrations);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch event registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

// PUT update registration status (supports single or bulk)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, groupIds, action, notes } = body;
    let status = body.status;

    // Handle bulk operations (groupIds array) or single operation (groupId)
    const idsToUpdate = groupIds || (groupId ? [groupId] : null);

    if (!idsToUpdate || idsToUpdate.length === 0) {
      return NextResponse.json({ error: 'Group ID(s) required' }, { status: 400 });
    }

    // Convert action to status if action is provided
    if (action && !status) {
      const actionMap: Record<string, string> = {
        'approve': 'approved',
        'reject': 'rejected',
        'cancel': 'cancelled',
        'resend': 'approved' // resend doesn't change status
      };
      status = actionMap[action];
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update all registrations in the groups
    const updateResult = await prisma.eventRegistration.updateMany({
      where: { groupId: { in: idsToUpdate } },
      data: {
        status,
        notes: notes || null
      }
    });

    // If approved (or resend), send email invitations for each group
    if (status === 'approved' && updateResult.count > 0) {
      for (const id of idsToUpdate) {
        const registrations = await prisma.eventRegistration.findMany({
          where: { groupId: id },
          include: {
            event: true
          }
        });

        if (registrations.length > 0) {
          const headRegistration = registrations.find(r => r.isHead);
          if (headRegistration) {
            // @ts-expect-error - registrations from Prisma have all needed properties for email template
            await sendEventInvitationEmail(headRegistration, registrations);
          }
        }
      }
    }

    return NextResponse.json({ success: true, updated: updateResult.count, processed: idsToUpdate.length });
  } catch (error) {
    console.error('Failed to update registration status:', error);
    return NextResponse.json({ error: 'Failed to update registration status' }, { status: 500 });
  }
}