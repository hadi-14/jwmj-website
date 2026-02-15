// app/api/member/route.ts
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getMemberIdFromPayload, verifyMemberExists } from '@/lib/memberHelpers';
import { Decimal } from '@prisma/client/runtime/client';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Helper to safely convert Decimal to string
 */
function toStr(value: Decimal | null | undefined): string | null {
  return value ? value.toString() : null;
}

/**
 * Helper to safely trim NCHAR strings
 */
function trimStr(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

/**
 * Helper to convert Buffer/Bytes to base64 data URL
 */
function bufferToBase64Image(buffer: Buffer | null | undefined): string | null {
  if (!buffer || buffer.length === 0) {
    return null;
  }

  try {
    const base64 = buffer.toString('base64');
    // Assume JPEG format - adjust if your images are different
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Verify authentication
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

    // Verify member exists and is active
    const memberExists = await verifyMemberExists(memberComputerId);
    if (!memberExists) {
      return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
    }

    // Fetch complete member information including profile picture
    const member = await prisma.member_Information.findUnique({
      where: { MemComputerID: memberComputerId },
      include: {
        maritalStatus: {
          orderBy: { MMr_StatusDate: 'desc' },
          take: 1,
          include: {
            maritalStatus: true,
          },
        },
        occupations: {
          orderBy: { MOc_statusDate: 'desc' },
          take: 1,
          include: {
            occupation: true,
          },
        },
        qualifications: {
          orderBy: { MQu_StatusDate: 'desc' },
          take: 1,
          include: {
            qualification: true,
          },
        },
        statuses: {
          orderBy: { Mst_CreationDate: 'desc' },
          take: 1,
          include: {
            status: true,
          },
        },
        emails: {
          take: 1,
        },
        cellNumbers: {
          take: 5,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Parallel fetch for better performance
    const [surname, gender, area, country] = await Promise.all([
      member.MemSurNameCode
        ? prisma.surName_L.findUnique({ where: { SurCode: member.MemSurNameCode } })
        : Promise.resolve(null),
      member.MemGenderCode
        ? prisma.gender_L.findUnique({ where: { GndCode: member.MemGenderCode } })
        : Promise.resolve(null),
      member.MemAreaCode
        ? prisma.area_L.findUnique({ where: { AreCode: member.MemAreaCode } })
        : Promise.resolve(null),
      member.MemCountryCode
        ? prisma.country_L.findUnique({ where: { CtrCode: member.MemCountryCode } })
        : Promise.resolve(null),
    ]);

    // Convert profile picture to base64 if available
    const profileImage = bufferToBase64Image(member.Mem_Pic ? Buffer.from(member.Mem_Pic) : null);

    // Format member data
    const memberData = {
      // Basic Information
      MemComputerID: toStr(member.MemComputerID),
      MemWehvariaNo: toStr(member.MemWehvariaNo),
      MemMembershipNo: trimStr(member.MemMembershipNo),
      MemName: trimStr(member.MemName),
      MemFatherName: trimStr(member.MemFatherName),
      MemMotherName: trimStr(member.MemMotherName),

      // Identification
      MemCNIC: toStr(member.MemCNIC),
      MemDOB: member.MemDOB?.toISOString() || null,
      MemRegistrationDate: member.MemRegistrationDate?.toISOString() || null,
      MemComputerDate: member.MemComputerDate?.toISOString() || null,

      // Contact Information
      MemPostalAddress: trimStr(member.MemPostalAddress),
      email: member.emails[0]?.MEM_Emailid?.trim() || (typeof payload.email === 'string' ? payload.email : null),
      cellNumbers: member.cellNumbers.map(cell => toStr(cell.MCL_CellNumber)).filter(Boolean) as string[],

      // Profile Image
      profileImage: profileImage,
      hasProfileImage: profileImage !== null,

      // Lookup Values
      surname: trimStr(surname?.surName),
      surnameNick: trimStr(surname?.surNick),
      gender: trimStr(gender?.GndName),
      area: trimStr(area?.AreName),
      country: trimStr(country?.CtrName),

      // Current Status Information
      maritalStatus: trimStr(member.maritalStatus[0]?.maritalStatus?.MrtName),
      occupation: trimStr(member.occupations[0]?.occupation?.OccName),
      qualification: trimStr(member.qualifications[0]?.qualification?.QuaName),
      memberStatus: trimStr(member.statuses[0]?.status?.Sts_Name),

      // Additional Information
      remarks: trimStr(member.Remarks),
      isDeceased: member.Mem_DeceasedDate !== null,
      deceasedDate: member.Mem_DeceasedDate?.toISOString() || null,
      deceasedDetails: trimStr(member.Mem_DeceasedDetails),
      isDeActive: member.Mem_DeActive || false,
      deActiveDate: member.Mem_DeActive_Date?.toISOString() || null,
      deActiveDetails: trimStr(member.Mem_DeActive_Details),

      // Flags
      deathCertificateRequired: member.Mem_Dth_Cert_Req === 1,
    };

    return NextResponse.json(memberData);
  } catch (error) {
    console.error('Member info error:', error);

    if (error instanceof Error) {
      if (error.message.includes('verification')) {
        return NextResponse.json(
          { error: 'Token verification failed' },
          { status: 401 }
        );
      }

      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(
      { error: 'An error occurred while searching members' },
      { status: 500 }
    );
  }
}