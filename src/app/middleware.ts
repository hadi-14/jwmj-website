import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page
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
      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/member/login', request.url)); // Redirect valid members to member login/dashboard if they try admin
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
      if (payload.role !== 'MEMBER') {
        // Redirect admins to admin login/dashboard if they try member routes? 
        // Or maybe admins CAN access member routes? 
        // The user said: "admin can access member and member can access admin. That a security risk fix that"
        // This implies strict separation.
        // "the admin can access member ... fix that" -> Admin should NOT access member?
        // Usually admins can see member views. But "fix that" suggests strictly separate portals.
        // I will strict enforce: Admin -> Admin, Member -> Member. 
        // If an Admin tries /member, I'll redirect them to /admin/login (or maybe /admin/dashboard ideally, but /admin/login checks auth)
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