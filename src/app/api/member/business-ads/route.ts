import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        // Get member info from database using the user ID
        const member = await prisma.member_Emailid.findFirst({
            where: { MEM_Emailid: decoded.email },
            select: {
                MEM_MemComputerID: true,
            }
        });

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Get business ad requests for this member
        const requests = await prisma.business_Ad_Request.findMany({
            where: { memberId: member.MEM_MemComputerID },
            include: {
                approvals: true
            },
            orderBy: {
                submittedAt: 'desc'
            }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Error fetching member business ads:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}