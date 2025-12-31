'use client';

import { useState } from 'react';
import { createZakatApplication } from '@/actions/zakatApplication';
import { ZakatApplicationFormData } from '@/types/forms';
import { useRouter } from 'next/navigation';

export default function ZakatApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ZakatApplicationFormData>>({
    applicationDate: new Date(),
    parentsLivingWithYou: false,
    hasGold: false,
    hasSilver: false,
    hasCash: false,
    hasPrizeBonds: false,
    hasExcessItems: false,
    hasBusiness: false,
    hasGivenLoan: false,
    hasCommittee: false,
    hasTakenLoan: false,
    hasInvestment: false,
    declarationAccepted: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'date') {
      setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createZakatApplication(formData as ZakatApplicationFormData);
      
      if (result.success) {
        alert('Application submitted successfully!');
        router.push('/applications/zakat');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-yellow-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#038DCD] to-[#03BDCD] rounded-t-3xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Zakat Application Form</h1>
          <p className="text-sm opacity-90">Jamnagar Wehvaria Memon Jamat</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-3xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#038DCD] mb-4 pb-2 border-b-2 border-[#038DCD]/20">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Applicant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="applicantName"
                  required
                  value={formData.applicantName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Father/Husband Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fatherOrHusbandName"
                  required
                  value={formData.fatherOrHusbandName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Identification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="identification"
                  required
                  value={formData.identification || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Membership Number
                </label>
                <input
                  type="text"
                  name="membershipNumber"
                  value={formData.membershipNumber || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CNIC Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="idCardNumber"
                  required
                  placeholder="xxxxx-xxxxxxx-x"
                  value={formData.idCardNumber || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Education <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="education"
                  required
                  value={formData.education || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  required
                  value={formData.mobileNumber || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Address <span className="text-red-500">*</span>
              </label>
              <textarea
                name="currentAddress"
                required
                rows={3}
                value={formData.currentAddress || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#038DCD] mb-4 pb-2 border-b-2 border-[#038DCD]/20">
              Professional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profession/Skill <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="professionOrSkill"
                  required
                  value={formData.professionOrSkill || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Working Institution
                </label>
                <input
                  type="text"
                  name="workingInstitution"
                  value={formData.workingInstitution || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Marital & Residential Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#038DCD] mb-4 pb-2 border-b-2 border-[#038DCD]/20">
              Personal Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="maritalStatus"
                  required
                  value={formData.maritalStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="married">Married</option>
                  <option value="unmarried">Unmarried</option>
                  <option value="widow">Widow</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Residential Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="residentialStatus"
                  required
                  value={formData.residentialStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="owned">Owned</option>
                  <option value="rented">Rented</option>
                  <option value="lease">Lease</option>
                </select>
              </div>
            </div>
          </div>

          {/* Household Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#038DCD] mb-4 pb-2 border-b-2 border-[#038DCD]/20">
              Household Information
            </h2>
            
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="parentsLivingWithYou"
                  checked={formData.parentsLivingWithYou}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#038DCD] border-gray-300 rounded focus:ring-[#038DCD]"
                />
                <span className="text-sm font-semibold text-gray-700">Parents living with you?</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Brothers/Sisters
                </label>
                <input
                  type="number"
                  name="numberOfBrothers"
                  min="0"
                  value={formData.numberOfBrothers || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Children
                </label>
                <input
                  type="number"
                  name="numberOfChildren"
                  min="0"
                  value={formData.numberOfChildren || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Family Members
                </label>
                <input
                  type="number"
                  name="totalFamilyMembers"
                  min="0"
                  value={formData.totalFamilyMembers || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Earning Members
                </label>
                <input
                  type="number"
                  name="totalEarningMembers"
                  min="0"
                  value={formData.totalEarningMembers || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Income (PKR)
                </label>
                <input
                  type="number"
                  name="monthlyIncome"
                  min="0"
                  value={formData.monthlyIncome || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#038DCD] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Assets Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#038DCD] mb-4 pb-2 border-b-2 border-[#038DCD]/20">
              Assets Information
            </h2>
            
            <div className="space-y-6">
              {/* Gold */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    name="hasGold"
                    checked={formData.hasGold}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#038DCD] border-gray-300 rounded focus:ring-[#038DCD]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Do you have Gold?</span>
                </label>
                
                {formData.hasGold && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                    <input
                      type="text"
                      name="goldDetails"
                      placeholder="Details"
                      value={formData.goldDetails || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      name="goldAmount"
                      placeholder="Amount (PKR)"
                      min="0"
                      value={formData.goldAmount || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Silver */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    name="hasSilver"
                    checked={formData.hasSilver}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#038DCD] border-gray-300 rounded focus:ring-[#038DCD]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Do you have Silver?</span>
                </label>
                
                {formData.hasSilver && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                    <input
                      type="text"
                      name="silverDetails"
                      placeholder="Details"
                      value={formData.silverDetails || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      name="silverAmount"
                      placeholder="Amount (PKR)"
                      min="0"
                      value={formData.silverAmount || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Cash */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    name="hasCash"
                    checked={formData.hasCash}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#038DCD] border-gray-300 rounded focus:ring-[#038DCD]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Do you have Cash savings?</span>
                </label>
                
                {formData.hasCash && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                    <input
                      type="text"
                      name="cashDetails"
                      placeholder="Details"
                      value={formData.cashDetails || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      name="cashAmount"
                      placeholder="Amount (PKR)"
                      min="0"
                      value={formData.cashAmount || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Business */}
              <div className="border border-gray-200 rounded-lg p-4">
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    name="hasBusiness"
                    checked={formData.hasBusiness}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#038DCD] border-gray-300 rounded focus:ring-[#038DCD]"
                  />
                  <span className="text-sm font-semibold text-gray-700">Do you have a Business?</span>
                </label>
                
                {formData.hasBusiness && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                    <input
                      type="text"
                      name="businessDetails"
                      placeholder="Business Details"
                      value={formData.businessDetails || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      name="businessCapital"
                      placeholder="Capital Investment (PKR)"
                      min="0"
                      value={formData.businessCapital || ''}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#038DCD] mb-4 pb-2 border-b-2 border-[#038DCD]/20">
              Declaration
            </h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                I hereby declare that the information provided above is true and correct to the best of my knowledge. 
                I understand that any false information may lead to the rejection of my application or cancellation of any assistance provided.
              </p>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="declarationAccepted"
                  required
                  checked={formData.declarationAccepted}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-[#038DCD] border-gray-300 rounded focus:ring-[#038DCD]"
                />
                <span className="text-sm font-semibold text-gray-700">
                  I accept the above declaration <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-gradient-to-r from-[#038DCD] to-[#03BDCD] text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}