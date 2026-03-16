// app/api/member/applications/route.ts
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getMemberIdFromPayload, verifyMemberExists } from '@/lib/memberHelpers';
import { Decimal } from '@prisma/client/runtime/client';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

type MemberJwtPayload = {
    role?: string;
    memberData?: { MemComputerID?: string | number };
    email?: string;
    [key: string]: unknown;
};

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token');

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        let payload: MemberJwtPayload | null = null;
        try {
            const verified = await jwtVerify<MemberJwtPayload>(token.value, JWT_SECRET);
            payload = verified.payload;
        } catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        if (payload.role !== 'MEMBER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const memberComputerId = await getMemberIdFromPayload(payload as {
            memberData?: { MemComputerID?: string | number };
            email?: string;
        });

        if (!memberComputerId) {
            return NextResponse.json({ error: 'Member data not found' }, { status: 404 });
        }

        const memberExists = await verifyMemberExists(memberComputerId);
        if (!memberExists) {
            return NextResponse.json({ error: 'Member not found or inactive' }, { status: 404 });
        }

        const submissions = await prisma.formSubmission.findMany({
            where: {
                memberComputerId: new Decimal(memberComputerId),
                isDeleted: false,
            },
            include: {
                form: {
                    select: {
                        name: true,
                        formType: true,
                    },
                },
            },
            orderBy: { submissionDate: 'desc' },
        });

        const applications = submissions.map((submission) => ({
            id: submission.id,
            formName: submission.form?.name || 'Unknown Form',
            formType: submission.form?.formType || 'Unknown',
            submissionDate: submission.submissionDate.toISOString(),
            status: submission.status,
            notes: submission.notes || '',
        }));

        return NextResponse.json({ applications });
    } catch (error) {
        console.error('GET /api/member/applications error:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching applications' },
            { status: 500 }
        );
    }
}
