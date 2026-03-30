'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './AuthContext';
import { NotificationProvider } from '@/components/Notification';
import MobileNav from '@/components/MobileNav';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  X,
  ChevronDown,
  Database,
  ChevronRight,
  Settings,
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

// ==================== PROTECTED ROUTE ====================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-[#038DCD]/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-[#038DCD] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== '/admin/login') return null;
  return <>{children}</>;
}

// ==================== NAV CONFIG ====================

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Form Builder', href: '/admin/form-builder', icon: FileText },
  { name: 'Submissions', href: '/admin/submissions', icon: Database },
  { name: 'Events', href: '/admin/events', icon: FileText },
  { name: 'Business Ads', href: '/admin/business-ads', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// Mobile nav items (limited to 5, rest go to More)
const mobileNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Members', href: '/admin/members', icon: Users },
  { name: 'Submissions', href: '/admin/submissions', icon: Database },
  { name: 'Events', href: '/admin/events', icon: FileText },
  { name: 'More', href: '#more', icon: MoreHorizontal },
];

// ==================== SIDEBAR ====================

// Height of the public site header (ticker + navbar). Adjust if yours differs.
const SITE_HEADER_HEIGHT = 104;

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => {
      const offset = Math.max(0, SITE_HEADER_HEIGHT - window.scrollY);
      if (sidebarRef.current) {
        sidebarRef.current.style.top = `${offset}px`;
        sidebarRef.current.style.height = `calc(100vh - ${offset}px)`;
      }
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 
        IMPORTANT: The public site has a ticker bar (~32px) + navbar (~72px) = ~104px total.
        The sidebar must start below that. Adjust SITE_HEADER_HEIGHT if your header differs.
      */}
      <aside
        ref={sidebarRef}
        className={`
          fixed left-0 z-40 flex flex-col
          bg-white border-r border-slate-200
          transition-transform duration-300 ease-in-out
          ${collapsed ? 'w-18' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          top: `${Math.max(0, SITE_HEADER_HEIGHT - (typeof window !== 'undefined' ? window.scrollY : 0))}px`,
          height: `calc(100vh - ${Math.max(0, SITE_HEADER_HEIGHT - (typeof window !== 'undefined' ? window.scrollY : 0))}px)`,
          boxShadow: '2px 0 16px rgba(0,0,0,0.05)'
        }}
      >
        {/* Sidebar top bar — collapse toggle + mobile close */}
        <div className={`h-16 flex items-center border-b-2 border-slate-200 shrink-0 ${collapsed ? 'justify-center' : 'justify-between px-5 sm:px-6'}`}>
          {!collapsed && (
            <span className="font-bold text-lg text-slate-900">Admin Panel</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              hidden lg:flex items-center justify-center w-6 h-6 rounded-lg
              text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all
              ${collapsed ? 'absolute -right-3 top-3 bg-white border border-slate-200 shadow-sm' : ''}
            `}
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
          {!collapsed && (
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User card */}
        {!collapsed ? (
          <div className="p-4 border-b-2 border-slate-200 shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-amber-50 hover:from-blue-100 hover:to-amber-100 transition-colors cursor-pointer group">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#038DCD] to-[#0260a8] flex items-center justify-center text-white font-bold text-sm shadow">
                  {(user?.name?.[0] || 'A').toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@jwmj.com'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        ) : (
          <div className="py-3 border-b-2 border-slate-200 shrink-0 flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#038DCD] to-[#0260a8] flex items-center justify-center text-white font-bold text-sm shadow">
                {(user?.name?.[0] || 'A').toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {!collapsed && (
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 pb-3 pt-2">
              Menu
            </p>
          )}

          {navigation.map((item) => {
            const Icon = item.icon;
            // Dashboard should only be active on exact /admin path, not /admin/form-builder etc
            const isActive = item.href === '/admin'
              ? pathname === '/admin' || pathname === '/admin/'
              : pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                title={collapsed ? item.name : undefined}
                className={`
                  relative flex items-center gap-3 rounded-xl text-sm font-semibold
                  transition-all duration-150 group
                  ${collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'}
                  ${isActive
                    ? 'bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`shrink-0 w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />

                {!collapsed && <span>{item.name}</span>}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="
                    absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium
                    rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                    shadow-xl z-50 translate-x-1 group-hover:translate-x-0 transition-all duration-150
                  ">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout - Sticky */}
        <div className="sticky bottom-0 p-4 border-t-2 border-slate-200 shrink-0 bg-white">
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              w-full flex items-center gap-3 rounded-xl text-sm font-semibold
              text-rose-700 hover:bg-rose-50
              transition-all duration-150 group relative
              ${collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'}
            `}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}

            {collapsed && (
              <span className="
                absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-medium
                rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap
                shadow-xl z-50 translate-x-1 group-hover:translate-x-0 transition-all duration-150
              ">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

// ==================== LAYOUT ====================
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();
  useAuth();

  useEffect(() => {
    setSidebarOpen(false);
    setMobileMoreOpen(false);
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden h-16 bg-white border-b-2 border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <span className="font-bold text-slate-900">Admin Panel</span>
            <div className="w-10" /> {/* Spacer for alignment */}
          </header>

          <div className="flex-1 flex flex-col">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {/* Offset content by sidebar width on desktop */}
            <div className="lg:pl-64 transition-all duration-300 flex-1 flex flex-col">
              <main className="p-3 sm:p-4 lg:p-8 flex-1 pb-20 lg:pb-8">
                {children}
              </main>
              
              {/* More Options Modal for Mobile */}
              {mobileMoreOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setMobileMoreOpen(false)} />
              )}
              {mobileMoreOpen && (
                <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 lg:hidden max-w-xs">
                  <div className="flex flex-col divide-y divide-slate-100">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMoreOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            isActive
                              ? 'bg-[#038DCD]/10 text-[#038DCD]'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        logout();
                        setMobileMoreOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-rose-700 hover:bg-rose-50 transition-colors w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileNav
            items={mobileNavItems}
            onMoreClick={() => setMobileMoreOpen(true)}
            onLogout={logout}
            theme="admin"
            showLogout={false}
          />
        </div>
      </ProtectedRoute>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </NotificationProvider>
    </AuthProvider>
  );
}