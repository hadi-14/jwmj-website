import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="relative bottom-0 bg-primary-black text-white z-50 rounded-t-[4rem] mx-10">
            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Organization Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gray-700 p-2 rounded-full">
                                <Image src="/logo.png" alt="JWMJ Logo" width={40} height={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white">JWMJ</h3>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-300">
                            Jamnagar Wehvaria Memon Jamat
                        </h4>
                        <p className="text-gray-400 leading-relaxed">
                            Serving our community with dedication and bringing people together through faith, culture, and mutual support.
                        </p>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white mb-4">Contact Information</h4>

                        {/* Phone Numbers */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300">Phone 1</p>
                                    <a href="tel:+922134893375" className="text-white hover:text-blue-400 transition-colors">
                                        +92 21 34893375
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300">Phone 2</p>
                                    <a href="tel:+923009253888" className="text-white hover:text-blue-400 transition-colors">
                                        +92 300 9253888
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3">
                            <div className="bg-red-600 p-2 rounded-full">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-300">Email</p>
                                <a href="mailto:info@jwmj.org" className="text-white hover:text-red-400 transition-colors">
                                    info@jwmj.org
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white mb-4">Support Our Community</h4>

                        {/* Help Us */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-600 p-2 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300">Help Us</p>
                                    <p className="text-white">
                                        Support our community initiatives and programs
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-green-600 p-2 rounded-full">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-300">Donate</p>
                                    <Link href="/donate" className="text-white hover:text-green-400 transition-colors">
                                        Make a donation
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
                        <div className="grid grid-cols-2 gap-4">

                            {/* WhatsApp */}
                            <a href="https://wa.me/923009253888"
                                className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-green-600 rounded-lg transition-all duration-300 group">
                                <div className="bg-green-500 p-2 rounded-full group-hover:bg-white">
                                    <svg className="w-5 h-5 text-white group-hover:text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">WhatsApp</span>
                            </a>

                            {/* Facebook */}
                            <a href="https://www.facebook.com/JWMJYO/"
                                className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-blue-600 rounded-lg transition-all duration-300 group">
                                <div className="bg-blue-500 p-2 rounded-full group-hover:bg-white">
                                    <svg className="w-5 h-5 text-white group-hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Facebook</span>
                            </a>

                            {/* Instagram */}
                            <a href="https://www.instagram.com/jwmjyo/"
                                className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-pink-600 rounded-lg transition-all duration-300 group">
                                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-full group-hover:bg-white">
                                    <svg className="w-5 h-5 text-white group-hover:text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm5.13.62a1.13 1.13 0 1 1-2.26 0 1.13 1.13 0 0 1 2.26 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">Instagram</span>
                            </a>

                            {/* YouTube */}
                            <a href="https://www.youtube.com/channel/UCBI_Uk_RXxfpL_u8hPKVC_g"
                                className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-red-600 rounded-lg transition-all duration-300 group">
                                <div className="bg-red-500 p-2 rounded-full group-hover:bg-white">
                                    <svg className="w-5 h-5 text-white group-hover:text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium">YouTube</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-700 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2026 Jamnagar Wehvaria Memon Jamat. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <Link href="/privacy" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/sitemap" className="hover:text-white transition-colors">
                                Sitemap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}