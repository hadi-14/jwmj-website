import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [total, admins, members, users, recentUsers] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Admin count
      prisma.user.count({ where: { role: 'ADMIN' } }),
      
      // Member count
      prisma.user.count({ where: { role: 'MEMBER' } }),
      
      // Regular users
      prisma.user.count({ where: { role: 'USER' } }),
      
      // Recent users (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        total,
        byRole: {
          admins,
          members,
          users,
        },
        recentUsers,
      },
    });
  } catch (error) {
    console.error('GET /api/users/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}