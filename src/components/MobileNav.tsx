'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, LucideIcon } from 'lucide-react';

export interface MobileNavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

export interface MobileNavProps {
    items: MobileNavItem[];
    onMoreClick?: () => void;
    onLogout?: () => void;
    theme?: 'member' | 'admin';
    showLogout?: boolean;
}

// Theme configurations matching Sidebar
const themes = {
    member: {
        bg: 'bg-background',
        border: 'border-primary-silver-400',
        activeText: 'text-primary-blue',
        inactiveText: 'text-foreground-300',
        activeIconStroke: 'stroke-[2.5px]',
        hoverText: 'hover:text-foreground',
        logoutText: 'text-red-600 hover:bg-red-50',
    },
    admin: {
        bg: 'bg-white',
        border: 'border-slate-200',
        activeText: 'text-[#038DCD]',
        inactiveText: 'text-slate-500',
        activeIconStroke: 'stroke-[2px]',
        hoverText: 'hover:text-slate-900',
        logoutText: 'text-rose-700 hover:bg-rose-50',
    },
};

export default function MobileNav({
    items,
    onMoreClick,
    onLogout,
    theme = 'member',
    showLogout = false,
}: MobileNavProps) {
    const pathname = usePathname();
    const themeConfig = themes[theme];

    const isItemActive = (href: string) => {
        if (href === '#more') return false;
        if (theme === 'admin') {
            return pathname === href || pathname?.startsWith(href + '/');
        }
        return pathname === href || (href !== (theme === 'member' ? '/member' : '/admin') && pathname?.startsWith(href));
    };

    return (
        <nav className={`fixed bottom-0 left-0 right-0 ${themeConfig.bg} border-t-2 ${themeConfig.border} lg:hidden z-20 pb-safe`}>
            <ul className={`flex items-center justify-between h-16 ${showLogout ? 'px-2' : ''}`}>
                {items.map((item) => {
                    const Icon = item.icon;
                    const isMore = item.href === '#more';
                    const isActive = !isMore && isItemActive(item.href);

                    if (isMore) {
                        return (
                            <li key={item.name} className="flex-1">
                                <button
                                    onClick={onMoreClick}
                                    className={`w-full flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${themeConfig.inactiveText} ${themeConfig.hoverText}`}
                                    aria-label="More options"
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-semibold">{item.name}</span>
                                </button>
                            </li>
                        );
                    }

                    return (
                        <li key={item.name} className="flex-1">
                            <Link
                                href={item.href}
                                className={`w-full flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors font-semibold ${isActive
                                        ? `${themeConfig.activeText}`
                                        : `${themeConfig.inactiveText} ${themeConfig.hoverText}`
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? themeConfig.activeIconStroke : ''}`} />
                                <span className="text-xs">{item.name}</span>
                            </Link>
                        </li>
                    );
                })}

                {showLogout && onLogout && (
                    <li className="flex-1">
                        <button
                            onClick={onLogout}
                            className={`w-full flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors font-semibold ${themeConfig.logoutText}`}
                            aria-label="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="text-xs">Logout</span>
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
}
