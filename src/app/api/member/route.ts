// app/api/member/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMemberIdFromPayload, verifyMemberExists } from '@/lib/memberHelpers';
import { Decimal } from '@prisma/client/runtime/client';
import { requireMember, applyRateLimit } from '@/lib/auth';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

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
  if (!buffer || buffer.length === 0) return null;

  try {
    const hexString = buffer.toString('ascii');
    const realBuffer = Buffer.from(hexString, 'hex');

    let mimeType = 'image/jpeg';
    if (realBuffer[0] === 0x89 && realBuffer[1] === 0x50) mimeType = 'image/png';
    else if (realBuffer[0] === 0x47 && realBuffer[1] === 0x49) mimeType = 'image/gif';
    else if (realBuffer[0] === 0xFF && realBuffer[1] === 0xD8) mimeType = 'image/jpeg';

    return `data:${mimeType};base64,${realBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = applyRateLimit(request, 30, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    // Require member or admin authentication
    const authResult = await requireMember();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get full payload from token for member data
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token || !JWT_SECRET) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = jwt.verify(token.value, JWT_SECRET) as { 
      memberData?: { MemComputerID?: string | number }; 
      email?: string 
    };

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

    // Fetch complete member information
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

    // Format member data - only return non-sensitive information
    const memberData = {
      MemComputerID: toStr(member.MemComputerID),
      MemWehvariaNo: toStr(member.MemWehvariaNo),
      MemMembershipNo: trimStr(member.MemMembershipNo),
      MemName: trimStr(member.MemName),
      MemFatherName: trimStr(member.MemFatherName),
      MemMotherName: trimStr(member.MemMotherName),
      MemDOB: member.MemDOB?.toISOString() || null,
      MemRegistrationDate: member.MemRegistrationDate?.toISOString() || null,
      MemComputerDate: member.MemComputerDate?.toISOString() || null,
      MemPostalAddress: trimStr(member.MemPostalAddress),
      email: member.emails[0]?.MEM_Emailid?.trim() || (typeof payload.email === 'string' ? payload.email : null),
      cellNumbers: member.cellNumbers.map(cell => toStr(cell.MCL_CellNumber)).filter(Boolean) as string[],
      profileImage: profileImage,
      hasProfileImage: profileImage !== null,
      surname: trimStr(surname?.surName),
      surnameNick: trimStr(surname?.surNick),
      gender: trimStr(gender?.GndName),
      area: trimStr(area?.AreName),
      country: trimStr(country?.CtrName),
      maritalStatus: trimStr(member.maritalStatus[0]?.maritalStatus?.MrtName),
      occupation: trimStr(member.occupations[0]?.occupation?.OccName),
      qualification: trimStr(member.qualifications[0]?.qualification?.QuaName),
      memberStatus: trimStr(member.statuses[0]?.status?.Sts_Name),
      remarks: trimStr(member.Remarks),
      isDeceased: member.Mem_DeceasedDate !== null,
      isDeActive: member.Mem_DeActive || false,
      deathCertificateRequired: member.Mem_Dth_Cert_Req === 1,
    };

    return NextResponse.json(memberData);
  } catch (error) {
    console.error('Member info error:', error);

    if (error instanceof Error) {
      if (error.message.includes('verification') || error.message.includes('jwt')) {
        return NextResponse.json(
          { error: 'Token verification failed' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An error occurred while fetching member data' },
      { status: 500 }
    );
  }
}
