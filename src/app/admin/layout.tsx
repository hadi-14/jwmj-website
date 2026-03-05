'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from './AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  X,
  ChevronDown,
  Database,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  // { name: 'Settings', href: '/admin/settings', icon: Settings },
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
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          top: `${Math.max(0, SITE_HEADER_HEIGHT - (typeof window !== 'undefined' ? window.scrollY : 0))}px`,
          height: `calc(100vh - ${Math.max(0, SITE_HEADER_HEIGHT - (typeof window !== 'undefined' ? window.scrollY : 0))}px)`,
          boxShadow: '2px 0 16px rgba(0,0,0,0.05)'
        }}
      >
        {/* Sidebar top bar — collapse toggle + mobile close */}
        <div className={`h-12 flex items-center border-b border-slate-100 shrink-0 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {!collapsed && (
            <span className="text-[11px] font-bold text-[#038DCD] uppercase tracking-widest">Admin Panel</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              hidden lg:flex items-center justify-center w-6 h-6 rounded-lg
              text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all
              ${collapsed ? 'absolute -right-3 top-3 bg-white border border-slate-200 shadow-sm' : ''}
            `}
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
          {!collapsed && (
            <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User card */}
        {!collapsed ? (
          <div className="px-3 py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
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
          <div className="py-3 border-b border-slate-100 shrink-0 flex justify-center">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#038DCD] to-[#0260a8] flex items-center justify-center text-white font-bold text-sm shadow">
                {(user?.name?.[0] || 'A').toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          {!collapsed && (
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pb-2 pt-1">
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
                  relative flex items-center gap-3 rounded-xl text-[13.5px] font-medium
                  transition-all duration-150 group
                  ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-[#038DCD]/10 text-[#0278b0]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                {/* Active left bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#038DCD] rounded-r-full" />
                )}

                <Icon className={`shrink-0 w-[18px] h-[18px] transition-colors ${isActive ? 'text-[#038DCD]' : 'text-slate-400 group-hover:text-slate-600'}`} />

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

        {/* Logout */}
        <div className="p-2.5 border-t border-slate-100 shrink-0">
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={`
              w-full flex items-center gap-3 rounded-xl text-[13.5px] font-medium
              text-slate-500 hover:bg-rose-50 hover:text-rose-600
              transition-all duration-150 group relative
              ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
            `}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
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
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Offset content by sidebar width; public header is handled by sticky positioning */}
        <div className="lg:pl-64 transition-all duration-300">
          <main className="p-5 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}