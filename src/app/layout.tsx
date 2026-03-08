import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Graphode from "@/components/graphode";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jamnagar Wehvaria Memon Jamat - Together for a Better Tomorrow",
    template: "%s | JWMJ"
  },
  description: "Jamnagar Wehvaria Memon Jamat (JWMJ), established in 1949, is a non-profit organization providing education, healthcare, housing, and community support to its members in Karachi, Pakistan.",
  keywords: [
    "Jamnagar Wehvaria Memon Jamat",
    "JWMJ",
    "Memon community",
    "Karachi",
    "Pakistan",
    "non-profit",
    "education",
    "healthcare",
    "community support",
    "JWMYO",
    "youth organization"
  ],
  authors: [{ name: "Jamnagar Wehvaria Memon Jamat" }],
  creator: "Jamnagar Wehvaria Memon Jamat",
  publisher: "Jamnagar Wehvaria Memon Jamat",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-domain.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'Jamnagar Wehvaria Memon Jamat - Together for a Better Tomorrow',
    description: 'Jamnagar Wehvaria Memon Jamat (JWMJ), established in 1949, is a non-profit organization providing education, healthcare, housing, and community support to its members.',
    siteName: 'Jamnagar Wehvaria Memon Jamat',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Jamnagar Wehvaria Memon Jamat Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jamnagar Wehvaria Memon Jamat - Together for a Better Tomorrow',
    description: 'Jamnagar Wehvaria Memon Jamat (JWMJ), established in 1949, is a non-profit organization providing education, healthcare, housing, and community support to its members.',
    images: ['/logo.png'],
    creator: '@jwmj_official', // Replace with actual Twitter handle if available
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-code', // Replace with actual code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground relative`}
      >
        <div className="absolute top-0 left-0 w-full z-150">
          <Header />
        </div>
        {/* Children and Footer start from 0 */}
        <div className="pt-23">
          {children}
        </div>
        <Footer />
        <Graphode />
      </body>
    </html>
  );
}
