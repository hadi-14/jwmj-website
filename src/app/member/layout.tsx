'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// ==================== MEMBER AUTH CONTEXT & PROVIDER ====================

interface MemberAuthContextType {
  member: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export const useMemberAuth = () => {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider');
  }
  return context;
};

export function MemberAuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Check if user is a member
        if (data.user && data.user.role === 'MEMBER') {
          setMember(data.user);
        } else {
          setMember(null);
        }
      } else {
        setMember(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'MEMBER' }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setMember(data.user);
      router.push('/member');
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setMember(null);
      router.push('/member/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        login,
        logout,
        isLoading,
        isAuthenticated: !!member,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
}

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