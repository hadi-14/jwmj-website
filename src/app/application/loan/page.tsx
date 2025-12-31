'use client';

import { useState } from 'react';
import { createBusinessLoanApplication } from '@/actions/businessLoanApplication';
import { BusinessLoanFormData } from '@/types/forms';
import { useRouter } from 'next/navigation';

export default function BusinessLoanForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessLoanFormData>>({
    applicationDate: new Date(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'date') {
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
      const result = await createBusinessLoanApplication(formData as BusinessLoanFormData);
      
      if (result.success) {
        alert('Application submitted successfully!');
        router.push('/applications/business-loan');
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
        <div className="bg-gradient-to-r from-[#F9C856] to-[#F9D98F] rounded-t-3xl p-8 text-gray-900">
          <h1 className="text-3xl font-bold mb-2">Business Loan Application</h1>
          <p className="text-sm opacity-90">Interest-Free Loan for Business Development</p>
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
            <h2 className="text-xl font-bold text-[#F9C856] mb-4 pb-2 border-b-2 border-[#F9C856]/20">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#F9C856] mb-4 pb-2 border-b-2 border-[#F9C856]/20">
              Business Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessType"
                  required
                  placeholder="e.g., Retail, Services, Manufacturing"
                  value={formData.businessType || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Amount (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  required
                  min="0"
                  value={formData.loanAmount || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="businessDescription"
                  required
                  rows={4}
                  placeholder="Describe your business in detail"
                  value={formData.businessDescription || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="loanPurpose"
                  required
                  rows={3}
                  placeholder="How will you use this loan?"
                  value={formData.loanPurpose || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Monthly Profit (PKR)
                </label>
                <input
                  type="number"
                  name="expectedMonthlyProfit"
                  min="0"
                  value={formData.expectedMonthlyProfit || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Repayment Period (Months)
                </label>
                <input
                  type="number"
                  name="repaymentPeriod"
                  min="1"
                  value={formData.repaymentPeriod || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#F9C856] mb-4 pb-2 border-b-2 border-[#F9C856]/20">
              Financial Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Expenses (PKR)
                </label>
                <input
                  type="number"
                  name="monthlyExpenses"
                  min="0"
                  value={formData.monthlyExpenses || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Existing Loans (PKR)
                </label>
                <input
                  type="number"
                  name="existingLoans"
                  min="0"
                  value={formData.existingLoans || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Guarantor Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#F9C856] mb-4 pb-2 border-b-2 border-[#F9C856]/20">
              Guarantor 1 Information <span className="text-red-500">*</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guarantor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="guarantor1Name"
                  required
                  value={formData.guarantor1Name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guarantor CNIC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="guarantor1CNIC"
                  required
                  value={formData.guarantor1CNIC || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="guarantor1Contact"
                  required
                  value={formData.guarantor1Contact || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="guarantor1Relation"
                  required
                  value={formData.guarantor1Relation || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Guarantor 2 (Optional) */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#F9C856] mb-4 pb-2 border-b-2 border-[#F9C856]/20">
              Guarantor 2 Information (Optional)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guarantor Name
                </label>
                <input
                  type="text"
                  name="guarantor2Name"
                  value={formData.guarantor2Name || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Guarantor CNIC
                </label>
                <input
                  type="text"
                  name="guarantor2CNIC"
                  value={formData.guarantor2CNIC || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="guarantor2Contact"
                  value={formData.guarantor2Contact || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Relation
                </label>
                <input
                  type="text"
                  name="guarantor2Relation"
                  value={formData.guarantor2Relation || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9C856] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-gradient-to-r from-[#F9C856] to-[#F9D98F] text-gray-900 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}