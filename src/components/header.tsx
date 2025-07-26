"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="w-full">
            {/* Blue Ribbon */}
            <div className="h-8 bg-gradient-to-r from-primary-blue to-accent-navy relative overflow-hidden justify-between">
                {/* First animated text */}
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-base whitespace-nowrap"
                    style={{
                        animation: "marquee 16s linear infinite",
                        animationDelay: "0s"
                    }}
                >
                    Welcome to JWMJ! • Website Under Construction!
                </span>

                {/* Second animated text - offset by half the animation duration */}
                <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-base whitespace-nowrap"
                    style={{
                        animation: "marquee 16s linear infinite",
                        animationDelay: "-8s"
                    }}
                >
                    Welcome to JWMJ! • Website Under Construction!
                </span>
            </div>

            <div className="w-full relative flex items-center justify-between shadow-lg shadow-primary-black">
                {/* Circle */}
                <div className="bg-primary-silver h-30 w-30 rounded-full absolute left-5 top-1 p-2 shadow-lg shadow-primary-black z-10">
                </div>
                <Link className="flex items-center gap-2 z-50 absolute left-7.5 top-4" href={"/"}>
                    <Image src="/logo.png" alt="Logo" width={100} height={100} />
                </Link>

                {/* Background Grey Box */}
                <div className="w-full bg-primary-silver h-15 flex items-center justify-end z-40">
                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center mx-10">
                        <ul className="flex gap-6 text-primary-black/60 text-lg font-semibold">
                            <li><Link href="/#" className="hover:text-primary-blue">About US</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Announcements</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Events</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Youth Programs</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Support</Link></li>
                            <li><Link href="/#" className="hover:text-primary-blue">Contact</Link></li>
                        </ul>
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden flex flex-col items-center justify-center w-8 h-8 mx-6 z-50"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <span
                            className={`block w-6 h-0.5 bg-primary-black/60 transition-all duration-300 ${
                                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                            }`}
                        ></span>
                        <span
                            className={`block w-6 h-0.5 bg-primary-black/60 transition-all duration-300 my-1 ${
                                isMenuOpen ? 'opacity-0' : ''
                            }`}
                        ></span>
                        <span
                            className={`block w-6 h-0.5 bg-primary-black/60 transition-all duration-300 ${
                                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                            }`}
                        ></span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div
                className={`lg:hidden absolute left-1/2 w-1/2 bg-primary-silver shadow-lg shadow-primary-black z-30 transition-all duration-300 ease-in-out ${
                    isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                }`}
            >
                <nav className="py-4">
                    <ul className="flex flex-col text-primary-black/60 text-lg font-semibold">
                        <li>
                            <Link 
                                href="/#" 
                                className="block px-6 py-3 hover:text-primary-blue hover:bg-primary-black/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About US
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/#" 
                                className="block px-6 py-3 hover:text-primary-blue hover:bg-primary-black/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Announcements
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/#" 
                                className="block px-6 py-3 hover:text-primary-blue hover:bg-primary-black/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Events
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/#" 
                                className="block px-6 py-3 hover:text-primary-blue hover:bg-primary-black/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Youth Programs
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/#" 
                                className="block px-6 py-3 hover:text-primary-blue hover:bg-primary-black/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Support
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/#" 
                                className="block px-6 py-3 hover:text-primary-blue hover:bg-primary-black/5 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}