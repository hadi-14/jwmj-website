import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Get submission statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');

    const where: any = { isDeleted: false };
    if (formId) where.formId = formId;

    const stats = await prisma.formSubmission.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    const total = await prisma.formSubmission.count({ where });

    const recentSubmissions = await prisma.formSubmission.findMany({
      where,
      select: { id: true, submissionDate: true, status: true },
      orderBy: { submissionDate: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSubmissions: total,
        byStatus: stats.reduce((acc, s) => {
          acc[s.status] = s._count;
          return acc;
        }, {} as Record<string, number>),
        recentSubmissions
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
