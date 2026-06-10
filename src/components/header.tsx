
"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface AnnouncementData {
    messages: string[];
    enabled: boolean;
}

const memberLinks = [
    {
        href: "/member",
        label: "Dashboard",
        desc: "Your membership overview",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
        ),
    },
    {
        href: "/member/profile",
        label: "My Profile",
        desc: "View and edit your details",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
        ),
    },
    {
        href: "/events",
        label: "Events",
        desc: "Browse upcoming events",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
        ),
    },
    {
        href: "/forms",
        label: "Forms",
        desc: "Applications & documents",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
        ),
    },
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMemberOpen, setIsMemberOpen] = useState(false);
    const [isMobileMemberOpen, setIsMobileMemberOpen] = useState(false);
    const [announcement, setAnnouncement] = useState<AnnouncementData>({
        messages: ["Welcome to JWMJ! • Built by Graphode!"],
        enabled: true,
    });
    const memberRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const response = await fetch("/api/settings/announcement", {
                    cache: "no-store",
                    headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
                });
                if (response.ok) {
                    const data = await response.json();
                    setAnnouncement(data);
                }
            } catch {
                console.log("Using default announcement");
            }
        };
        fetchAnnouncement();
        const interval = setInterval(fetchAnnouncement, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close desktop member popup on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (memberRef.current && !memberRef.current.contains(e.target as Node)) {
                setIsMemberOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isMenuOpen]);

    const marqueeText = announcement.messages.join(" • ");

    return (
        <>
            {/* ── MOBILE SIDEBAR ── */}
            {/* Dark overlay (no blur) */}
            <div
                className={`lg:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar panel – slides in from right */}
            <aside
                className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-2xl flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={36} height={36} className="w-9 h-9" />
                        <span className="font-bold text-primary-black text-base">JWMJ</span>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg className="w-5 h-5 text-primary-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Member Portal card at top of sidebar */}
                <div className="px-4 pt-4 pb-2">
                    <div className="rounded-2xl border border-primary-blue/20 overflow-hidden">
                        {/* Card header – tap to expand/collapse */}
                        <button
                            onClick={() => setIsMobileMemberOpen(v => !v)}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-primary-blue/5 hover:bg-primary-blue/10 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-blue/15 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-bold text-primary-blue leading-tight">Member Portal</p>
                                <p className="text-xs text-primary-black/40 leading-tight">Manage your membership</p>
                            </div>
                            <svg
                                className={`w-4 h-4 text-primary-blue/60 transition-transform duration-200 ${isMobileMemberOpen ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {/* Collapsible links */}
                        <div className={`overflow-hidden transition-all duration-300 ${isMobileMemberOpen ? "max-h-96" : "max-h-0"}`}>
                            <div className="bg-white divide-y divide-gray-50">
                                {memberLinks.map(item => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-blue/5 group transition-colors"
                                    >
                                        <span className="text-primary-blue/50 group-hover:text-primary-blue transition-colors flex-shrink-0">
                                            {item.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-primary-black/80 group-hover:text-primary-blue transition-colors leading-tight">
                                                {item.label}
                                            </p>
                                            <p className="text-xs text-primary-black/35 leading-tight">{item.desc}</p>
                                        </div>
                                        <svg className="w-3.5 h-3.5 text-primary-black/20 group-hover:text-primary-blue/50 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </Link>
                                ))}
                                {/* Sign in CTA */}
                                <div className="px-4 py-3 bg-gray-50">
                                    <Link
                                        href="/member/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-primary-blue text-white text-sm font-semibold hover:bg-accent-navy transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                        </svg>
                                        Sign In
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rest of nav links */}
                <nav className="flex-1 overflow-y-auto px-4 py-2">
                    <ul className="space-y-0.5">
                        {[
                            { href: "/about", label: "About US" },
                            { href: "/about-jwmyo", label: "About JWMYO" },
                            { href: "/forms", label: "Forms" },
                            { href: "/events", label: "Events" },
                            { href: "/committee", label: "Presidency" },
                            { href: "/contact", label: "Support & Contact" },
                        ].map(item => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-primary-black/60 font-semibold text-base hover:text-primary-blue hover:bg-primary-blue/5 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar footer */}
                <div className="px-5 py-4 border-t border-gray-100">
                    <p className="text-xs text-primary-black/30 text-center">© JWMJ — Built by Graphode</p>
                </div>
            </aside>

            {/* ── MAIN HEADER ── */}
            <header className="w-full top-0 left-0 z-40">
                {/* Announcement Ribbon */}
                {announcement.enabled && (
                    <div className="h-8 bg-linear-to-r from-primary-blue to-accent-navy relative overflow-hidden">
                        <span
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-base whitespace-nowrap"
                            style={{ animation: "marquee 16s linear infinite", animationDelay: "0s" }}
                        >
                            {marqueeText}
                        </span>
                        <span
                            className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-base whitespace-nowrap"
                            style={{ animation: "marquee 16s linear infinite", animationDelay: "-8s" }}
                        >
                            {marqueeText}
                        </span>
                    </div>
                )}

                <div className="w-full relative flex items-center justify-between shadow-lg shadow-primary-black opacity-80">
                    {/* Logo Circle */}
                    <div className="bg-primary-silver h-20 w-20 md:h-30 md:w-30 rounded-full absolute left-5 top-1 p-2 shadow-lg shadow-primary-black z-10" />
                    <Link className="flex items-center gap-2 z-50 absolute left-7 md:left-7.5 top-3 md:top-4" href="/">
                        <Image src="/logo.png" alt="Logo" width={80} height={80} className="w-16 h-16 md:w-24 md:h-24" />
                    </Link>

                    <div className="w-full bg-primary-silver h-12 md:h-15 flex items-center justify-end z-40">
                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center mx-10">
                            <ul className="flex gap-6 text-primary-black/60 text-lg font-semibold items-center">
                                <li><Link href="/about" className="hover:text-primary-blue transition-colors">About US</Link></li>
                                <li><Link href="/about-jwmyo" className="hover:text-primary-blue transition-colors">About JWMYO</Link></li>
                                <li><Link href="/forms" className="hover:text-primary-blue transition-colors">Forms</Link></li>
                                <li><Link href="/events" className="hover:text-primary-blue transition-colors">Events</Link></li>
                                <li><Link href="/presidency" className="hover:text-primary-blue transition-colors">Committee</Link></li>
                                <li><Link href="/contact" className="hover:text-primary-blue transition-colors">Support & Contact</Link></li>

                                {/* Desktop Member Portal */}
                                <li className="relative" ref={memberRef}>
                                    <button
                                        onClick={() => setIsMemberOpen(v => !v)}
                                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border-2 transition-all duration-200 font-semibold text-lg
                                            ${isMemberOpen
                                                ? "border-primary-blue text-primary-blue bg-primary-blue/5"
                                                : "border-primary-blue/40 text-primary-blue hover:border-primary-blue hover:bg-primary-blue/5"
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                        </svg>
                                        Member Portal
                                        <svg
                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isMemberOpen ? "rotate-180" : ""}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {/* Desktop dropdown */}
                                    <div
                                        className={`absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-72 z-50
                                            transition-all duration-200 origin-top
                                            ${isMemberOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
                                    >
                                        {/* Arrow */}
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200 shadow-sm" />
                                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                            <div className="h-1.5 w-full bg-linear-to-r from-primary-blue to-accent-navy" />
                                            <div className="p-5">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-5 h-5 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-primary-black text-sm">Member Portal</p>
                                                        <p className="text-xs text-primary-black/50">Manage your JWMJ membership</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    {memberLinks.map(item => (
                                                        <Link
                                                            key={item.href}
                                                            href={item.href}
                                                            onClick={() => setIsMemberOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary-blue/5 group transition-colors"
                                                        >
                                                            <span className="text-primary-blue/60 group-hover:text-primary-blue transition-colors flex-shrink-0">
                                                                {item.icon}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-primary-black/80 group-hover:text-primary-blue transition-colors leading-tight">
                                                                    {item.label}
                                                                </p>
                                                                <p className="text-xs text-primary-black/40 leading-tight mt-0.5">{item.desc}</p>
                                                            </div>
                                                            <svg className="w-3.5 h-3.5 text-primary-black/20 group-hover:text-primary-blue/50 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                            </svg>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <Link
                                                        href="/member/login"
                                                        onClick={() => setIsMemberOpen(false)}
                                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary-blue text-white text-sm font-semibold hover:bg-accent-navy transition-colors"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                                        </svg>
                                                        Sign In to Your Account
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>

                            </ul>
                        </nav>

                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden flex flex-col items-center justify-center w-8 h-8 mx-6 z-50"
                            onClick={() => setIsMenuOpen(v => !v)}
                            aria-label="Toggle menu"
                        >
                            <span className={`block w-6 h-0.5 bg-primary-black/60 transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-primary-black/60 transition-all duration-300 my-1 ${isMenuOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-6 h-0.5 bg-primary-black/60 transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}