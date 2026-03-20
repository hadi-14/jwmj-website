import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { 
  createToken, 
  setAuthCookie, 
  applyRateLimit, 
  sanitizeEmail,
  logSecurityEvent 
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per minute per IP for login
    const rateLimitResponse = applyRateLimit(request, 5, 60000);
    if (rateLimitResponse) {
      await logSecurityEvent('LOGIN_RATE_LIMITED', null, {}, request);
      return rateLimitResponse;
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
      },
    });

    // Use constant-time comparison to prevent timing attacks
    // Even if user doesn't exist, still do password comparison
    const storedHash = user?.password || '$2a$10$invalidhashforsecuritypurposes';
    const isValidPassword = await bcrypt.compare(password, storedHash);

    if (!user || !isValidPassword) {
      await logSecurityEvent('LOGIN_FAILED', null, { email: sanitizedEmail }, request);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createToken(user);

    // Set secure cookie
    await setAuthCookie(token);

    // Log successful login
    await logSecurityEvent('LOGIN_SUCCESS', user.id, {}, request);

    // Return user data (without password)
    const { password: _password, ...userWithoutPassword } = user;
    void _password;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
