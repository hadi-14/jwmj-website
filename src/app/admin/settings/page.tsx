'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNotification } from '@/components/Notification';
import {
  Megaphone,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  AlertCircle,
} from 'lucide-react';

interface AnnouncementData {
  messages: string[];
  enabled: boolean;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState<AnnouncementData>({
    messages: ['Welcome to JWMJ!'],
    enabled: true
  });
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const response = await fetch('/api/settings/announcement');
      if (response.ok) {
        const data = await response.json();
        setAnnouncement(data);
      }
    } catch (error) {
      console.error('Failed to fetch announcement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (announcement.messages.length === 0) {
      showNotification('At least one message is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/settings/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcement)
      });

      if (response.ok) {
        showNotification('Announcement updated successfully', 'success');
      } else {
        const data = await response.json();
        showNotification(data.error || 'Failed to update announcement', 'error');
      }
    } catch (error) {
      console.error('Failed to save announcement:', error);
      showNotification('Failed to save announcement', 'error');
    } finally {
      setSaving(false);
    }
  };

  const addMessage = () => {
    if (!newMessage.trim()) {
      showNotification('Please enter a message', 'error');
      return;
    }
    if (announcement.messages.length >= 5) {
      showNotification('Maximum 5 messages allowed', 'error');
      return;
    }
    setAnnouncement(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage.trim()]
    }));
    setNewMessage('');
  };

  const removeMessage = (index: number) => {
    if (announcement.messages.length <= 1) {
      showNotification('At least one message is required', 'error');
      return;
    }
    setAnnouncement(prev => ({
      ...prev,
      messages: prev.messages.filter((_, i) => i !== index)
    }));
  };

  const updateMessage = (index: number, value: string) => {
    setAnnouncement(prev => ({
      ...prev,
      messages: prev.messages.map((msg, i) => i === index ? value : msg)
    }));
  };

  const toggleEnabled = () => {
    setAnnouncement(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#038DCD] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
          <p className="text-slate-600">Manage website settings and announcements</p>
        </div>
      </div>

      {/* Announcement Banner Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Header Announcement Banner</h2>
              <p className="text-sm text-slate-600">Customize the scrolling announcement text that appears at the top of the website</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              {announcement.enabled ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <p className="font-semibold text-slate-900">Banner Visibility</p>
                <p className="text-sm text-slate-600">
                  {announcement.enabled ? 'Banner is visible to visitors' : 'Banner is hidden from visitors'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                announcement.enabled ? 'bg-green-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  announcement.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Preview</label>
            <div className="h-8 bg-gradient-to-r from-[#038DCD] to-[#024767] rounded-lg relative overflow-hidden">
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white italic text-sm whitespace-nowrap px-4"
                style={{
                  animation: announcement.enabled ? 'marquee 16s linear infinite' : 'none',
                }}
              >
                {announcement.messages.join(' • ')}
              </span>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Messages ({announcement.messages.length}/5)
            </label>
            
            {announcement.messages.map((message, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group"
              >
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <input
                  type="text"
                  value={message}
                  onChange={(e) => updateMessage(index, e.target.value)}
                  maxLength={200}
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter announcement message..."
                />
                <span className="text-xs text-slate-400">{message.length}/200</span>
                <button
                  onClick={() => removeMessage(index)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add New Message */}
            {announcement.messages.length < 5 && (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMessage()}
                  maxLength={200}
                  className="flex-1 p-3 border border-slate-200 rounded-xl outline-none focus:border-[#038DCD] focus:ring-2 focus:ring-[#038DCD]/20 transition-all"
                  placeholder="Add a new announcement message..."
                />
                <button
                  onClick={addMessage}
                  className="p-3 bg-[#038DCD] text-white rounded-xl hover:bg-[#0369A1] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Tips for announcements:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Keep messages short and impactful (max 200 characters)</li>
                <li>Use bullet points (•) to separate different topics in one message</li>
                <li>Messages will scroll continuously across the header</li>
                <li>You can add up to 5 different rotating messages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Last updated by: {user?.name || 'Admin'}
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#038DCD] text-white rounded-xl font-semibold hover:bg-[#0369A1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
