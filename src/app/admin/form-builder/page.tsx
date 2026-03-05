'use client';
import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Eye, Download, X, GripVertical, Save, Edit, Copy,
  AlertCircle, CheckCircle2, FileText, Users, Settings, ArrowLeft,
  Loader, Search, Filter, Upload, FileUp, ExternalLink, FilePlus,
  Sparkles, FolderOpen,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { IForm, IFormField } from '@/types/forms';
import DynamicForm from '@/components/form/DynamicForm';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Field {
  id?: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'email' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file' | 'number';
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { value: string; label: string }[] | string;
  validationRule?: { minLength?: number; maxLength?: number } | string;
  columnWidth?: 'full' | 'half' | 'third';
  fieldOrder?: number;
}

interface PdfFile {
  originalName: string;
  fileName: string;
  url: string;
  size: number;
  uploadedAt: string;
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
  pdfFile?: PdfFile;
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide uppercase">
      {children}{required && <span className="text-[#038DCD] ml-0.5">*</span>}
    </label>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900
        placeholder:text-slate-400 focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10
        transition-all duration-150 ${className}`}
    />
  );
}

function Select({ className = '', children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900
        focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10
        transition-all duration-150 cursor-pointer ${className}`}
    >
      {children}
    </select>
  );
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900
        placeholder:text-slate-400 focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10
        transition-all duration-150 resize-none ${className}`}
    />
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 ${accent ? 'bg-[#038DCD] border-[#038DCD] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-white/20' : 'bg-[#038DCD]/8'}`}>
        <Icon className={`w-5 h-5 ${accent ? 'text-white' : 'text-[#038DCD]'}`} />
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${accent ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-2xl font-bold leading-none ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
    name: '', description: '', formType: '', fields: [] as Field[], pdfFile: undefined as PdfFile | undefined
  });
  const [currentField, setCurrentField] = useState<Partial<Field>>({ columnWidth: 'full', isRequired: false });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<IForm[]>([]);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/forms');
      if (!res.ok) throw new Error('Failed to fetch forms');
      const response = await res.json();
      setForms(response.data || []);
    } catch { showNotification('error', 'Failed to load forms'); }
    finally { setIsLoading(false); }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/forms/templates');
      if (res.ok) { const r = await res.json(); setTemplates(r.data || []); }
    } catch { /* silent */ }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => { fetchForms(); fetchTemplates(); }, []);

  useEffect(() => {
    let filtered = [...forms];
    if (searchQuery) filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.formType.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filterType !== 'all') filtered = filtered.filter(f => f.formType === filterType);
    setFilteredForms(filtered);
  }, [searchQuery, filterType, forms]);

  const parseFieldOptions = (options: string | null) => {
    if (!options) return undefined;
    try { return typeof options === 'string' ? JSON.parse(options) : options; } catch { return undefined; }
  };
  const parseValidationRule = (rule: string | null) => {
    if (!rule) return undefined;
    try { return typeof rule === 'string' ? JSON.parse(rule) : rule; } catch { return undefined; }
  };
  const convertTemplateFieldToLocal = (field: IFormField): Field => ({
    id: field.id, fieldName: field.fieldName, fieldLabel: field.fieldLabel,
    fieldType: field.fieldType as Field['fieldType'], isRequired: field.isRequired,
    placeholder: field.placeholder || undefined, helpText: field.helpText || undefined,
    options: parseFieldOptions(field.options), validationRule: parseValidationRule(field.validationRule),
    columnWidth: (field.columnWidth as Field['columnWidth']) || 'full', fieldOrder: field.fieldOrder,
  });

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { showNotification('error', 'Please upload a PDF file'); return; }
    setIsUploadingPdf(true); setUploadedFileName(file.name);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/forms/upload-pdf', { method: 'POST', body: fd });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to process PDF');
      setFormConfig({ name: result.data.formName, description: result.data.description, formType: result.data.formType, fields: result.data.fields, pdfFile: result.data.pdfFile });
      setShowTemplateSelection(false); setShowBuilder(true);
      showNotification('success', `${result.data.fields.length} fields extracted from PDF`);
    } catch (e: unknown) { showNotification('error', e instanceof Error ? e.message : 'Failed to process PDF'); }
    finally { setIsUploadingPdf(false); event.target.value = ''; }
  };

  const downloadFormPdf = async (formId: string) => {
    try {
      showNotification('success', 'Generating PDF...');
      const res = await fetch(`/api/forms/generate-pdf/${formId}`);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `form_${formId}.pdf`;
      document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
      showNotification('success', 'PDF downloaded');
    } catch (e: unknown) { showNotification('error', e instanceof Error ? e.message : 'Failed'); }
  };

  const addOrUpdateField = () => {
    if (!currentField.fieldName || !currentField.fieldLabel || !currentField.fieldType) {
      showNotification('error', 'Field name, label, and type are required'); return;
    }
    setFormConfig(prev => {
      const newFields = [...prev.fields];
      if (editingFieldIndex !== null) newFields[editingFieldIndex] = { ...currentField, fieldOrder: editingFieldIndex } as Field;
      else newFields.push({ ...currentField, fieldOrder: prev.fields.length } as Field);
      return { ...prev, fields: newFields };
    });
    setCurrentField({ columnWidth: 'full', isRequired: false }); setEditingFieldIndex(null);
    showNotification('success', editingFieldIndex !== null ? 'Field updated' : 'Field added');
  };

  const editField = (index: number) => { setCurrentField(formConfig.fields[index]); setEditingFieldIndex(index); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const removeField = (index: number) => { setFormConfig(prev => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index).map((f, i) => ({ ...f, fieldOrder: i })) })); };
  const duplicateField = (index: number) => {
    const f = { ...formConfig.fields[index] }; delete f.id;
    f.fieldName = `${f.fieldName}_copy`; f.fieldLabel = `${f.fieldLabel} (Copy)`;
    setFormConfig(prev => ({ ...prev, fields: [...prev.fields, { ...f, fieldOrder: prev.fields.length }] }));
    showNotification('success', 'Field duplicated');
  };

  const saveForm = async () => {
    if (!formConfig.name || !formConfig.formType) { showNotification('error', 'Form name and type are required'); return; }
    if (formConfig.fields.length === 0) { showNotification('error', 'At least one field is required'); return; }
    setIsSaving(true);
    try {
      const payload = {
        name: formConfig.name, description: formConfig.description, formType: formConfig.formType,
        fields: formConfig.fields.map(f => ({
          ...f,
          options: f.options ? (typeof f.options === 'string' ? f.options : JSON.stringify(f.options)) : null,
          validationRule: f.validationRule ? (typeof f.validationRule === 'string' ? f.validationRule : JSON.stringify(f.validationRule)) : null
        })),
        version: 1, pdfFileUrl: formConfig.pdfFile?.url, pdfFileName: formConfig.pdfFile?.originalName
      };
      const res = await fetch('/api/forms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save');
      showNotification('success', 'Form created successfully!'); resetForm(); await fetchForms();
    } catch (e: unknown) { showNotification('error', e instanceof Error ? e.message : 'Failed to save'); }
    finally { setIsSaving(false); }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Delete this form? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      showNotification('success', 'Form deleted'); await fetchForms();
    } catch { showNotification('error', 'Failed to delete form'); }
  };

  const resetForm = () => {
    setFormConfig({ name: '', description: '', formType: '', fields: [], pdfFile: undefined });
    setShowBuilder(false); setCurrentField({ columnWidth: 'full', isRequired: false });
    setEditingFieldIndex(null); setUploadedFileName('');
  };

  const loadTemplate = (template: IForm) => {
    setFormConfig({ name: template.name, description: template.description || '', formType: template.formType, fields: template.fields.map(convertTemplateFieldToLocal), pdfFile: undefined });
    setShowTemplateSelection(false); setShowBuilder(true); setCurrentField({ columnWidth: 'full', isRequired: false });
    showNotification('success', `Template "${template.name}" loaded`);
  };

  const exportForm = async (formId: string) => {
    const form = forms.find(f => f.id === formId); if (!form) return;
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${form.formType}_${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
    showNotification('success', 'Form exported');
  };

  const formTypes = ['all', ...new Set(forms.map(f => f.formType))];

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-10 h-10 mx-auto mb-3">
          <div className="absolute inset-0 border-2 border-[#038DCD]/20 rounded-full" />
          <div className="absolute inset-0 border-2 border-[#038DCD] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium">Loading forms...</p>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">



      {/* ── Toast Notification ── */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border
          ${notification.type === 'success' ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-white border-red-200 text-red-800'}`}
          style={{ animation: 'slideIn 0.2s ease' }}>
          {notification.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">

        {/* ══════════════════════════════════════════════════════════
            TEMPLATE SELECTION MODAL
        ══════════════════════════════════════════════════════════ */}
        {showTemplateSelection && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create New Form</h2>
                <p className="text-sm text-slate-500 mt-0.5">Start from a template, upload a PDF, or build from scratch</p>
              </div>
              <button onClick={() => setShowTemplateSelection(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 space-y-7">
              {/* PDF Upload */}
              <div className="rounded-xl border border-dashed border-[#038DCD]/30 bg-[#038DCD]/[0.03] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#038DCD]/10 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-[#038DCD]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Import from PDF</h3>
                    <p className="text-sm text-slate-500 mb-4">Upload an existing PDF form — we&apos;ll automatically extract all fields.</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#038DCD] hover:bg-[#0278b0] text-white rounded-lg font-semibold text-sm cursor-pointer transition-colors">
                      <FileUp className="w-4 h-4" />
                      {isUploadingPdf ? 'Processing…' : 'Choose PDF'}
                      <input type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={isUploadingPdf} className="hidden" />
                    </label>
                    {isUploadingPdf && (
                      <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Loader className="w-3.5 h-3.5 animate-spin text-[#038DCD]" />
                        Processing <span className="font-medium text-slate-700">{uploadedFileName}</span>…
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Templates */}
              {templates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#038DCD]" />
                    <h3 className="font-semibold text-slate-900 text-sm">Templates</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{templates.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((t) => (
                      <button key={t.id} onClick={() => loadTemplate(t)}
                        className="text-left group border border-slate-200 hover:border-[#038DCD]/40 hover:shadow-md rounded-xl p-4 transition-all bg-white">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#038DCD]/10 flex items-center justify-center transition-colors shrink-0">
                            <FileText className="w-4 h-4 text-slate-600 group-hover:text-[#038DCD]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{t.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500">{t.fields?.length || 0} fields</span>
                          <span className="text-xs font-semibold text-[#038DCD] flex items-center gap-1">
                            Use template <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scratch */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">Prefer to start empty?</p>
                <button onClick={() => { setFormConfig({ name: '', description: '', formType: '', fields: [], pdfFile: undefined }); setShowTemplateSelection(false); setShowBuilder(true); setCurrentField({ columnWidth: 'full', isRequired: false }); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Start from Scratch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            FORM BUILDER
        ══════════════════════════════════════════════════════════ */}
        {showBuilder && (
          <div className="space-y-5 mb-8">
            {/* Builder nav */}
            <div className="flex items-center justify-between">
              <button onClick={resetForm} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to forms
              </button>
              <div className="flex gap-2">
                <button onClick={resetForm} disabled={isSaving}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors">
                  Cancel
                </button>
                <button onClick={saveForm} disabled={isSaving || formConfig.fields.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#038DCD] hover:bg-[#0278b0] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm shadow-[#038DCD]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Save className="w-3.5 h-3.5" /> Save Form</>}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Left column: Form config + field builder */}
              <div className="lg:col-span-3 space-y-5">

                {/* PDF source badge */}
                {formConfig.pdfFile && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#038DCD]/5 border border-[#038DCD]/20 rounded-xl text-sm">
                    <FileText className="w-4 h-4 text-[#038DCD] shrink-0" />
                    <span className="font-medium text-slate-700 flex-1 truncate">{formConfig.pdfFile.originalName}</span>
                    <span className="text-xs text-slate-500">{(formConfig.pdfFile.size / 1024).toFixed(1)} KB</span>
                    <a href={formConfig.pdfFile.url} target="_blank" rel="noopener noreferrer"
                      className="text-[#038DCD] hover:text-[#0260a8] transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Form details card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-base mb-5 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#038DCD]" /> Form Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label required>Form Name</Label>
                      <Input value={formConfig.name} onChange={(e) => setFormConfig(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Membership Application" />
                    </div>
                    <div>
                      <Label required>Form Type</Label>
                      <Input value={formConfig.formType} onChange={(e) => setFormConfig(p => ({ ...p, formType: e.target.value }))} placeholder="e.g., membership" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea value={formConfig.description} onChange={(e) => setFormConfig(p => ({ ...p, description: e.target.value }))} placeholder="What is this form for?" rows={2} />
                    </div>
                  </div>
                </div>

                {/* Add field card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 text-base mb-5 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#038DCD]" />
                    {editingFieldIndex !== null ? 'Edit Field' : 'Add Field'}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label required>Field Name</Label>
                      <Input value={currentField.fieldName || ''} onChange={(e) => setCurrentField(p => ({ ...p, fieldName: e.target.value }))} placeholder="firstName" />
                    </div>
                    <div>
                      <Label required>Label</Label>
                      <Input value={currentField.fieldLabel || ''} onChange={(e) => setCurrentField(p => ({ ...p, fieldLabel: e.target.value }))} placeholder="First Name" />
                    </div>
                    <div>
                      <Label required>Type</Label>
                      <Select value={currentField.fieldType || ''} onChange={(e) => setCurrentField(p => ({ ...p, fieldType: e.target.value as Field['fieldType'] }))}>
                        <option value="">Select type</option>
                        {['text', 'email', 'number', 'date', 'textarea', 'select', 'checkbox', 'file'].map(t => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Placeholder</Label>
                      <Input value={currentField.placeholder || ''} onChange={(e) => setCurrentField(p => ({ ...p, placeholder: e.target.value }))} placeholder="Placeholder text" />
                    </div>
                    <div>
                      <Label>Column Width</Label>
                      <Select value={currentField.columnWidth || 'full'} onChange={(e) => setCurrentField(p => ({ ...p, columnWidth: e.target.value as Field['columnWidth'] }))}>
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                        <option value="third">Third Width</option>
                      </Select>
                    </div>
                  </div>
                  <div className="mb-5">
                    <Label>Help Text</Label>
                    <Input value={currentField.helpText || ''} onChange={(e) => setCurrentField(p => ({ ...p, helpText: e.target.value }))} placeholder="Optional help text shown below the field" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div className={`w-9 h-5 rounded-full transition-colors ${currentField.isRequired ? 'bg-[#038DCD]' : 'bg-slate-200'}`}
                        onClick={() => setCurrentField(p => ({ ...p, isRequired: !p.isRequired }))}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm m-0.5 transition-transform ${currentField.isRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">Required field</span>
                    </label>
                    <div className="flex gap-2">
                      {editingFieldIndex !== null && (
                        <button onClick={() => { setCurrentField({ columnWidth: 'full', isRequired: false }); setEditingFieldIndex(null); }}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                          Cancel
                        </button>
                      )}
                      <button onClick={addOrUpdateField}
                        className="px-5 py-2 bg-[#038DCD] hover:bg-[#0278b0] text-white rounded-lg text-sm font-semibold transition-colors">
                        {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: Fields list */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-4">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-slate-900 text-base">Fields</h2>
                    <span className="px-2.5 py-1 bg-[#038DCD]/10 text-[#038DCD] text-xs font-bold rounded-full">
                      {formConfig.fields.length}
                    </span>
                  </div>

                  {formConfig.fields.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-1">No fields yet</p>
                      <p className="text-xs text-slate-400">Add fields using the form on the left</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                      {formConfig.fields.map((field, index) => (
                        <div key={index}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all group
                            ${editingFieldIndex === index ? 'border-[#038DCD]/40 bg-[#038DCD]/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                          <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{field.fieldLabel}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-400">{field.fieldType}</span>
                              {field.isRequired && <span className="text-[10px] font-semibold text-[#038DCD] bg-[#038DCD]/10 px-1.5 py-0.5 rounded">Required</span>}
                              {field.columnWidth !== 'full' && <span className="text-[10px] text-slate-400">{field.columnWidth}</span>}
                            </div>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => duplicateField(index)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-slate-700 transition-colors" title="Duplicate">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => editField(index)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-[#038DCD] transition-colors" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => removeField(index)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Remove">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            DASHBOARD VIEW
        ══════════════════════════════════════════════════════════ */}
        {!showBuilder && !showTemplateSelection && (
          <div className="space-y-8">

            {/* Stats row */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">Overview</h2>
              <button
                onClick={() => setShowTemplateSelection(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#038DCD] hover:bg-[#0278b0] text-white rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-[#038DCD]/20"
              >
                <Plus className="w-4 h-4" /> New Form
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="Total Forms" value={forms.length} accent />
              <StatCard icon={Users} label="Field Types Used" value={new Set(forms.flatMap(f => f.fields.map(fi => fi.fieldType))).size || 0} />
              <StatCard icon={FolderOpen} label="Form Types" value={formTypes.length - 1} />
              <StatCard icon={Settings} label="Total Fields" value={forms.reduce((a, f) => a + f.fields.length, 0)} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-sm font-bold text-slate-900 mb-5">Fields per Form</p>
                {forms.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={forms.slice(0, 6).map(f => ({ name: f.name.substring(0, 10), fields: f.fields.length }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis fontSize={11} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="fields" fill="#038DCD" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-44 flex items-center justify-center text-sm text-slate-400">No data yet</div>}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-sm font-bold text-slate-900 mb-5">Forms by Type</p>
                {formTypes.length > 1 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={formTypes.filter(t => t !== 'all').map(type => ({ name: type, value: forms.filter(f => f.formType === type).length }))}
                        cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {formTypes.filter(t => t !== 'all').map((_, i) => (
                          <Cell key={i} fill={['#038DCD', '#0260a8', '#64748b', '#94a3b8'][i % 4]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-44 flex items-center justify-center text-sm text-slate-400">No data yet</div>}
              </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search forms by name, description, or type…"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/10 transition-all" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#038DCD] transition-all cursor-pointer">
                  {formTypes.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
            </div>

            {/* Forms grid */}
            {filteredForms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredForms.map(form => (
                  <div key={form.id} className="bg-white rounded-2xl border border-slate-200 hover:border-[#038DCD]/30 hover:shadow-md transition-all group p-5">
                    {/* Card header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#038DCD]/8 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#038DCD]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm leading-tight">{form.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{form.description || 'No description'}</p>
                      </div>
                    </div>

                    {/* PDF badge */}
                    {form.pdfFile && (
                      <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                        <FilePlus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-slate-600 truncate flex-1">{form.pdfFile.originalName}</span>
                        <a href={form.pdfFile.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-slate-400 hover:text-[#038DCD] transition-colors">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg">
                        {form.formType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">{form.fields.length} fields</span>
                      {form.updatedAt && (
                        <span className="text-xs text-slate-400 ml-auto">
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setPreviewForm(form); setShowPreview(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-[#038DCD]/10 hover:text-[#038DCD] rounded-lg text-slate-600 text-xs font-semibold transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                      <button onClick={() => downloadFormPdf(form.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => exportForm(form.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors" title="Export JSON">
                        <FileUp className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteForm(form.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-700 mb-1">
                  {searchQuery || filterType !== 'all' ? 'No forms match your search' : 'No forms yet'}
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  {searchQuery || filterType !== 'all' ? 'Try adjusting your filters' : 'Create your first form to get started'}
                </p>
                {!searchQuery && filterType === 'all' && (
                  <button onClick={() => setShowTemplateSelection(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#038DCD] hover:bg-[#0278b0] text-white rounded-xl font-semibold text-sm transition-colors">
                    <Plus className="w-4 h-4" /> Create Your First Form
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            PREVIEW MODAL
        ══════════════════════════════════════════════════════════ */}
        {showPreview && previewForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#038DCD]/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#038DCD]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{previewForm.name}</p>
                    <p className="text-xs text-slate-500">Preview mode — submissions disabled</p>
                  </div>
                </div>
                <button onClick={() => { setShowPreview(false); setPreviewForm(null); }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Total Fields', value: previewForm.fields.length },
                    { label: 'Required', value: previewForm.fields.filter(f => f.isRequired).length },
                    { label: 'Est. Time', value: `${Math.ceil(previewForm.fields.length / 3)} min` },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                      <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">{label}</p>
                      <p className="text-xl font-bold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
                <DynamicForm formId={previewForm.id} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}