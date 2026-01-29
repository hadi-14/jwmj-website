// src/lib/memberHelpers.ts
import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/client';

/**
 * Get member ID by email address
 * Note: SQL Server default collation is typically case-insensitive,
 * so we don't need special handling for case sensitivity
 */
export async function getMemberIdByEmail(email: string): Promise<number | null> {
  try {
    // Trim the email and search
    const trimmedEmail = email.trim();
    
    const memberEmail = await prisma.member_Emailid.findFirst({
      where: {
        MEM_Emailid: trimmedEmail
      },
      select: {
        MEM_MemComputerID: true
      }
    });

    if (!memberEmail) {
      // Try with raw query for case-insensitive search with NCHAR trimming
      const result = await prisma.$queryRaw<Array<{ MEM_MemComputerID: Decimal }>>`
        SELECT TOP 1 MEM_MemComputerID 
        FROM Member_Emailid 
        WHERE LOWER(LTRIM(RTRIM(MEM_Emailid))) = LOWER(${trimmedEmail})
      `;

      if (result.length === 0) {
        return null;
      }

      return Number(result[0].MEM_MemComputerID);
    }

    return Number(memberEmail.MEM_MemComputerID);
  } catch (error) {
    console.error('Error fetching member ID by email:', error);
    return null;
  }
}

/**
 * Convert Decimal to number safely
 */
function toNumber(value: Decimal): number {
  return Number(value.toString());
}

/**
 * Verify if member exists and is active
 */
export async function verifyMemberExists(memberComputerId: number): Promise<boolean> {
  try {
    const member = await prisma.member_Information.findFirst({
      where: {
        MemComputerID: new Decimal(memberComputerId),
        OR: [
          { Mem_DeActive: null },
          { Mem_DeActive: false }
        ]
      },
      select: {
        MemComputerID: true
      }
    });

    return member !== null;
  } catch (error) {
    console.error('Error verifying member exists:', error);
    return false;
  }
}

/**
 * Extract member ID from JWT payload
 * Checks both memberData object and email fallback
 */
export async function getMemberIdFromPayload(payload: any): Promise<number | null> {
  // First check if memberData exists and has MemComputerID
  if (payload.memberData?.MemComputerID) {
    const memberId = typeof payload.memberData.MemComputerID === 'string'
      ? parseInt(payload.memberData.MemComputerID, 10)
      : payload.memberData.MemComputerID;
    
    if (!isNaN(memberId) && memberId > 0) {
      return memberId;
    }
  }

  // Fallback: try to find member by email
  if (payload.email && typeof payload.email === 'string') {
    const memberIdFromEmail = await getMemberIdByEmail(payload.email);
    if (memberIdFromEmail) {
      return memberIdFromEmail;
    }
  }

  console.error('Could not extract member ID from payload:', {
    hasMemberData: !!payload.memberData,
    hasEmail: !!payload.email,
    memberDataKeys: payload.memberData ? Object.keys(payload.memberData) : []
  });

  return null;
}

/**
 * Get member basic info by computer ID
 */
export async function getMemberBasicInfo(memberComputerId: number) {
  try {
    const member = await prisma.member_Information.findUnique({
      where: { MemComputerID: new Decimal(memberComputerId) },
      select: {
        MemComputerID: true,
        MemWehvariaNo: true,
        MemMembershipNo: true,
        MemName: true,
        MemFatherName: true,
        MemCNIC: true,
        MemDOB: true,
        Mem_DeActive: true,
        Mem_DeceasedDate: true,
        emails: {
          take: 1,
          select: {
            MEM_Emailid: true
          }
        }
      }
    });

    if (!member) {
      return null;
    }

    return {
      MemComputerID: member.MemComputerID.toString(),
      MemWehvariaNo: member.MemWehvariaNo?.toString() || null,
      MemMembershipNo: member.MemMembershipNo?.trim() || null,
      MemName: member.MemName?.trim() || null,
      MemFatherName: member.MemFatherName?.trim() || null,
      MemCNIC: member.MemCNIC?.toString() || null,
      MemDOB: member.MemDOB?.toISOString() || null,
      email: member.emails[0]?.MEM_Emailid?.trim() || null,
      isActive: !member.Mem_DeActive,
      isDeceased: member.Mem_DeceasedDate !== null
    };
  } catch (error) {
    console.error('Error fetching member basic info:', error);
    return null;
  }
}

/**
 * Check if email exists in the system
 */
export async function emailExists(email: string): Promise<boolean> {
  try {
    const trimmedEmail = email.trim();
    
    const count = await prisma.member_Emailid.count({
      where: {
        MEM_Emailid: trimmedEmail
      }
    });

    if (count > 0) {
      return true;
    }

    // Fallback with case-insensitive check
    const result = await prisma.$queryRaw<Array<{ cnt: number }>>`
      SELECT COUNT(*) as cnt
      FROM Member_Emailid 
      WHERE LOWER(LTRIM(RTRIM(MEM_Emailid))) = LOWER(${trimmedEmail})
    `;

    return result[0]?.cnt > 0;
  } catch (error) {
    console.error('Error checking email exists:', error);
    return false;
  }
}