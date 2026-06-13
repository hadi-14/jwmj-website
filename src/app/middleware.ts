import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { PAGE_ACCESS, VALID_ROLES } from '@/lib/roles';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login pages
  if (pathname === '/admin/login' || pathname === '/member/login') {
    return NextResponse.next();
  }

  const secret = new TextEncoder().encode(JWT_SECRET);

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      // Validate role is one of the valid roles
      if (!VALID_ROLES.includes(role as any)) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      // Check if role has access to admin routes
      let allowedPages: string[] = [];

      if (role === 'MANAGER') {
        // For managers, use custom assigned pages from JWT
        const managerPages = payload.managerPages as string[] | undefined;
        allowedPages = managerPages && Array.isArray(managerPages) ? managerPages : [];
      } else {
        // For other roles, use default PAGE_ACCESS
        allowedPages = PAGE_ACCESS[role as any] || [];
      }

      const hasAccess = allowedPages?.some(page => pathname.startsWith(page));

      if (!hasAccess) {
        // Redirect users without admin access to appropriate portal
        if (role === 'MEMBER') {
          return NextResponse.redirect(new URL('/member/login', request.url));
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect all /member routes
  if (pathname.startsWith('/member')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/member/login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      // Validate role is one of the valid roles
      if (!VALID_ROLES.includes(role as any)) {
        return NextResponse.redirect(new URL('/member/login', request.url));
      }

      // Allow MEMBER role, redirect others
      if (role !== 'MEMBER') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/member/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*'],
};