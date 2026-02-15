import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Get submission statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const memberId = searchParams.get('memberId');

    const where: { formId?: string; memberComputerId?: number } = {};
    if (formId) where.formId = formId;
    if (memberId) where.memberComputerId = memberId ? Number(memberId) : undefined;

    // 1. Get total submissions count
    const totalSubmissions = await prisma.formSubmission.count({ where });

    // 2. Get status breakdown
    const statusGroups = await prisma.formSubmission.groupBy({
      by: ['status'],
      where,
      _count: {
        _all: true
      }
    });

    const byStatus = statusGroups.reduce((acc: Record<string, number>, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {});
    // 3. Get recent activity (last 5 submissions)
    const recentSubmissions = await prisma.formSubmission.findMany({
      where,
      take: 5,
      orderBy: { submissionDate: 'desc' },
      select: {
        id: true,
        submissionDate: true,
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSubmissions,
        byStatus,
        recentSubmissions
      }
    });
  } catch (error: unknown) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
