import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, logSecurityEvent } from '@/lib/auth';

// Validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action, userIds, data } = body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Validate all user IDs are valid UUIDs
    if (!userIds.every(isValidUUID)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Limit bulk operations to prevent abuse
    if (userIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Maximum 100 users can be processed at once' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (action === 'delete' && userIds.includes(authResult.user.userId)) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'delete':
        result = await prisma.user.deleteMany({
          where: { id: { in: userIds } },
        });
        await logSecurityEvent('BULK_DELETE_USERS', authResult.user.userId, { 
          count: userIds.length,
          userIds 
        }, request);
        break;

      case 'update-role':
        if (!data?.role || !['ADMIN', 'USER', 'MEMBER'].includes(data.role)) {
          return NextResponse.json(
            { success: false, error: 'Valid role is required for bulk update' },
            { status: 400 }
          );
        }
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: data.role },
        });
        await logSecurityEvent('BULK_UPDATE_ROLE', authResult.user.userId, { 
          count: userIds.length,
          newRole: data.role 
        }, request);
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk ${action} completed successfully`,
    });
  } catch (error: unknown) {
    console.error('POST /api/users/bulk error:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}
