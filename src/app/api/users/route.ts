import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAdmin, sanitizeInput, sanitizeEmail, applyRateLimit } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);

    // Pagination with limits
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    // Filters with sanitization
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const sortBy = ['createdAt', 'email', 'name', 'role'].includes(searchParams.get('sortBy') || '') 
      ? searchParams.get('sortBy') 
      : 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // Build where clause
    const where: {
      role?: string;
      OR?: Array<{ name?: { contains: string }; email?: { contains: string } }>;
    } = {};

    if (role && ['ADMIN', 'USER', 'MEMBER'].includes(role)) {
      where.role = role;
    }

    if (search) {
      const sanitizedSearch = sanitizeInput(search);
      where.OR = [
        { name: { contains: sanitizedSearch } },
        { email: { contains: sanitizedSearch } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude password
      },
      orderBy: { [sortBy!]: sortOrder },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitResponse = applyRateLimit(request, 10, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    // Require admin authentication
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { email, name, password, role = 'USER' } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['ADMIN', 'USER', 'MEMBER'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with strong cost factor
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: name ? sanitizeInput(name) : null,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'User created successfully',
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
