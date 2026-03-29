import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// SECURITY: Never use fallback secrets in production
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!');
}

export interface AuthUser {
  userId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'USER';
  name?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Verify JWT token and return user data
 * Used for route handlers that need to check authentication
 */
export async function verifyAuth(): Promise<AuthResult> {
  try {
    if (!JWT_SECRET) {
      return { success: false, error: 'Server configuration error' };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: {
        userId: user.id,
        email: user.email,
        role: user.role as 'ADMIN' | 'MEMBER' | 'USER',
        name: user.name || undefined,
      },
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Token expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token' };
    }
    console.error('Auth verification error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Require authentication for a route
 * Returns 401 if not authenticated
 */
export async function requireAuth(): Promise<{ user: AuthUser } | NextResponse> {
  const auth = await verifyAuth();

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Not authenticated' },
      { status: 401 }
    );
  }

  return { user: auth.user };
}

/**
 * Require admin role for a route
 * Returns 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(): Promise<{ user: AuthUser } | NextResponse> {
  const auth = await verifyAuth();

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Not authenticated' },
      { status: 401 }
    );
  }

  if (auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 }
    );
  }

  return { user: auth.user };
}

/**
 * Require member or admin role for a route
 */
export async function requireMember(): Promise<{ user: AuthUser } | NextResponse> {
  const auth = await verifyAuth();

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { success: false, error: auth.error || 'Not authenticated' },
      { status: 401 }
    );
  }

  if (auth.user.role !== 'MEMBER' && auth.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Member access required' },
      { status: 403 }
    );
  }

  return { user: auth.user };
}

/**
 * Rate limiting store (in-memory for simplicity, use Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param limit - Max requests per window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetIn: record.resetTime - now };
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const result = checkRateLimit(ip, limit, windowMs);

  if (!result.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(result.resetIn / 1000)),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetIn / 1000)),
        }
      }
    );
  }

  return null;
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();

  if (!emailRegex.test(trimmed) || trimmed.length > 254) {
    return null;
  }

  return trimmed;
}

/**
 * Create JWT token for user
 */
export function createToken(user: { id: string; email: string; role: string }): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Set auth cookie with secure options
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear auth cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * Log security event for audit trail
 */
export async function logSecurityEvent(
  _event: string,
  _userId: string | null,
  _details: Record<string, unknown>,
  _request: NextRequest
): Promise<void> {
  try {
    // const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    //            request.headers.get('x-real-ip') ||
    //            'unknown';

    // await prisma.auditLog.create({
    //   data: {
    //     action: event,
    //     userId: userId || 'anonymous',
    //     ipAddress: ip,
    //     userAgent: request.headers.get('user-agent') || 'unknown',
    //     details: JSON.stringify(details),
    //   },
    // });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
