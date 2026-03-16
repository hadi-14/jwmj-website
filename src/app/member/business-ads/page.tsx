'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { submitBusinessAdRequest } from '@/actions/business';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { useNotification } from '@/components/Notification';

interface MemberInfo {
    MemComputerID: number;
    MemWehvariaNo?: string;
    MemMembershipNo?: string;
    MemName?: string;
    MemFatherName?: string;
    MemMotherName?: string;
    MemCNIC?: string;
    MemDOB?: string;
    MemRegistrationDate?: string;
    MemPostalAddress?: string;
    email?: string;
    cellNumbers: string[];
}

export default function BusinessAdSubmission() {
    const { member: authMember } = useMemberAuth();
    const { showNotification } = useNotification();
    const [member, setMember] = useState<MemberInfo | null>(null);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemberInfo();
    }, []);

    const fetchMemberInfo = async () => {
        try {
            const response = await fetch('/api/member');
            if (response.ok) {
                const data = await response.json();
                setMember(data);
            } else {
                console.error('Failed to fetch member info');
            }
        } catch (error) {
            console.error('Error fetching member info:', error);
        } finally {
            setLoading(false);
        }
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [services, setServices] = useState<string[]>(['']);

    const [formData, setFormData] = useState({
        businessName: '',
        category: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        established: '',
        owner: '',
        specialOffers: '',
        description: '',
        detailedDescription: '',
        requestedStartDate: '',
        requestedEndDate: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file.', 'error');
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('File size must be less than 2MB.', 'error');
                return;
            }
            setLogoFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleServiceChange = (index: number, value: string) => {
        const newServices = [...services];
        newServices[index] = value;
        setServices(newServices);
    };

    const addService = () => {
        setServices([...services, '']);
    };

    const removeService = (index: number) => {
        if (services.length > 1) {
            setServices(services.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) {
            showNotification('Member information not available. Please try again.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            const filteredServices = services.filter(service => service.trim() !== '');

            // Handle logo upload
            let logoUrl = undefined;
            if (logoFile) {
                // Convert file to base64 data URL
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(logoFile);
                });
                logoUrl = base64;
            }

            const result = await submitBusinessAdRequest({
                memberId: member.MemComputerID,
                ...formData,
                services: filteredServices,
                logo: logoUrl,
                requestedStartDate: new Date(formData.requestedStartDate),
                requestedEndDate: new Date(formData.requestedEndDate)
            });

            if (result.success) {
                showNotification('Business ad request submitted successfully! It will be reviewed by our administrators.', 'success');
                router.push('/member');
            } else {
                showNotification('Failed to submit request. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            showNotification('An error occurred. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !authMember) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#038DCD]/20 border-t-[#038DCD] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Member Information Not Found</h1>
                    <p className="text-gray-600">Unable to load your member information. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Business Ad Request</h1>
                        <p className="text-gray-600">
                            Fill out this form to request advertising your business on our community platform.
                            Your request will be reviewed by our administrators.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Business Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    required
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                    placeholder="Enter your business name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Textile & Fashion">Textile & Fashion</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Food & Dining">Food & Dining</option>
                                    <option value="Automotive">Automotive</option>
                                    <option value="Grocery & Food">Grocery & Food</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Education">Education</option>
                                    <option value="Events & Venues">Events & Venues</option>
                                    <option value="Technology Services">Technology Services</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Logo (Optional)
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#038DCD] transition-colors">
                                <div className="space-y-1 text-center">
                                    {logoPreview ? (
                                        <div className="relative">
                                            <Image
                                                src={logoPreview}
                                                alt="Logo preview"
                                                width={128}
                                                height={128}
                                                className="mx-auto h-32 w-32 object-contain rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="logo-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#038DCD] hover:text-[#026fa0] focus-within:outline-none"
                                                >
                                                    <span>Upload a logo</span>
                                                    <input
                                                        id="logo-upload"
                                                        name="logo"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                    placeholder="+92-XXX-XXX-XXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                    placeholder="contact@yourbusiness.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Website (Optional)
                            </label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                placeholder="https://www.yourbusiness.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Address *
                            </label>
                            <textarea
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                placeholder="Full business address"
                            />
                        </div>

                        {/* Business Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year Established *
                                </label>
                                <input
                                    type="text"
                                    name="established"
                                    required
                                    value={formData.established}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                    placeholder="e.g., 2020"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Owner/Manager Name *
                                </label>
                                <input
                                    type="text"
                                    name="owner"
                                    required
                                    value={formData.owner}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                    placeholder="Business owner or manager name"
                                />
                            </div>
                        </div>

                        {/* Services */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Services Offered *
                            </label>
                            {services.map((service, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={service}
                                        onChange={(e) => handleServiceChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                        placeholder={`Service ${index + 1}`}
                                    />
                                    {services.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeService(index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addService}
                                className="px-4 py-2 bg-[#038DCD] text-white rounded-md hover:bg-[#038DCD]/90"
                            >
                                Add Service
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Offers (Optional)
                            </label>
                            <textarea
                                name="specialOffers"
                                value={formData.specialOffers}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                placeholder="Any special offers or discounts for community members"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Description *
                            </label>
                            <textarea
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                placeholder="Brief description of your business"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Detailed Description *
                            </label>
                            <textarea
                                name="detailedDescription"
                                required
                                value={formData.detailedDescription}
                                onChange={handleInputChange}
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                placeholder="Detailed description including history, services, and commitment to quality"
                            />
                        </div>

                        {/* Ad Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Requested Start Date *
                                </label>
                                <input
                                    type="date"
                                    name="requestedStartDate"
                                    required
                                    value={formData.requestedStartDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Requested End Date *
                                </label>
                                <input
                                    type="date"
                                    name="requestedEndDate"
                                    required
                                    value={formData.requestedEndDate}
                                    onChange={handleInputChange}
                                    min={formData.requestedStartDate || new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-[#038DCD] text-white font-semibold rounded-md hover:bg-[#038DCD]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}