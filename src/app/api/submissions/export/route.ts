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
      .map(sub => sub.memberComputerId)
      .filter((id) => id !== null && id !== undefined);

    const memberMap = new Map();
    if (memberIds.length > 0) {
      const members = await prisma.member_Information.findMany({
        where: {
          MemComputerID: { in: memberIds }
        },
        select: {
          MemComputerID: true,
          MemWehvariaNo: true
        }
      });
      members.forEach(m => {
        memberMap.set(m.MemComputerID.toString(), m.MemWehvariaNo?.toString() || '');
      });
    }

    const headers = [
      'ID',
      'Form Name',
      'Status',
      'Submitted Date',
      'Submitted By',
      'Member Wehvaria Card No.',
      ...submissions[0].fieldValues.map(fv => fv.field.fieldLabel)
    ];

    const rows = submissions.map(sub => [
      sub.id,
      sub.form.name,
      sub.status,
      new Date(sub.submissionDate).toLocaleString(),
      sub.submittedBy,
      memberMap.get(sub.memberComputerId?.toString() || '') || '',
      ...submissions[0].fieldValues.map(fv =>
        sub.fieldValues.find(fv2 => fv2.fieldId === fv.fieldId)?.value || ''
      )
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
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
