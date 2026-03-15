import { getBusinesses } from "@/actions/business";
import { BusinessAds } from "@/types/businessAds";
import Link from "next/link";

export default async function BusinessPage() {
    const businesses: BusinessAds[] = await getBusinesses();

    return (
        <main className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Our Community Businesses
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover and support businesses within our Jamnagar Wehvaria Memon Jamat community.
                        Get special member discounts and connect with local entrepreneurs.
                    </p>
                </div>

                {/* Businesses Grid */}
                {businesses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                No Businesses Yet
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                We&apos;re just getting started! Be the first to showcase your business in our community directory.
                                Don&apos;t feel bad - every successful community starts with the first business listing.
                            </p>
                            <div className="space-y-4">
                                <Link
                                    href="/member"
                                    className="inline-flex items-center px-8 py-4 bg-[#038DCD] text-white font-semibold text-lg rounded-full hover:bg-[#038DCD]/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Submit Your Business
                                </Link>
                                <p className="text-sm text-gray-500">
                                    Join our growing community of entrepreneurs and get special member discounts!
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {businesses.map((business) => (
                            <div
                                key={business.id}
                                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Header with Logo and Category */}
                                <div className="bg-linear-to-r from-[#038DCD] to-[#F9C856] p-6 text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold text-xl">
                                                {business.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                                            {business.category}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">{business.name}</h2>
                                    <p className="text-white/90">{business.description}</p>
                                </div>

                                {/* Business Details */}
                                <div className="p-6 space-y-4">
                                    {/* Contact Information */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-700 w-16">Phone:</span>
                                                <span className="text-gray-600">{business.phone}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-700 w-16">Email:</span>
                                                <a
                                                    href={`mailto:${business.email}`}
                                                    className="text-[#038DCD] hover:underline"
                                                >
                                                    {business.email}
                                                </a>
                                            </div>
                                            {business.website && (
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-700 w-16">Website:</span>
                                                    <a
                                                        href={business.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#038DCD] hover:underline"
                                                    >
                                                        {business.website}
                                                    </a>
                                                </div>
                                            )}
                                            <div className="flex items-start">
                                                <span className="font-medium text-gray-700 w-16">Address:</span>
                                                <span className="text-gray-600">{business.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Business Info */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-700 w-20">Established:</span>
                                                <span className="text-gray-600">{business.established}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-700 w-20">Owner:</span>
                                                <span className="text-gray-600">{business.owner}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {business.services.map((service, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-[#038DCD]/10 text-[#038DCD] px-3 py-1 rounded-full text-sm font-medium"
                                                >
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Special Offers */}
                                    {business.specialOffers && (
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-gray-900">Special Offers</h3>
                                            <p className="text-gray-600 text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                {business.specialOffers}
                                            </p>
                                        </div>
                                    )}

                                    {/* Detailed Description */}
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold text-gray-900">About</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {business.detailedDescription}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back to Home */}
                <div className="text-center mt-12">
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-[#038DCD] text-white font-semibold rounded-full hover:bg-[#038DCD]/90 transition-colors duration-200"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}