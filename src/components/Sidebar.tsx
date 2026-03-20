'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, ChevronRight, LogOut, LucideIcon } from 'lucide-react';

export interface SidebarItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

export interface SidebarUser {
    name?: string;
    email?: string;
}

export interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    items: SidebarItem[];
    user: SidebarUser | null;
    onLogout: () => void;
    theme?: 'member' | 'admin';
    topOffset?: boolean; // For admin layout with header
    logoIcon?: React.ReactNode; // For admin custom logo
}

// Theme configurations
const themes = {
    member: {
        bg: 'bg-background',
        border: 'border-primary-silver-400',
        overlay: 'bg-primary-black/50',
        activeGradient: 'bg-gradient-to-r from-primary-blue to-accent-navy text-primary-white',
        inactiveText: 'text-foreground-400 hover:bg-primary-silver-200 hover:text-foreground',
        userBg: 'bg-jwmj-100',
        logoutText: 'text-red-600 hover:bg-red-50',
        userIcon: 'bg-gradient-to-br from-primary-blue to-accent-navy',
        userIconText: 'text-primary-white',
    },
    admin: {
        bg: 'bg-white',
        border: 'border-slate-200',
        overlay: 'bg-black/50',
        activeGradient: 'bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white',
        inactiveText: 'text-slate-700 hover:bg-slate-100',
        userBg: 'bg-gradient-to-r from-blue-50 to-amber-50',
        logoutText: 'text-rose-700 hover:bg-rose-50',
        userIcon: 'bg-gradient-to-br from-[#038DCD] to-[#0369A1]',
        userIconText: 'text-white',
    },
};

export default function Sidebar({
    isOpen,
    onClose,
    title,
    items,
    user,
    onLogout,
    theme = 'member',
    topOffset = false,
    logoIcon,
}: SidebarProps) {
    const pathname = usePathname();
    const themeConfig = themes[theme];

    const isItemActive = (href: string) => {
        if (theme === 'admin') {
            return pathname === href || pathname?.startsWith(href + '/');
        }
        return pathname === href || (href !== (theme === 'member' ? '/member' : '/admin') && pathname?.startsWith(href));
    };

    const topClass = topOffset ? 'top-16' : 'top-0';
    const heightClass = topOffset ? 'h-[calc(100vh-4rem)]' : 'h-full';

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className={`fixed inset-0 z-30 lg:hidden ${themeConfig.overlay}`}
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 z-40 w-72 ${themeConfig.bg} border-r-2 ${themeConfig.border} transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:${heightClass} flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } ${topOffset ? `${topClass} h-[calc(100vh-4rem)]` : 'top-0 h-screen'}`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-5 sm:px-6 border-b-2 border-inherit">
                    <div className="flex items-center gap-3">
                        {logoIcon ? (
                            logoIcon
                        ) : (
                            <>
                                <Image
                                    src="/logo.png"
                                    alt="JWMJ Logo"
                                    width={36}
                                    height={36}
                                    className="object-contain"
                                />
                            </>
                        )}
                        <span className={`font-bold text-lg ${theme === 'member' ? 'text-foreground' : 'text-slate-900'}`}>{title}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`lg:hidden p-2 rounded-lg transition-colors ${theme === 'member' ? 'hover:bg-primary-silver-200' : 'hover:bg-slate-100'
                            }`}
                        aria-label="Close sidebar"
                    >
                        <X className={`w-5 h-5 ${theme === 'member' ? 'text-foreground-300' : 'text-slate-600'}`} />
                    </button>
                </div>

                {/* User Info */}
                <div className={`p-4 border-b-2 border-inherit`}>
                    <div className={`flex items-center gap-3 p-3 ${themeConfig.userBg} rounded-xl`}>
                        <div className={`w-10 h-10 ${themeConfig.userIcon} rounded-full flex items-center justify-center shrink-0`}>
                            <div className={`w-5 h-5 flex items-center justify-center ${themeConfig.userIconText}`}>
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M10 10a3 3 0 100-6 3 3 0 000 6zm0 1.89a6.004 6.004 0 00-3.773 1.977A5.986 5.986 0 0010 20a5.986 5.986 0 003.773-1.134A6.004 6.004 0 0010 11.89z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${theme === 'member' ? 'text-foreground' : 'text-slate-900'}`}>
                                {user?.name || (theme === 'member' ? 'Member' : 'Admin')}
                            </p>
                            <p className={`text-xs truncate ${theme === 'member' ? 'text-foreground-300' : 'text-slate-600'}`}>
                                {user?.email || (theme === 'member' ? 'member@jwmj.com' : 'admin@jwmj.com')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4">
                    <ul className="space-y-1">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const active = isItemActive(item.href);

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => onClose()}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${active ? themeConfig.activeGradient + ' shadow-lg' : themeConfig.inactiveText
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                        {active && theme === 'member' && <ChevronRight className="w-4 h-4 ml-auto" />}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button - Sticky at bottom */}
                <div className={`sticky bottom-0 p-4 border-t-2 border-inherit ${themeConfig.bg}`}>
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${themeConfig.logoutText}`}
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
