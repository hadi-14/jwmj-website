'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { submitBusinessAdRequest } from '@/actions/business';
import { useNotification } from '@/components/Notification';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader2,
  Building2,
  Check
} from 'lucide-react';

interface MemberInfo {
  MemComputerID: number;
  MemName?: string;
}

export default function NewBusinessAdPage() {
  const { showNotification } = useNotification();
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<string[]>(['']);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  useEffect(() => {
    fetchMemberInfo();
  }, []);

  const fetchMemberInfo = async () => {
    try {
      const response = await fetch('/api/member');
      if (response.ok) {
        const data = await response.json();
        setMember(data);
      }
    } catch (error) {
      console.error('Error fetching member info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
      return;
    }
    if (e.type === 'dragleave') {
      // Only deactivate if leaving the drop zone entirely
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
        setIsDragActive(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification('File size must be less than 2MB.', 'error');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => setLogoPreview(event.target?.result as string);
    reader.readAsDataURL(file);

    setUploadProgress(10);
    const uploadedPath = await uploadLogoFile(file);
    if (uploadedPath) {
      setUploadedLogoUrl(uploadedPath);
      setUploadProgress(100);
      showNotification('Logo uploaded successfully', 'success');
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setUploadedLogoUrl(null);
  };

  const uploadLogoFile = async (file: File) => {
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    const uploadResponse = await fetch('/api/member/business-ads/upload', {
      method: 'POST',
      body: uploadForm
    });

    if (!uploadResponse.ok) {
      const errorBody = await uploadResponse.json().catch(() => ({}));
      const message = (errorBody as { error?: string }).error || uploadResponse.statusText;
      showNotification(`Logo upload failed: ${message}`, 'error');
      return null;
    }

    const uploadResult = await uploadResponse.json();

    if (!uploadResult.success || !uploadResult.path) {
      showNotification('Logo upload failed', 'error');
      return null;
    }

    return uploadResult.path as string;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...services];
    newServices[index] = value;
    setServices(newServices);
  };

  const addService = () => setServices([...services, '']);

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) {
      showNotification('Member information not available.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const filteredServices = services.filter(service => service.trim() !== '');
      let logoUrl = uploadedLogoUrl;

      if (logoFile && !uploadedLogoUrl) {
        const uploadForm = new FormData();
        uploadForm.append('file', logoFile);

        const uploadResponse = await fetch('/api/member/business-ads/upload', {
          method: 'POST',
          body: uploadForm
        });

        if (!uploadResponse.ok) {
          const errorBody = await uploadResponse.json().catch(() => ({})) as { error?: string };
          showNotification(
            `Logo upload failed: ${errorBody.error || uploadResponse.statusText}`,
            'error'
          );
          setIsSubmitting(false);
          return;
        }

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success || !uploadResult.path) {
          showNotification('Logo upload failed', 'error');
          setIsSubmitting(false);
          return;
        }

        logoUrl = uploadResult.path;
        setUploadedLogoUrl(logoUrl);
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
        showNotification('Business ad request submitted successfully!', 'success');
        setLogoFile(null);
        setLogoPreview(null);
        setUploadedLogoUrl(null);
        router.push('/member/business-ads');
      } else {
        showNotification('Failed to submit request.', 'error');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      showNotification('An error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-[3px] border-primary-blue-200 border-t-primary-blue rounded-full animate-spin" />
        <p className="text-sm font-semibold text-foreground-300">Loading...</p>
      </div>
    );
  }

  const categories = [
    'Textile & Fashion', 'Electronics', 'Food & Dining', 'Automotive',
    'Grocery & Food', 'Construction', 'Education', 'Events & Venues',
    'Technology Services', 'Healthcare', 'Real Estate', 'Other'
  ];

  const inputClass = "w-full px-4 py-3 bg-background border-2 border-primary-silver-400 rounded-xl text-foreground placeholder:text-foreground-300 focus:border-primary-blue focus:outline-none transition-colors";
  const labelClass = "block text-sm font-bold text-foreground mb-2";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/member/business-ads"
          className="p-2 hover:bg-primary-silver-200 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Submit Business Ad</h1>
          <p className="text-foreground-300">Request to advertise your business on our platform</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information Card */}
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-blue-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-blue" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Business Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Name *</label>
              <input
                type="text"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter business name"
              />
            </div>

            <div>
              <label className={labelClass}>Category *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Year Established *</label>
              <input
                type="text"
                name="established"
                required
                value={formData.established}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <label className={labelClass}>Owner/Manager *</label>
              <input
                type="text"
                name="owner"
                required
                value={formData.owner}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Owner name"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
          <label className={labelClass}>Business Logo (Optional)</label>
          <div
            className={`mt-2 flex justify-center px-6 py-8 border-2 transition-all duration-300 rounded-xl cursor-pointer ${isDragActive
                ? 'border-primary-blue bg-primary-blue/5 border-solid'
                : 'border-dashed border-primary-silver-400 hover:border-primary-blue'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {logoPreview ? (
              <div className="w-full">
                <div className="relative inline-block w-full">
                  <div className="flex justify-center">
                    <div className="relative">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={128}
                        height={128}
                        className="h-32 w-32 object-contain rounded-xl border-2 border-primary-silver-300"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        aria-label="Remove logo"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground-300">Uploading...</span>
                        <span className="text-sm text-foreground-300">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-primary-silver-300 rounded-full h-2">
                        <div
                          className="bg-primary-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {uploadProgress === 100 && (
                    <div className="mt-4 flex justify-center">
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Uploaded</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-center">
                    <label className="text-sm font-semibold text-primary-blue hover:text-primary-blue-600 cursor-pointer">
                      <span>Change logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center w-full">
                <Upload className="mx-auto h-12 w-12 text-foreground-300" />
                <div className="mt-4 flex flex-col gap-1 text-sm">
                  <div className="flex justify-center gap-1 text-foreground-300">
                    <label className="cursor-pointer rounded-md font-semibold text-primary-blue hover:text-primary-blue-600">
                      <span>Upload a logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-foreground-300">or drag and drop</span>
                  </div>
                </div>
                <p className="text-xs text-foreground-300 mt-2">PNG, JPG, GIF up to 2MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="+92-XXX-XXX-XXXX"
              />
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="contact@business.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Website (Optional)</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="https://www.yourbusiness.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
                className={inputClass}
                placeholder="Full business address"
              />
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Services Offered *</h2>
          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  className={inputClass}
                  placeholder={`Service ${index + 1}`}
                />
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                    aria-label="Remove service"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-blue hover:bg-primary-blue-50 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Description</h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Special Offers (Optional)</label>
              <textarea
                name="specialOffers"
                value={formData.specialOffers}
                onChange={handleInputChange}
                rows={2}
                className={inputClass}
                placeholder="Any special offers for community members"
              />
            </div>

            <div>
              <label className={labelClass}>Brief Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={inputClass}
                placeholder="Brief description of your business"
              />
            </div>

            <div>
              <label className={labelClass}>Detailed Description *</label>
              <textarea
                name="detailedDescription"
                required
                value={formData.detailedDescription}
                onChange={handleInputChange}
                rows={5}
                className={inputClass}
                placeholder="Detailed description including history, services, and commitment"
              />
            </div>
          </div>
        </div>

        {/* Ad Duration */}
        <div className="bg-background rounded-2xl border-2 border-primary-silver-400 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Ad Duration</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                type="date"
                name="requestedStartDate"
                required
                value={formData.requestedStartDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>End Date *</label>
              <input
                type="date"
                name="requestedEndDate"
                required
                value={formData.requestedEndDate}
                onChange={handleInputChange}
                min={formData.requestedStartDate || new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href="/member/business-ads"
            className="px-6 py-3 border-2 border-primary-silver-400 text-foreground text-sm font-bold rounded-xl hover:bg-primary-silver-200 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-blue text-primary-white text-sm font-bold rounded-xl hover:bg-primary-blue-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
