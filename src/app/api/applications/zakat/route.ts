import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const membershipNumber = searchParams.get('membershipNumber');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get single application by ID
    if (id) {
      const application = await prisma.zakatApplication.findUnique({
        where: { id },
      });

      if (!application) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: application,
      });
    }

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (membershipNumber) {
      where.membershipNumber = membershipNumber;
    }

    // Get paginated applications
    const [applications, total] = await Promise.all([
      prisma.zakatApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.zakatApplication.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching zakat applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch applications',
      },
      { status: 500 }
    );
  }
}