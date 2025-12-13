'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-white px-4">
      {/* Logo */}
      <div className="mb-12">
        <Image
          src="/logo.png"
          alt="JWMJ Logo"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* 404 Content */}
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-black text-gray-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h2>

        <p className="text-gray-600 text-base mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold rounded-full hover:shadow-lg transition-all duration-300"
          >
            Return to Home
          </Link>
          
          <Link
            href="/about"
            className="px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-full border border-gray-300 hover:bg-gray-200 transition-all duration-300"
          >
            Learn About JWMJ
          </Link>
        </div>
      </div>

      {/* Tagline */}
      <p className="mt-16 text-gray-500 text-sm italic">
        &ldquo;Together in serve for better Tomorrow&rdquo;
      </p>
    </main>
  );
}