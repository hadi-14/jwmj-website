'use client';

import { useEffect, useState } from "react";
import { BusinessAds } from "@/types/businessAds";
import Link from "next/link";
import Image from "next/image";

export default function BusinessPage() {
    const [businesses, setBusinesses] = useState<BusinessAds[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logoLoadErrors, setLogoLoadErrors] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await fetch('/api/business');
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                const data = await response.json();
                setBusinesses(data.businesses || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        fetchBusinesses();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── Page Header ── */}
                <div className="text-center mb-14">
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-sky-400" />
                        <span className="text-xs font-semibold tracking-widest uppercase text-sky-600">
                            Jamnagar Wehvaria Memon Jamat
                        </span>
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-sky-400" />
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
                        Our Community{" "}
                        <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                            Businesses
                        </span>
                    </h1>

                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-light">
                        Discover and support businesses within our community.
                        Get special member discounts and connect with local entrepreneurs.
                    </p>

                    {/* trust badges */}
                    <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
                        {[
                            { label: "Verified Listings", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                            { label: "Member Discounts", d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
                            { label: "Trusted Community", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
                        ].map(({ label, d }) => (
                            <div key={label} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
                                    </svg>
                                </div>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Loading ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
                        <p className="text-sm text-gray-400 tracking-wide">Loading businesses…</p>
                    </div>
                )}

                {/* ── Error ── */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
                        <p className="text-gray-500 max-w-md">{error}</p>
                        <Link href="/" className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#038DCD] text-white text-sm font-semibold hover:bg-sky-600 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                )}

                {/* ── Empty ── */}
                {!loading && !error && businesses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
                        <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">No Businesses Yet</h2>
                        <p className="text-gray-500 max-w-md leading-relaxed">
                            Be the first to showcase your business in our community directory.
                        </p>
                        <Link
                            href="/member"
                            className="mt-2 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Submit Your Business
                        </Link>
                        <Link href="/" className="text-sm text-gray-400 hover:text-[#038DCD] transition-colors mt-1">
                            ← Back to Home
                        </Link>
                    </div>
                )}

                {/* ── Business List ── */}
                {!loading && !error && businesses.length > 0 && (
                    <>
                        {/* section meta */}
                        <div className="flex items-center gap-3 mb-8">
                            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">All Listings</span>
                            <div className="flex-1 h-px bg-gray-200" />
                            <span className="text-xs text-gray-400 font-medium">{businesses.length} businesses</span>
                        </div>

                        {/* ── HORIZONTAL SPLIT CARDS ── */}
                        <div className="flex flex-col gap-5">
                            {businesses.map((business, idx) => (
                                <div
                                    key={business.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
                                >
                                    {/* ── LEFT PANEL — gradient identity strip ── */}
                                    <div className="bg-gradient-to-b sm:bg-gradient-to-br from-sky-700 via-cyan-500 to-emerald-500 sm:w-52 flex-shrink-0 flex flex-col items-center justify-center gap-3 px-6 py-8 relative overflow-hidden">
                                        {/* dot texture */}
                                        <div
                                            className="absolute inset-0 opacity-10"
                                            style={{
                                                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                                backgroundSize: '18px 18px',
                                            }}
                                        />

                                        {/* logo */}
                                        {/* outer glow ring */}
                                        <div className="relative p-1 rounded-full bg-white/30 shadow-[0_0_0_4px_rgba(255,255,255,0.2),0_0_24px_rgba(255,255,255,0.35)] flex-shrink-0">
                                            <div className="w-24 h-24 rounded-full bg-white border-2 border-white/80 flex items-center justify-center overflow-hidden shadow-xl">
                                                {business.logo && business.logo !== '/logo-placeholder.png' && !logoLoadErrors[business.id] ? (
                                                    <Image
                                                        src={business.logo}
                                                        alt={`${business.name} logo`}
                                                        width={96}
                                                        height={96}
                                                        className="w-full h-full object-contain p-1.5"
                                                        onError={() => setLogoLoadErrors(prev => ({ ...prev, [business.id]: true }))}
                                                    />
                                                ) : (
                                                    <span className="text-3xl font-black bg-gradient-to-br from-sky-600 to-emerald-500 bg-clip-text text-transparent">
                                                        {business.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* name */}
                                        <p className="relative text-center text-white font-black text-base leading-tight drop-shadow">
                                            {business.name}
                                        </p>

                                        {/* category pill */}
                                        <span className="relative text-[10px] font-semibold bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full tracking-wide text-center">
                                            {business.category}
                                        </span>

                                        {/* est. badge */}
                                        <div className="relative flex items-center gap-1 mt-1">
                                            <svg className="w-3 h-3 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-[10px] text-white/75 font-medium">Est. {business.established}</span>
                                        </div>
                                    </div>

                                    {/* ── RIGHT PANEL — details ── */}
                                    <div className="flex-1 flex flex-col">

                                        {/* top row: description + owner */}
                                        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{business.description}</p>
                                            </div>
                                            {/* owner chip */}
                                            <div className="flex items-center gap-2 shrink-0 bg-gray-50 border border-gray-100 rounded-full pl-1 pr-3 py-1">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-[9px] font-black">
                                                    {business.owner.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700">{business.owner}</span>
                                            </div>
                                        </div>

                                        {/* middle row: contact + services */}
                                        <div className="px-6 py-4 flex flex-col sm:flex-row gap-5 flex-1">

                                            {/* contact */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold tracking-widest uppercase text-[#038DCD] mb-2">Contact</p>
                                                <div className="space-y-1.5 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        <span className="text-gray-600 truncate">{business.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                        <a href={`mailto:${business.email}`} className="text-[#038DCD] hover:underline truncate">{business.email}</a>
                                                    </div>
                                                    {business.website && (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                            </svg>
                                                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-[#038DCD] hover:underline truncate">
                                                                {business.website.replace(/^https?:\/\/(www\.)?/, '')}
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-gray-600 leading-snug text-xs">{business.address}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* divider */}
                                            <div className="hidden sm:block w-px bg-gray-100 self-stretch" />

                                            {/* services + about */}
                                            <div className="flex-1 min-w-0 flex flex-col gap-3">
                                                <div>
                                                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#038DCD] mb-2">Services</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {business.services.map((service: string, i: number) => (
                                                            <span key={i} className="text-xs font-medium text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-full">
                                                                {service}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#038DCD] mb-1.5">About</p>
                                                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{business.detailedDescription}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ── bottom bar: special offer + active badge ── */}
                                        {business.specialOffers && (
                                            <div className="mx-6 mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                                                <svg className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                <p className="text-xs text-amber-800 leading-relaxed">{business.specialOffers}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── CTA Banner ── */}
                        <div className="mt-14 rounded-2xl bg-gradient-to-r from-sky-700 via-cyan-600 to-emerald-600 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                            />
                            <div className="relative text-center sm:text-left">
                                <h3 className="text-2xl font-black text-white mb-1">Own a business?</h3>
                                <p className="text-white/70 text-sm">List it and reach hundreds of community members today.</p>
                            </div>
                            <div className="relative flex gap-3 flex-wrap justify-center shrink-0">
                                <Link
                                    href="/member"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-sky-700 font-bold text-sm hover:bg-sky-50 transition-colors shadow-md"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Submit Your Business
                                </Link>
                                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                                    ← Back to Home
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                {/* fallback back link */}
                {!loading && (error || businesses.length === 0) && (
                    <div className="text-center mt-10">
                        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#038DCD] text-white font-semibold text-sm hover:bg-sky-600 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}