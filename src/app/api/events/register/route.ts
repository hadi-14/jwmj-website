import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getMemberIdFromPayload, verifyMemberExists } from '@/lib/memberHelpers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// POST register for event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, familyMembers } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Handle both old format (array) and new format (object with categories)
    let spouseIds: string[] = [];
    let childrenIds: string[] = [];
    let parentsIds: string[] = [];
    let legacyFamilyMembers: string[] = [];

    if (Array.isArray(familyMembers)) {
      // Legacy format - treat all as family members without specific relationships
      legacyFamilyMembers = familyMembers;
    } else if (familyMembers && typeof familyMembers === 'object') {
      // New format with categorized family members
      spouseIds = familyMembers.spouse || [];
      childrenIds = familyMembers.children || [];
      parentsIds = familyMembers.parents || [];
    }

    // Verify authentication (same as member API)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token.value, JWT_SECRET);
      payload = verified.payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_jwtError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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

    // Establish permanent family relationships if categorized family members provided
    if (spouseIds.length > 0 || childrenIds.length > 0 || parentsIds.length > 0) {
      // await establishFamilyRelationships(memberComputerId, spouseIds, childrenIds, parentsIds);
    }

    // normalize to string for registration queries
    const memberIdStr = memberComputerId.toString();

    // Get member details
    const member = await prisma.member_Information.findUnique({
      where: { MemComputerID: memberComputerId },
      select: {
        MemComputerID: true,
        MemName: true,
        emails: { take: 1 }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Check if already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        memberId: memberIdStr,
        isHead: true
      }
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Generate group ID for this registration
    const groupId = `REG-${Date.now()}-${memberComputerId}`;

    // Create registration for self (head)
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: memberIdStr,
        memberName: member.MemName || 'Unknown',
        memberEmail: member.emails[0]?.MEM_Emailid || null,
        isHead: true,
        groupId,
        status: 'pending'
      }
    });

    // Register family members if provided
    const familyRegistrations = [];

    // Handle legacy format (all family members in one array)
    if (legacyFamilyMembers.length > 0) {
      for (const familyId of legacyFamilyMembers) {
        const familyReg = await createFamilyRegistration(eventId, familyId, groupId);
        if (familyReg) {
          familyRegistrations.push(familyReg);
        }
      }
    } else {
      // Handle new categorized format
      // Register spouses
      for (const spouseId of spouseIds) {
        const familyReg = await createFamilyRegistration(eventId, spouseId, groupId);
        if (familyReg) {
          familyRegistrations.push(familyReg);
        }
      }

      // Register children
      for (const childId of childrenIds) {
        const familyReg = await createFamilyRegistration(eventId, childId, groupId);
        if (familyReg) {
          familyRegistrations.push(familyReg);
        }
      }

      // Register parents
      for (const parentId of parentsIds) {
        const familyReg = await createFamilyRegistration(eventId, parentId, groupId);
        if (familyReg) {
          familyRegistrations.push(familyReg);
        }
      }
    }
    return NextResponse.json({
      registration,
      familyRegistrations
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to register for event' }, { status: 500 });
  }
}



// Helper function to create family member registration
async function createFamilyRegistration(eventId: string, familyId: string, groupId: string) {
  try {
    // Get family member details
    const familyMember = await prisma.member_Information.findUnique({
      where: { MemComputerID: parseInt(familyId) },
      select: {
        MemComputerID: true,
        MemName: true,
        emails: { take: 1 }
      }
    });

    if (!familyMember) {
      return null;
    }

    // Check if family member already registered
    const existingFamilyReg = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        memberId: familyId
      }
    });

    if (existingFamilyReg) {
      return null;
    }

    // Create registration
    const familyReg = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: familyId,
        memberName: familyMember.MemName || 'Unknown',
        memberEmail: familyMember.emails[0]?.MEM_Emailid || null,
        isHead: false,
        groupId,
        status: 'pending'
      }
    });

    return familyReg;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return null;
  }
}

// GET registrations for current member
export async function GET() {
  try {
    // Verify authentication (same as member API)
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token.value, JWT_SECRET);
      payload = verified.payload;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (payload.role !== 'MEMBER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get member computer ID from payload
    const memberComputerId = await getMemberIdFromPayload(payload as { memberData?: { MemComputerID?: string | number }, email?: string });

    if (!memberComputerId) {
      return NextResponse.json({ error: 'Member data not found' }, { status: 404 });
    }

    const memberIdStr = memberComputerId.toString();
    const registrations = await prisma.eventRegistration.findMany({
      where: { memberId: memberIdStr },
      include: {
        event: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}