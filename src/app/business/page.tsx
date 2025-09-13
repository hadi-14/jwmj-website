'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBusinesses } from '@/actions/business';
import { Business } from '@/types/business';

export default function PartnersPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [allCommunityBusinesses, setAllCommunityBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBusinesses();
      setAllCommunityBusinesses(data);
      
      // Update categories when data is fetched
      const uniqueCategories = Array.from(new Set(["All", ...data.map(b => b.category)]));
      setCategories(uniqueCategories);
    };
    fetchData();
  }, []); 

  const filteredPartners = selectedCategory === "All"
    ? allCommunityBusinesses
    : allCommunityBusinesses.filter(business => business.category === selectedCategory);

  const toggleExpand = (businessId: number) => {
    setExpandedCard(expandedCard === businessId ? null : businessId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white -mt-7">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#038DCD] to-[#F9C856] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Our Community Business
          </h1>
          <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto">
            Building stronger communities through strategic partnerships and collaboration
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === category
                  ? 'bg-[#038DCD] text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Partners Grid */}
        <div className="grid gap-8">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-8">

                  {/* Left: Logo and Basic Info */}
                  <div className="lg:w-1/3">
                    <div className="flex flex-col items-center lg:items-start">
                      {/* Logo */}
                      <div className="w-24 h-24 bg-gradient-to-br from-[#038DCD] to-[#F9C856] rounded-2xl flex items-center justify-center mb-6">
                        <span className="text-white font-bold text-2xl">
                          {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                        </span>
                      </div>

                      {/* Basic Info */}
                      <div className="text-center lg:text-left w-full">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {partner.name}
                        </h2>
                        <p className="text-[#038DCD] font-semibold mb-4">
                          {partner.category}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Established:</span> {partner.established}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="lg:w-2/3">
                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Phone:</span> {partner.phone}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Email:</span> {partner.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Website:</span>
                          <span className="text-[#038DCD]"> {partner.website}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Address:</span> {partner.address}
                        </p>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-800 mb-3">Services Offered:</h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.services.map((service, index) => (
                          <span
                            key={index}
                            className="bg-[#038DCD]/10 text-[#038DCD] px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-gray-700 leading-relaxed">
                        {expandedCard === partner.id ? partner.detailedDescription : partner.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => toggleExpand(partner.id)}
                        className="bg-[#038DCD]/10 hover:bg-[#038DCD]/20 text-[#038DCD] font-medium px-6 py-2 rounded-full transition-colors duration-200"
                      >
                        {expandedCard === partner.id ? 'Show Less' : 'Read More'}
                      </button>
                      <button className="bg-[#038DCD] hover:bg-[#038DCD]/90 text-white font-medium px-6 py-2 rounded-full transition-colors duration-200">
                        Contact Partner
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Business Listing CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-[#038DCD]/10 to-[#F9C856]/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Want to List Your Business Here?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            JWMJ members can advertise their businesses on our website for FREE!
            Join our community business directory and reach thousands of potential customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#038DCD] hover:bg-[#038DCD]/90 text-white font-bold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105">
              Submit Business Listing
            </button>
            <button className="bg-white hover:bg-gray-50 text-[#038DCD] font-bold px-8 py-3 rounded-full border-2 border-[#038DCD] transition-all duration-200 hover:scale-105">
              Listing Guidelines
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500 space-y-1">
            <p>✓ Free advertising for verified JWMJ members</p>
            <p>✓ Reach thousands of community members</p>
            <p>✓ Professional business profile with contact details</p>
            <p>✓ Special offers section for community discounts</p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#038DCD] hover:text-[#038DCD]/80 font-medium"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}