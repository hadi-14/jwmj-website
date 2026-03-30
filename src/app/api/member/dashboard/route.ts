// app/api/member/dashboard/route.ts
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
function toStr(value: Decimal | string | number | null | undefined): string | null {
    if (value instanceof Decimal) {
        return value.toString();
    }
    return value ? String(value) : null;
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
function bufferToBase64Image(buffer: Buffer | Uint8Array | null | undefined): string | null {
    if (!buffer || buffer.length === 0) return null;

    try {
        let realBuffer: Buffer;
        if (buffer instanceof Uint8Array && !(buffer instanceof Buffer)) {
            realBuffer = Buffer.from(buffer);
        } else {
            const hexString = buffer.toString('ascii');
            realBuffer = Buffer.from(hexString, 'hex');
        }

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

        // Require member authentication
        const authResult = await requireMember();
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        // Get member ID from token
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token');

        if (!token || !JWT_SECRET) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const payload = jwt.verify(token.value, JWT_SECRET) as {
            memberData?: { MemComputerID?: string | number };
            email?: string
        };

        const memberComputerId = await getMemberIdFromPayload(payload);

        if (!memberComputerId) {
            return NextResponse.json({ error: 'Member data not found' }, { status: 404 });
        }

        // Verify member exists and is active
        const memberExists = await verifyMemberExists(memberComputerId);
        if (!memberExists) {
            return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
        }

        // Fetch complete member information with all relations
        const member = await prisma.member_Information.findUnique({
            where: { MemComputerID: memberComputerId },
            include: {
                cellNumbers: {
                    take: 5,
                },
                emails: {
                    take: 1,
                },
                maritalStatus: {
                    orderBy: { MMr_StatusDate: 'desc' },
                    take: 1,
                    include: { maritalStatus: true },
                },
                occupations: {
                    orderBy: { MOc_statusDate: 'desc' },
                    take: 1,
                    include: { occupation: true },
                },
                qualifications: {
                    orderBy: { MQu_StatusDate: 'desc' },
                    take: 1,
                    include: { qualification: true },
                },
                statuses: {
                    orderBy: { Mst_CreationDate: 'desc' },
                    take: 1,
                    include: { status: true },
                },
            },
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Get lookup data for surname, gender, area
        const [surname, gender, area] = await Promise.all([
            member.MemSurNameCode
                ? prisma.surName_L.findUnique({ where: { SurCode: member.MemSurNameCode } })
                : Promise.resolve(null),
            member.MemGenderCode
                ? prisma.gender_L.findUnique({ where: { GndCode: member.MemGenderCode } })
                : Promise.resolve(null),
            member.MemAreaCode
                ? prisma.area_L.findUnique({ where: { AreCode: member.MemAreaCode } })
                : Promise.resolve(null),
        ]);

        // Convert profile picture to base64 if available - SAME LOGIC AS /api/member
        const profileImage = bufferToBase64Image(member.Mem_Pic ? Buffer.from(member.Mem_Pic) : null);

        // Fetch fee data
        const [annualFees, feeReceipts] = await Promise.all([
            prisma.member_AnnualFee.findMany({
                where: { RFE_MemberID: memberComputerId },
                select: {
                    RFE_Fee: true,
                    RFE_FiscalYear: true,
                },
                orderBy: { RFE_FiscalYear: 'desc' },
            }),
            prisma.annual_Fee_Receive_M.findMany({
                where: { ARM_MemberID: memberComputerId },
                select: {
                    ARM_Amount: true,
                    ARM_Disc: true,
                    ARM_Receive_Date: true,
                },
                orderBy: { ARM_Receive_Date: 'desc' },
            }),
        ]);

        // Fetch family data - spouse in both directions, children as father/mother, parents as member
        const [spouses, spousesAsPartner, fatherChildren, motherChildren, parents] = await Promise.all([
            // Where this member is listed as primary spouse
            prisma.spouse_List.findMany({
                where: { Spu_MemberId: memberComputerId },
                select: { Spu_WehvariaNo: true },
            }),
            // Where this member might be listed as the spouse ID (other direction)
            prisma.spouse_List.findMany({
                where: { Spu_WehvariaNo: memberComputerId },
                select: { Spu_MemberId: true },
            }),
            // Get children where this member is the father
            prisma.children_List.findMany({
                where: { Chd_FatherMemberID: memberComputerId },
                select: { Chd_WehvariaNo: true },
            }),
            // Get children where this member is the mother
            prisma.children_List.findMany({
                where: { Chd_MotherMemberID: memberComputerId },
                select: { Chd_WehvariaNo: true },
            }),
            prisma.parents_List.findMany({
                where: { Par_MemberID: memberComputerId },
                select: { Par_MemberID: true },
            }),
        ]);

        // Combine spouse records and remove duplicates
        const uniqueSpouses = new Set<string>();
        spouses.forEach((s: { Spu_WehvariaNo: Decimal }) => {
            if (s.Spu_WehvariaNo) {
                uniqueSpouses.add(s.Spu_WehvariaNo.toString());
            }
        });
        spousesAsPartner.forEach((s: { Spu_MemberId: Decimal }) => {
            if (s.Spu_MemberId) {
                uniqueSpouses.add(s.Spu_MemberId.toString());
            }
        });
        const uniqueSpouseCount = uniqueSpouses.size;

        // Debug logging
        console.log(`Family data for member ${memberComputerId}:`, {
            spousesCount: uniqueSpouseCount,
            fatherChildrenCount: fatherChildren.length,
            motherChildrenCount: motherChildren.length,
            parentsCount: parents.length,
        });

        // Fetch applications
        const applications = await prisma.formSubmission.findMany({
            where: {
                memberComputerId: memberComputerId
            },
            select: {
                id: true,
                status: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate fee summary
        const totalDue = annualFees.reduce((sum, fee) =>
            sum + (fee.RFE_Fee ? Number(fee.RFE_Fee) : 0), 0
        );

        const totalPaid = feeReceipts.reduce((sum, receipt) =>
            sum + (receipt.ARM_Amount ? Number(receipt.ARM_Amount) : 0), 0
        );

        const totalDiscount = feeReceipts.reduce((sum, receipt) =>
            sum + (receipt.ARM_Disc ? Number(receipt.ARM_Disc) : 0), 0
        );

        const balance = totalDue - totalPaid - totalDiscount;

        // Return consolidated dashboard data
        return NextResponse.json({
            member: {
                MemComputerID: toStr(member.MemComputerID),
                MemMembershipNo: trimStr(member.MemMembershipNo),
                MemName: trimStr(member.MemName),
                MemFatherName: trimStr(member.MemFatherName),
                MemCNIC: member.MemCNIC ? trimStr(member.MemCNIC.toString()) : null,
                MemDOB: member.MemDOB,
                MemRegistrationDate: member.MemRegistrationDate,
                email: member.emails[0]?.MEM_Emailid?.trim() || (typeof payload.email === 'string' ? payload.email : null),
                cellNumbers: (member.cellNumbers.map(cell => toStr(cell.MCL_CellNumber)) as (string | null)[]).filter(Boolean) as string[],
                surname: trimStr(surname?.surName),
                gender: trimStr(gender?.GndName),
                area: trimStr(area?.AreName),
                profileImage,
            },
            fees: {
                summary: {
                    totalDue,
                    totalPaid,
                    totalDiscount,
                    balance,
                    status: balance <= 0 ? 'Paid' : 'Pending',
                },
            },
            family: {
                spouse: uniqueSpouseCount,
                children: fatherChildren.length + motherChildren.length,
                parents: parents.length,
                total: uniqueSpouseCount + fatherChildren.length + motherChildren.length + parents.length,
            },
            applications: applications.map(app => ({
                id: app.id,
                status: app.status || 'pending',
            })),
        }, {
            headers: {
                'Cache-Control': 'private, max-age=60',
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}
