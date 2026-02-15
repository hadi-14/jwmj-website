import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch audit logs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId');
    const action = searchParams.get('action');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const where: { submissionId?: string; action?: string } = {};
    if (submissionId) where.submissionId = submissionId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.formAuditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.formAuditLog.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}