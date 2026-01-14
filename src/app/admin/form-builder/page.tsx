'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Download, X, GripVertical, Save, Edit, Copy, AlertCircle, CheckCircle2, FileText, Clock, Users, Settings, ArrowLeft, Loader, Search, Filter } from 'lucide-react';
import type { IForm, IFormField } from '@/types/forms';
import DynamicForm from '@/components/form/DynamicForm';

// Local component types for form building
interface Field {
  id?: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file' | 'number';
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  validationRule?: { minLength?: number; maxLength?: number };
  columnWidth?: 'full' | 'half' | 'third';
  fieldOrder?: number;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  formType: string;
  fields: Field[];
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

export default function FormBuilder() {
  const [forms, setForms] = useState<FormData[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewForm, setPreviewForm] = useState<FormData | null>(null);
  const [formConfig, setFormConfig] = useState({
    name: '',
    description: '',
    formType: '',
    fields: [] as Field[]
  });
  const [currentField, setCurrentField] = useState<Partial<Field>>({
    columnWidth: 'full',
    isRequired: false
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<IForm[]>([]);

  // Fetch all forms on component mount
  useEffect(() => {
    fetchForms();
    fetchTemplates();
  }, []);

  // Filter forms whenever search or filter changes
  useEffect(() => {
    filterForms();
  }, [searchQuery, filterType, forms]);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/forms');
      if (!res.ok) throw new Error('Failed to fetch forms');
      
      const response = await res.json();
      const formsData = response.data || [];
      setForms(formsData);
    } catch (error) {
      console.error('Error fetching forms:', error);
      showNotification('error', 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/forms/templates');
      if (res.ok) {
        const response = await res.json();
        const templatesData: IForm[] = response.data || [];
        setTemplates(templatesData);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const filterForms = () => {
    let filtered = [...forms];
    
    if (searchQuery) {
      filtered = filtered.filter(form => 
        form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.formType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(form => form.formType === filterType);
    }
    
    setFilteredForms(filtered);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const parseFieldOptions = (options: string | null): { value: string; label: string }[] | undefined => {
    if (!options) return undefined;
    try {
      return typeof options === 'string' ? JSON.parse(options) : options;
    } catch {
      return undefined;
    }
  };

  const parseValidationRule = (rule: string | null): { minLength?: number; maxLength?: number } | undefined => {
    if (!rule) return undefined;
    try {
      return typeof rule === 'string' ? JSON.parse(rule) : rule;
    } catch {
      return undefined;
    }
  };

  const convertTemplateFieldToLocal = (field: IFormField): Field => {
    return {
      id: field.id,
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType as Field['fieldType'],
      isRequired: field.isRequired,
      placeholder: field.placeholder || undefined,
      helpText: field.helpText || undefined,
      options: parseFieldOptions(field.options),
      validationRule: parseValidationRule(field.validationRule),
      columnWidth: (field.columnWidth as Field['columnWidth']) || 'full',
      fieldOrder: field.fieldOrder,
    };
  };

  const addOrUpdateField = () => {
    if (!currentField.fieldName || !currentField.fieldLabel || !currentField.fieldType) {
      showNotification('error', 'Field name, label, and type are required');
      return;
    }

    setFormConfig(prev => {
      const newFields = [...prev.fields];
      
      if (editingFieldIndex !== null) {
        newFields[editingFieldIndex] = { ...currentField, fieldOrder: editingFieldIndex } as Field;
      } else {
        newFields.push({ ...currentField, fieldOrder: prev.fields.length } as Field);
      }
      
      return { ...prev, fields: newFields };
    });
    
    setCurrentField({ columnWidth: 'full', isRequired: false });
    setEditingFieldIndex(null);
    showNotification('success', editingFieldIndex !== null ? 'Field updated' : 'Field added');
  };

  const editField = (index: number) => {
    setCurrentField(formConfig.fields[index]);
    setEditingFieldIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeField = (index: number) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index).map((field, idx) => ({
        ...field,
        fieldOrder: idx
      }))
    }));
    showNotification('success', 'Field removed');
  };

  const duplicateField = (index: number) => {
    const fieldToDuplicate = { ...formConfig.fields[index] };
    delete fieldToDuplicate.id;
    fieldToDuplicate.fieldName = `${fieldToDuplicate.fieldName}_copy`;
    fieldToDuplicate.fieldLabel = `${fieldToDuplicate.fieldLabel} (Copy)`;
    
    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, { ...fieldToDuplicate, fieldOrder: prev.fields.length }]
    }));
    showNotification('success', 'Field duplicated successfully');
  };

  const saveForm = async () => {
    if (!formConfig.name || !formConfig.formType) {
      showNotification('error', 'Form name and type are required');
      return;
    }

    if (formConfig.fields.length === 0) {
      showNotification('error', 'At least one field is required');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: formConfig.name,
        description: formConfig.description,
        formType: formConfig.formType,
        fields: formConfig.fields.map(field => ({
          ...field,
          options: field.options ? JSON.stringify(field.options) : null,
          validationRule: field.validationRule ? JSON.stringify(field.validationRule) : null
        })),
        version: 1
      };

      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save form');
      }

      showNotification('success', 'Form created successfully!');
      resetForm();
      await fetchForms();
    } catch (error: any) {
      console.error('Save error:', error);
      showNotification('error', error.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete form');

      showNotification('success', 'Form deleted successfully');
      await fetchForms();
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('error', 'Failed to delete form');
    }
  };

  const resetForm = () => {
    setFormConfig({ name: '', description: '', formType: '', fields: [] });
    setShowBuilder(false);
    setCurrentField({ columnWidth: 'full', isRequired: false });
    setEditingFieldIndex(null);
  };

  const loadTemplate = (template: IForm) => {
    const parsedFields: Field[] = template.fields.map(convertTemplateFieldToLocal);

    setFormConfig({
      name: template.name,
      description: template.description || '',
      formType: template.formType,
      fields: parsedFields,
    });
    
    setShowTemplateSelection(false);
    setShowBuilder(true);
    setCurrentField({ columnWidth: 'full', isRequired: false });
    showNotification('success', `Template "${template.name}" loaded successfully`);
  };

  const startFromScratch = () => {
    setFormConfig({ name: '', description: '', formType: '', fields: [] });
    setShowTemplateSelection(false);
    setShowBuilder(true);
    setCurrentField({ columnWidth: 'full', isRequired: false });
  };

  const openPreview = (form: FormData) => {
    setPreviewForm(form);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewForm(null);
  };

  const exportForm = async (formId: string) => {
    try {
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      const dataStr = JSON.stringify(form, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.formType}_${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      showNotification('success', 'Form exported successfully');
    } catch (error) {
      showNotification('error', 'Failed to export form');
    }
  };

  // Get unique form types for filter
  const formTypes = ['all', ...new Set(forms.map(f => f.formType))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-[#038DCD]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Form Builder</h1>
              </div>
              <p className="text-blue-100">Create and manage dynamic forms for Jamat members</p>
            </div>
            <button
              onClick={() => setShowTemplateSelection(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 hover:bg-white text-[#038DCD] rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="w-5 h-5" /> Create New Form
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border-2 animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}>
                {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6 text-white" /> : <AlertCircle className="w-6 h-6 text-white" />}
              </div>
              <p className={`font-semibold ${notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {notification.message}
              </p>
            </div>
          </div>
        )}

        {/* Template Selection Modal */}
        {showTemplateSelection && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Starting Point</h2>
                <p className="text-slate-600">Select a template or start from scratch</p>
              </div>
              <button onClick={() => setShowTemplateSelection(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            {templates.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="group border-2 border-slate-200 rounded-xl p-6 hover:border-[#038DCD] hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-blue-50/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#038DCD] to-[#0369A1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 flex-1">{template.name}</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 min-h-[40px] line-clamp-2">
                        {template.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-semibold text-slate-500">
                            {template.fields?.length || 0} fields
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded">
                            {template.formType}
                          </span>
                        </div>
                        <span className="text-[#038DCD] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                          Use →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-slate-200 pt-6">
                  <button
                    onClick={startFromScratch}
                    className="w-full md:w-auto px-8 py-3 border-2 border-[#038DCD] text-[#038DCD] rounded-xl hover:bg-[#038DCD] hover:text-white transition-all duration-200 font-bold"
                  >
                    Start from Scratch
                  </button>
                </div>
              </>
            )}

            {templates.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-semibold mb-2">No templates available</p>
                <p className="text-sm text-slate-500 mb-6">Start by creating your first form from scratch</p>
                <button
                  onClick={startFromScratch}
                  className="px-8 py-3 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white rounded-xl hover:shadow-lg font-bold transition-all"
                >
                  Start from Scratch
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form Builder */}
        {showBuilder && (
          <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Build Your Form</h2>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {/* Form Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Form Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formConfig.name}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 transition-all"
                  placeholder="e.g., Membership Form"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Form Type <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formConfig.formType}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, formType: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 transition-all"
                  placeholder="e.g., membership, widow_female"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 mb-2">Description</label>
                <textarea
                  value={formConfig.description}
                  onChange={(e) => setFormConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 transition-all min-h-[100px]"
                  placeholder="Describe what this form is for..."
                  rows={3}
                />
              </div>
            </div>

            {/* Field Builder */}
            <div className="border-t-2 border-slate-200 pt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#038DCD]" />
                Form Fields
              </h3>

              <div className="bg-gradient-to-br from-blue-50/50 to-amber-50/50 p-6 rounded-xl border-2 border-slate-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      Field Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentField.fieldName || ''}
                      onChange={(e) => setCurrentField(prev => ({ ...prev, fieldName: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all text-sm"
                      placeholder="e.g., firstName"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      Field Label <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentField.fieldLabel || ''}
                      onChange={(e) => setCurrentField(prev => ({ ...prev, fieldLabel: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all text-sm"
                      placeholder="e.g., First Name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">
                      Field Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={currentField.fieldType || ''}
                      onChange={(e) => setCurrentField(prev => ({ ...prev, fieldType: e.target.value as any }))}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all text-sm cursor-pointer"
                    >
                      <option value="">Select Type</option>
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="file">File</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Placeholder</label>
                    <input
                      type="text"
                      value={currentField.placeholder || ''}
                      onChange={(e) => setCurrentField(prev => ({ ...prev, placeholder: e.target.value }))}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all text-sm"
                      placeholder="Enter placeholder text"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Column Width</label>
                    <select
                      value={currentField.columnWidth || 'full'}
                      onChange={(e) => setCurrentField(prev => ({ ...prev, columnWidth: e.target.value as any }))}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all text-sm cursor-pointer"
                    >
                      <option value="full">Full Width</option>
                      <option value="half">Half Width</option>
                      <option value="third">Third Width</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Help Text</label>
                  <input
                    type="text"
                    value={currentField.helpText || ''}
                    onChange={(e) => setCurrentField(prev => ({ ...prev, helpText: e.target.value }))}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all text-sm"
                    placeholder="Additional help text for this field"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentField.isRequired || false}
                      onChange={(e) => setCurrentField(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="w-5 h-5 rounded border-2 border-slate-300 text-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/20 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-700">Required Field</span>
                  </label>
                  <button
                    onClick={addOrUpdateField}
                    className="px-6 py-2 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                  >
                    {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                  </button>
                </div>
              </div>

              {/* Fields List */}
              {formConfig.fields.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-700">
                      {formConfig.fields.length} Field{formConfig.fields.length !== 1 ? 's' : ''} Added
                    </h4>
                  </div>
                  {formConfig.fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all group">
                      <div className="cursor-move text-slate-400 hover:text-slate-600">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 truncate">{field.fieldLabel}</p>
                          {field.isRequired && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded">Required</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">{field.fieldType}</span>
                          {' • '}
                          <span>{field.columnWidth}</span>
                          {field.placeholder && (
                            <>
                              {' • '}
                              <span className="italic">"{field.placeholder}"</span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => duplicateField(index)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          title="Duplicate field"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editField(index)}
                          className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-colors"
                          title="Edit field"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeField(index)}
                          className="p-2 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                          title="Delete field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formConfig.fields.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No fields added yet</p>
                  <p className="text-sm text-slate-400 mt-1">Start by adding your first field above</p>
                </div>
              )}
            </div>

            {/* Save Form */}
            <div className="flex gap-4 mt-8 pt-6 border-t-2">
              <button
                onClick={saveForm}
                disabled={isSaving || formConfig.fields.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Form
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                disabled={isSaving}
                className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-bold disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        {!showBuilder && !showTemplateSelection && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#038DCD]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Total Forms</p>
                    <p className="text-2xl font-bold text-slate-900">{forms.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Active Forms</p>
                    <p className="text-2xl font-bold text-slate-900">{forms.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase">Last Updated</p>
                    <p className="text-sm font-bold text-slate-900">
                      {forms.length > 0 ? new Date(forms[0].updatedAt || forms[0].createdAt || '').toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forms by name, description, or type..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 cursor-pointer transition-all"
                  >
                    {formTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map(form => (
                <div key={form.id} className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 hover:shadow-lg hover:border-[#038DCD]/50 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#038DCD] to-[#0369A1] rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{form.name}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{form.description || 'No description provided'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Type:</span>
                      <span className="text-xs font-bold text-[#038DCD] bg-blue-50 px-2 py-1 rounded">
                        {form.formType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Fields:</span>
                      <span className="text-xs font-bold text-slate-700">{form.fields.length}</span>
                    </div>
                    {form.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Created:</span>
                        <span className="text-xs text-slate-600">{new Date(form.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openPreview(form)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </button>
                    <button
                      onClick={() => exportForm(form.id)}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                      title="Export form"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteForm(form.id)}
                      className="px-3 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
                      title="Delete form"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredForms.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 text-lg font-semibold mb-2">
                  {searchQuery || filterType !== 'all' ? 'No forms match your filters' : 'No forms created yet'}
                </p>
                <p className="text-slate-500 mb-6">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first form'}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button
                    onClick={() => setShowTemplateSelection(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white rounded-xl hover:shadow-lg font-semibold transition-all"
                  >
                    Create Your First Form
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Preview Modal using DynamicForm Component */}
        {showPreview && previewForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-amber-50/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white p-6 flex justify-between items-center rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Form Preview</h2>
                    <p className="text-blue-100 text-sm mt-1">{previewForm.name}</p>
                  </div>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                {/* Preview Info Banner */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-900">Preview Mode</p>
                      <p className="text-xs text-blue-700">This is a preview of how the form will appear to users. Form submissions are disabled in preview mode.</p>
                    </div>
                  </div>
                </div>

                {/* Form Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Fields</p>
                    <p className="text-xl font-bold text-slate-900">{previewForm.fields.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Required</p>
                    <p className="text-xl font-bold text-slate-900">
                      {previewForm.fields.filter(f => f.isRequired).length}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border-2 border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Est. Time</p>
                    <p className="text-xl font-bold text-slate-900">
                      {Math.ceil(previewForm.fields.length / 3)} mins
                    </p>
                  </div>
                </div>

                {/* Use DynamicForm Component for Preview */}
                <DynamicForm formId={previewForm.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}