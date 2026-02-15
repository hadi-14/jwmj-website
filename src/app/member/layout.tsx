'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MemberAuthProvider, useMemberAuth } from '@/contexts/MemberAuthContext';

// ==================== PROTECTED ROUTE ====================

function ProtectedMemberRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useMemberAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const publicRoutes = ['/member/login', '/member/register', '/member/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname || '');

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/member/login');
    }
  }, [isAuthenticated, isLoading, pathname, router, isPublicRoute]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03BDCD]/10 via-gray-50 to-[#F9D98F]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#038DCD]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access protected route, don't render
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  // If authenticated and trying to access login/register, redirect to dashboard
  if (isAuthenticated && isPublicRoute) {
    router.push('/member');
    return null;
  }

  return <>{children}</>;
}

// ==================== MAIN MEMBER LAYOUT ====================

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public routes that don't need the protected wrapper
  const publicRoutes = ['/member/login', '/member/register', '/member/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname || '');

  return (
    <MemberAuthProvider>
      {isPublicRoute ? (
        // Public pages (login, register) - render directly
        children
      ) : (
        // Protected pages - wrap with authentication check
        <ProtectedMemberRoute>
          {children}
        </ProtectedMemberRoute>
      )}
    </MemberAuthProvider>
  );
}