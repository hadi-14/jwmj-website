import { IFormField } from "@/types/forms";

// Define FormValue type locally if not available globally
type FormValue = string | number | boolean | File | null | undefined;

interface FormFieldProps {
  field: IFormField;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
}

export default function FormField({ field, value, error, onChange }: FormFieldProps) {
  const commonClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";

  const renderField = () => {
    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.fieldType}
            value={value as string | number | readonly string[] | undefined}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            className={`${commonClasses} ${errorClasses}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value as string | number | readonly string[] | undefined}
            onChange={(e) => onChange(e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value as string | number | readonly string[] | undefined}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            rows={4}
            className={`${commonClasses} ${errorClasses} resize-vertical`}
          />
        );

      case 'select':
        const options = Array.isArray(field.options)
          ? field.options
          : field.options ? JSON.parse(field.options) : [];
        return (
          <select
            value={value as string | number | readonly string[] | undefined}
            onChange={(e) => onChange(e.target.value)}
            className={`${commonClasses} ${errorClasses} bg-white`}
          >
            <option value="">Select an option</option>
            {options.map((opt: { value: string | number | readonly string[] | undefined; label: string }) => (
              <option key={opt.value as string} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <label className="text-slate-700">{field.fieldLabel}</label>
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0])}
            className={`${commonClasses} ${errorClasses} p-2`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      {field.fieldType !== 'checkbox' && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {field.fieldLabel}
          {field.isRequired && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      {renderField()}

      {field.helpText && (
        <p className="mt-2 text-sm text-slate-600">{field.helpText}</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
