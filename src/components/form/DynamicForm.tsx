import React, { useState, useEffect } from 'react';
import { Save, Send, CheckCircle2, AlertCircle, Info, Loader, FileText, ArrowLeft, Check, X } from 'lucide-react';

// FormField Component
const FormField = ({ field, value, error, onChange }: {
  field: any;
  value: any;
  error: string;
  onChange: (value: any) => void;
}) => {
  const getColumnWidthClass = () => {
    switch (field.columnWidth) {
      case 'full': return 'col-span-12';
      case 'half': return 'col-span-12 md:col-span-6';
      case 'third': return 'col-span-12 md:col-span-4';
      default: return 'col-span-12';
    }
  };

  const baseInputClass = `w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 ${
    error 
      ? 'border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-rose-500/10' 
      : 'border-slate-200 bg-white hover:border-slate-300 focus:border-[#038DCD] focus:ring-[#038DCD]/10'
  }`;

  const labelClass = `block text-sm font-bold text-slate-700 mb-2 ${field.isRequired ? "after:content-['*'] after:ml-1 after:text-rose-500" : ''}`;

  // Check if this is a yes/no question based on options
  const isYesNoQuestion = () => {
    if (field.fieldType !== 'select') return false;
    try {
      const options = typeof field.options === 'string' 
        ? JSON.parse(field.options) 
        : (field.options || []);
      
      if (options.length !== 2) return false;
      
      const values = options.map((opt: any) => opt.value.toLowerCase());
      return (values.includes('yes') && values.includes('no')) ||
             (values.includes('ہاں') && values.includes('نہیں'));
    } catch {
      return false;
    }
  };

  const renderYesNoToggle = () => {
    let options: any[] = [];
    try {
      options = typeof field.options === 'string' 
        ? JSON.parse(field.options) 
        : (field.options || []);
    } catch {
      options = [];
    }

    return (
      <div className="flex gap-3">
        {options.map((opt, idx) => {
          const isSelected = value === opt.value;
          const isYes = opt.value.toLowerCase() === 'yes' || opt.value === 'ہاں';
          
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                isSelected
                  ? isYes
                    ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isSelected && (isYes ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />)}
                <span>{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderField = () => {
    // Use Yes/No toggle for yes/no questions
    if (isYesNoQuestion()) {
      return renderYesNoToggle();
    }

    switch (field.fieldType) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={`${baseInputClass} min-h-[120px] resize-y`}
            rows={4}
          />
        );

      case 'select':
        let options: any[] = [];
        try {
          options = typeof field.options === 'string' 
            ? JSON.parse(field.options) 
            : (field.options || []);
        } catch (e) {
          options = [];
        }
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseInputClass} cursor-pointer`}
          >
            <option value="">منتخب کریں / Select...</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-[#038DCD] hover:bg-blue-50/50 transition-all cursor-pointer group">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => onChange(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded-lg border-2 border-slate-300 text-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/20 cursor-pointer transition-all"
              />
              {(value === true || value === 'true') && (
                <Check className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none" />
              )}
            </div>
            <span className="text-sm text-slate-700 leading-relaxed flex-1">
              {field.helpText || field.fieldLabel}
            </span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || 'example@email.com'}
            className={baseInputClass}
          />
        );

      case 'file':
        return (
          <div className="relative">
            <input
              type="file"
              onChange={(e) => onChange(e.target.files?.[0])}
              className={`${baseInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#038DCD]/10 file:text-[#038DCD] file:font-semibold hover:file:bg-[#038DCD]/20 file:cursor-pointer cursor-pointer`}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className={getColumnWidthClass()}>
      {field.fieldType !== 'checkbox' && (
        <label className={labelClass}>
          {field.fieldLabel}
        </label>
      )}
      
      {renderField()}
      
      {error && (
        <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-200">
          <p className="text-sm text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        </div>
      )}
      
      {!error && field.helpText && field.fieldType !== 'checkbox' && (
        <p className="mt-2 text-xs text-slate-500 flex items-start gap-1">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{field.helpText}</span>
        </p>
      )}
    </div>
  );
};

// Main DynamicForm Component
export default function DynamicForm({ formId, formType }: { formId?: string; formType?: string }) {
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (formId || formType) {
      fetchForm();
    }
  }, [formId, formType]);

  const fetchForm = async () => {
    try {
      setIsLoading(true);
      const endpoint = formId ? `/api/forms/${formId}` : `/api/forms/by-type/${formType}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch form');
      const response = await res.json();
      const formData = response.data || response;
      setForm(formData);
      initializeFormData(formData.fields);
    } catch (error) {
      setSubmitError('Failed to load form');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeFormData = (fields: any[]) => {
    const initial: Record<string, any> = {};
    fields.forEach(field => {
      initial[field.fieldName] = '';
    });
    setFormData(initial);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    form?.fields.forEach((field: any) => {
      if (field.isRequired && !formData[field.fieldName]) {
        newErrors[field.fieldName] = `${field.fieldLabel} is required`;
      }

      // Email validation
      if (field.fieldType === 'email' && formData[field.fieldName]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.fieldName])) {
          newErrors[field.fieldName] = 'Invalid email format';
        }
      }

      // Custom validation rules
      if (field.validationRule) {
        try {
          const rule = typeof field.validationRule === 'string'
            ? JSON.parse(field.validationRule)
            : field.validationRule;
          if (rule.minLength && formData[field.fieldName].length < rule.minLength) {
            newErrors[field.fieldName] = `Minimum ${rule.minLength} characters required`;
          }
          if (rule.maxLength && formData[field.fieldName].length > rule.maxLength) {
            newErrors[field.fieldName] = `Maximum ${rule.maxLength} characters allowed`;
          }
        } catch { }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('براہ کرم تمام ضروری فیلڈز پُر کریں / Please fill all required fields');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form?.id,
          fieldValues: formData,
          status: 'submitted'
        })
      });

      if (!res.ok) throw new Error('Failed to submit form');

      const result = await res.json();
      setSubmitMessage('فارم کامیابی سے جمع ہو گیا! / Form submitted successfully!');

      setTimeout(() => {
        window.location.href = '/forms';
      }, 2000);
    } catch (error) {
      setSubmitError('Failed to submit form. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');
    
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form?.id,
          fieldValues: formData,
          status: 'draft'
        })
      });

      if (!res.ok) throw new Error('Failed to save draft');
      setSubmitMessage('ڈرافٹ محفوظ ہو گیا / Draft saved successfully!');
      
      setTimeout(() => setSubmitMessage(''), 3000);
    } catch (error) {
      setSubmitError('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#038DCD]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-2xl mb-4">
          <AlertCircle className="w-10 h-10 text-rose-600" />
        </div>
        <p className="text-rose-600 text-xl font-bold mb-2">Form not found</p>
        <p className="text-slate-500">The form you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const filledFields = Object.keys(formData).filter(key => formData[key]).length;
  const totalFields = form.fields.length;
  const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Messages */}
      {submitMessage && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-emerald-800 font-semibold flex-1">{submitMessage}</p>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-4 bg-gradient-to-r from-rose-50 to-red-50 border-2 border-rose-200 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-rose-800 font-semibold flex-1">{submitError}</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-700">
            Form Completion Progress
          </span>
          <span className="text-sm font-bold text-[#038DCD]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {filledFields} of {totalFields} fields completed
        </p>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border-2 border-slate-200">
        <div className="grid grid-cols-12 gap-6">
          {form.fields
            .sort((a: any, b: any) => a.fieldOrder - b.fieldOrder)
            .map((field: any, index: number) => (
              <div
                key={field.id}
                className="contents animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
              >
                <FormField
                  field={field}
                  value={formData[field.fieldName] || ''}
                  error={errors[field.fieldName]}
                  onChange={(value) => handleInputChange(field.fieldName, value)}
                />
              </div>
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="px-6 py-3.5 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-white hover:border-[#038DCD] hover:text-[#038DCD] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Draft / ڈرافٹ محفوظ کریں</span>
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white font-bold rounded-xl hover:from-[#0369A1] hover:to-[#038DCD] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting... / جمع ہو رہا ہے</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Submit Form / فارم جمع کریں</span>
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 pt-4 border-t-2 border-slate-200">
          <div className="flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your information is secure and will be kept confidential / آپ کی معلومات محفوظ اور خفیہ رکھی جائیں گی
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}