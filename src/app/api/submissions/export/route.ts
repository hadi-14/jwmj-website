import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Export submissions as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const formId = searchParams.get('formId');
    const memberId = searchParams.get('memberId');

    const where: { isDeleted: boolean; formId?: string; status?: string; memberId?: string } = { isDeleted: false };
    if (formId) where.formId = formId;
    if (status) where.status = status;
    if (memberId) where.memberId = memberId;

    const submissions = await prisma.formSubmission.findMany({
      where,
      include: {
        form: { select: { name: true } },
        fieldValues: {
          include: {
            field: { select: { fieldLabel: true, fieldName: true } }
          }
        }
      },
      orderBy: { submissionDate: 'desc' }
    });

    // Build CSV
    if (submissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No submissions found' },
        { status: 404 }
      );
    }

    // Fetch member details for Wehvaria card number
    const memberIds = submissions
      .map((sub) => sub.memberComputerId)
      .filter((id) => id !== null && id !== undefined)
      .map((id) => id!.toString());

    interface MemberExportInfo {
      id: string;
      wehvariaNo: string;
    }

    const memberMap = new Map<string, MemberExportInfo>();
    if (memberIds.length > 0) {
      const members = await prisma.member_Information.findMany({
        where: {
          MemComputerID: { in: memberIds }
        },
        select: {
          MemComputerID: true,
          MemMembershipNo: true,
          MemWehvariaNo: true
        }
      });
      members.forEach((m) => {
        const id = m.MemMembershipNo?.trim() || m.MemWehvariaNo?.toString() || '';
        memberMap.set(m.MemComputerID.toString(), {
          id,
          wehvariaNo: m.MemWehvariaNo?.toString() || ''
        });
      });
    }

    const submittedByEmails = submissions
      .filter((sub) => !sub.memberComputerId && sub.submittedBy)
      .map((sub) => sub.submittedBy?.trim().toLowerCase())
      .filter((email): email is string => !!email);

    const emailMap = new Map<string, MemberExportInfo>();
    if (submittedByEmails.length > 0) {
      const memberEmails = await prisma.member_Emailid.findMany({
        where: {
          MEM_Emailid: { in: submittedByEmails }
        },
        select: {
          MEM_Emailid: true,
          member: {
            select: {
              MemMembershipNo: true,
              MemWehvariaNo: true
            }
          }
        }
      });
      memberEmails.forEach((entry) => {
        const emailKey = entry.MEM_Emailid.trim().toLowerCase();
        const id = entry.member.MemMembershipNo?.trim() || entry.member.MemWehvariaNo?.toString() || '';
        if (id) {
          emailMap.set(emailKey, {
            id,
            wehvariaNo: entry.member.MemWehvariaNo?.toString() || ''
          });
        }
      });
    }

    const headers = [
      'Srno',
      'ID',
      'Form Name',
      'Status',
      'Submitted Date',
      'Submitted By',
      'Member Wehvaria Card No.',
      ...submissions[0].fieldValues.map((fv) => fv.field.fieldLabel)
    ];

    const escapeCsvCell = (value: unknown) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = submissions.map((sub, index) => {
      const emailKey = sub.submittedBy?.trim().toLowerCase();
      const identifierInfo = sub.memberComputerId
        ? memberMap.get(sub.memberComputerId.toString())
        : emailKey
          ? emailMap.get(emailKey)
          : undefined;
      const domainIdentifier = identifierInfo?.id || '';
      const wehvariaCard = identifierInfo?.wehvariaNo || '';

      return [
        index + 1,
        domainIdentifier,
        sub.form.name,
        sub.status,
        new Date(sub.submissionDate).toLocaleString(),
        sub.submittedBy,
        wehvariaCard,
        ...submissions[0].fieldValues.map((fv) =>
          sub.fieldValues.find((fv2) => fv2.fieldId === fv.fieldId)?.value || ''
        )
      ];
    });

    const csv = [
      headers.map(escapeCsvCell).join(','),
      ...rows.map(row => row.map(escapeCsvCell).join(','))
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="submissions_${Date.now()}.csv"`
      }
    });
  } catch (error: unknown) {
    console.error('Export error:', error);
    return new NextResponse('Error exporting submissions', { status: 500 });
  }
}
