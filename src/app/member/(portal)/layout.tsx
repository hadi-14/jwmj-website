'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MemberAuthProvider, useMemberAuth } from '@/contexts/MemberAuthContext';
import { NotificationProvider } from '@/components/Notification';
import Sidebar from '@/components/Sidebar';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Receipt,
  FileText,
  Briefcase,
  Menu,
  User
} from 'lucide-react';

// Protected Route Component
function ProtectedMemberRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useMemberAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/member/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-blue-50 via-background to-primary-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-foreground-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Sidebar Component
const sidebarItems = [
  { name: 'Dashboard', href: '/member', icon: LayoutDashboard },
  { name: 'Events', href: '/member/events', icon: Calendar },
  { name: 'Family Tree', href: '/member/family', icon: Users },
  { name: 'Fee Status', href: '/member/fees', icon: Receipt },
  { name: 'Applications', href: '/member/applications', icon: FileText },
  { name: 'Business Ads', href: '/member/business-ads', icon: Briefcase },
];

function SidebarWrapper({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { member, logout } = useMemberAuth();

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      title="Member Portal"
      items={sidebarItems}
      user={member ? { name: member.name, email: member.email } : null}
      onLogout={logout}
      theme="member"
    />
  );
}

// Header Component
function Header({ onMenuClick, member }: { onMenuClick: () => void; member: { name?: string } | null }) {
  return (
    <header className="h-16 bg-background border-b-2 border-primary-silver-400 sticky top-0 z-20">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-primary-silver-200 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="JWMJ Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-bold text-foreground hidden sm:block">Member Portal</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground-300 hidden sm:block">
            Welcome, <span className="font-semibold text-foreground">{member?.name?.split(' ')[0] || 'Member'}</span>
          </span>
          <div className="w-9 h-9 bg-gradient-to-br from-primary-blue to-accent-navy rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

// Bottom Navigation Component (Mobile)
function BottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  const pathname = usePathname();

  const bottomNavigation = [
    { name: 'Home', href: '/member', icon: LayoutDashboard },
    { name: 'Events', href: '/member/events', icon: Calendar },
    { name: 'Family', href: '/member/family', icon: Users },
    { name: 'Fees', href: '/member/fees', icon: Receipt },
    { name: 'More', href: '#more', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-primary-silver-400 lg:hidden z-20 pb-safe">
      <ul className="flex items-center justify-around h-16">
        {bottomNavigation.map((item) => {
          const Icon = item.icon;
          const isMore = item.href === '#more';
          const isActive = !isMore && (
            pathname === item.href ||
            (item.href !== '/member' && pathname?.startsWith(item.href))
          );

          if (isMore) {
            return (
              <li key={item.name}>
                <button
                  onClick={onMoreClick}
                  className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-foreground-300"
                  aria-label="More options"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${isActive
                  ? 'text-primary-blue'
                  : 'text-foreground-300 hover:text-foreground'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Main Member Portal Layout
function MemberPortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { member } = useMemberAuth();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-blue-50/30 via-background to-primary-yellow-50/30 flex flex-col lg:flex-row">
      <SidebarWrapper isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} member={member} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-auto">
          {children}
        </main>
      </div>

      <BottomNav onMoreClick={() => setSidebarOpen(true)} />
    </div>
  );
}

// Export the layout
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberAuthProvider>
      <NotificationProvider>
        <ProtectedMemberRoute>
          <MemberPortalLayout>
            {children}
          </MemberPortalLayout>
        </ProtectedMemberRoute>
      </NotificationProvider>
    </MemberAuthProvider>
  );
}
