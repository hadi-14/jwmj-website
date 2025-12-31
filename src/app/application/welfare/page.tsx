'use client';

import { useState } from 'react';
import { createWelfareApplication } from '@/actions/welfareApplication';
import { WelfareApplicationFormData } from '@/types/forms';
import { useRouter } from 'next/navigation';

export default function WelfareApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<WelfareApplicationFormData>>({
    applicationDate: new Date(),
    hasDocuments: false,
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
      const result = await createWelfareApplication(formData as WelfareApplicationFormData);
      
      if (result.success) {
        alert('Application submitted successfully!');
        router.push('/applications/welfare');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const showMedicalFields = formData.assistanceType === 'medical';
  const showEducationFields = formData.assistanceType === 'education';

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-t-3xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Welfare Assistance Application</h1>
          <p className="text-sm opacity-90">Support for Medical, Education, and Other Needs</p>
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
            <h2 className="text-xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="maritalStatus"
                  required
                  value={formData.maritalStatus || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  Profession/Skill <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="professionOrSkill"
                  required
                  value={formData.professionOrSkill || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Household Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200">
              Household Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Assistance Required */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200">
              Assistance Required
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type of Assistance <span className="text-red-500">*</span>
                </label>
                <select
                  name="assistanceType"
                  required
                  value={formData.assistanceType || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="medical">Medical</option>
                  <option value="education">Education</option>
                  <option value="marriage">Marriage</option>
                  <option value="housing">Housing</option>
                  <option value="monthly_help">Monthly Help</option>
                  <option value="emergency">Emergency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Urgency Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="urgencyLevel"
                  required
                  value={formData.urgencyLevel || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Amount (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="estimatedAmount"
                  required
                  min="0"
                  value={formData.estimatedAmount || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assistance Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="assistanceDescription"
                  required
                  rows={4}
                  placeholder="Please describe your situation and assistance needed in detail"
                  value={formData.assistanceDescription || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Medical Information (Conditional) */}
          {showMedicalFields && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200">
                Medical Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relation to Patient
                  </label>
                  <input
                    type="text"
                    name="patientRelation"
                    value={formData.patientRelation || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    name="hospitalName"
                    value={formData.hospitalName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medical Condition
                  </label>
                  <textarea
                    name="medicalCondition"
                    rows={3}
                    value={formData.medicalCondition || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Medical Cost (PKR)
                  </label>
                  <input
                    type="number"
                    name="estimatedMedicalCost"
                    min="0"
                    value={formData.estimatedMedicalCost || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Education Information (Conditional) */}
          {showEducationFields && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200">
                Education Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relation to Student
                  </label>
                  <input
                    type="text"
                    name="studentRelation"
                    value={formData.studentRelation || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Institution Name
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    value={formData.institutionName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course/Class
                  </label>
                  <input
                    type="text"
                    name="courseOrClass"
                    value={formData.courseOrClass || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fee Amount (PKR)
                  </label>
                  <input
                    type="number"
                    name="feeAmount"
                    min="0"
                    value={formData.feeAmount || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-emerald-600 mb-4 pb-2 border-b-2 border-emerald-200">
              Supporting Documents
            </h2>
            
            <div>
              <label className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  name="hasDocuments"
                  checked={formData.hasDocuments}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-500 border-gray-300 rounded focus:ring-emerald-400"
                />
                <span className="text-sm font-semibold text-gray-700">I have supporting documents</span>
              </label>
              
              {formData.hasDocuments && (
                <div className="ml-7">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    List of Documents
                  </label>
                  <textarea
                    name="documentsList"
                    rows={3}
                    placeholder="e.g., Medical reports, prescriptions, fee vouchers, etc."
                    value={formData.documentsList || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Note: Please bring original documents when visiting the office
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}