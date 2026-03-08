'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Edit, X, Upload, Eye } from 'lucide-react';
import { useNotification, ConfirmationModal } from '@/components/Notification';

interface Event {
  id: string;
  title: string;
  desc: string;
  date: string;
  time?: string;
  islamicDate?: string;
  venue?: string;
  category: string;
  img: string;
  fb?: string;
  createdAt: string;
  updatedAt: string;
}

interface Registration {
  id: string;
  memberName: string;
  relation?: string;
  memberEmail?: string;
  wehvariaNo?: string;
}

interface RegistrationGroup {
  groupId: string;
  head: Registration | null;
  family: Registration[];
  event: {
    id: string;
    title: string;
    date: string;
    category: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
}

export default function EventManagement() {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'registrations'>('events');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Confirmation modal states
  const [showDeleteEventConfirm, setShowDeleteEventConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [registrationToApprove, setRegistrationToApprove] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [registrationToReject, setRegistrationToReject] = useState<string | null>(null);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [registrationToResend, setRegistrationToResend] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    date: '',
    time: '',
    islamicDate: '',
    venue: '',
    category: '',
    img: '',
    fb: '',
  });

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      showNotification('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/events/registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      showNotification('Failed to load registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else {
      fetchRegistrations();
    }
  }, [activeTab]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('file', file);

      const response = await fetch('/api/events/upload', {
        method: 'POST',
        body: formDataForUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, img: data.path }));
        setPreviewImage(data.path);
      } else {
        showNotification('Failed to upload image: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      desc: '',
      date: '',
      time: '',
      islamicDate: '',
      venue: '',
      category: '',
      img: '',
      fb: '',
    });
    setPreviewImage(null);
    setEditingId(null);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      desc: event.desc,
      date: event.date.split('T')[0],
      time: event.time || '',
      islamicDate: event.islamicDate || '',
      venue: event.venue || '',
      category: event.category,
      img: event.img,
      fb: event.fb || '',
    });
    setPreviewImage(event.img);
    setEditingId(event.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.desc || !formData.date || !formData.category || !formData.img) {
      showNotification('Please fill in all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/events/${editingId}` : '/api/events';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchEvents();
        showNotification(editingId ? 'Event updated successfully' : 'Event created successfully', 'success');
      } else {
        const error = await response.json();
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showNotification('Failed to save event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setEventToDelete(id);
    setShowDeleteEventConfirm(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const response = await fetch(`/api/events/${eventToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchEvents();
        showNotification('Event deleted successfully', 'success');
      } else {
        showNotification('Failed to delete event', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete event', 'error');
    } finally {
      setShowDeleteEventConfirm(false);
      setEventToDelete(null);
    }
  };

  const isUpcomingEvent = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    // Compare date parts only to avoid timezone issues
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return eventDateOnly >= todayOnly;
  };

  const generateReport = () => {
    // Filter registrations for Eid Milan events (assuming category contains 'Eid' or 'Milan')
    const eidMilanRegistrations = registrations.filter((group: RegistrationGroup) =>
      group.event.category.toLowerCase().includes('eid') ||
      group.event.title.toLowerCase().includes('eid') ||
      group.event.title.toLowerCase().includes('milan')
    );

    if (eidMilanRegistrations.length === 0) {
      showNotification('No Eid Milan registrations found.', 'warning');
      return;
    }

    // Create CSV content
    const headers = ['Registration ID', 'Head of Family', 'Family Members', 'Total Attendees', 'Status', 'Registration Date'];
    const csvContent = [
      headers.join(','),
      ...eidMilanRegistrations.map((group: RegistrationGroup) => [
        group.groupId,
        `"${group.head?.memberName || 'Unknown'}"`,
        `"${group.family.map((m: Registration) => m.memberName).join('; ')}"`,
        group.family.length + 1,
        group.status,
        new Date(group.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'eid_milan_registrations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApproveGroup = (groupId: string) => {
    setRegistrationToApprove(groupId);
    setShowApproveConfirm(true);
  };

  const confirmApproveGroup = async () => {
    if (!registrationToApprove) return;
    try {
      const response = await fetch('/api/admin/events/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: registrationToApprove, action: 'approve' }),
      });

      if (response.ok) {
        fetchRegistrations();
        showNotification('Registration approved and invitation email sent successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Approval error:', error);
      showNotification('Failed to approve registration', 'error');
    } finally {
      setShowApproveConfirm(false);
      setRegistrationToApprove(null);
    }
  };

  const handleRejectGroup = (groupId: string) => {
    setRegistrationToReject(groupId);
    setShowRejectConfirm(true);
  };

  const confirmRejectGroup = async () => {
    if (!registrationToReject) return;
    try {
      const response = await fetch('/api/admin/events/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: registrationToReject, action: 'reject' }),
      });

      if (response.ok) {
        fetchRegistrations();
        showNotification('Registration rejected successfully.', 'success');
      } else {
        const error = await response.json();
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showNotification('Failed to reject registration', 'error');
    } finally {
      setShowRejectConfirm(false);
      setRegistrationToReject(null);
    }
  };

  const handleResendInvitation = (group: RegistrationGroup) => {
    setRegistrationToResend(group.groupId);
    setShowResendConfirm(true);
  };

  const confirmResendInvitation = async () => {
    if (!registrationToResend) return;
    try {
      const response = await fetch('/api/admin/events/registrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: registrationToResend, action: 'resend' }),
      });

      if (response.ok) {
        showNotification('Invitation email resent successfully!', 'success');
      } else {
        const error = await response.json();
        showNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Resend error:', error);
      showNotification('Failed to resend invitation email', 'error');
    } finally {
      setShowResendConfirm(false);
      setRegistrationToResend(null);
    }
  };

  if (loading && ((activeTab === 'events' && events.length === 0) || (activeTab === 'registrations' && registrations.length === 0))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Event Management</h1>
          <p className="text-slate-600 mt-1">Manage events and registrations</p>
        </div>
        {activeTab === 'registrations' && (
          <button
            onClick={generateReport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Eye className="w-5 h-5" />
            Generate Eid Milan Report
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-2 rounded-md font-semibold transition-colors ${activeTab === 'events'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-6 py-2 rounded-md font-semibold transition-colors ${activeTab === 'registrations'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Registrations
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'events' ? (
        <>
          {/* Events Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        No events yet. Create your first event!
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                            <Image
                              src={event.img}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 line-clamp-1">{event.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {event.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          <div className="flex items-center gap-2">
                            <div>
                              <div>{new Date(event.date).toLocaleDateString()}</div>
                              {event.time && <div className="text-xs text-slate-500">{event.time}</div>}
                              {event.islamicDate && <div className="text-xs text-slate-500 italic">{event.islamicDate}</div>}
                              {event.venue && <div className="text-xs text-slate-500">📍 {event.venue}</div>}
                            </div>
                            {isUpcomingEvent(event.date) && (
                              <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full whitespace-nowrap">
                                Upcoming
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Registrations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Head of Family</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Family Members</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Attendees</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        No registrations yet.
                      </td>
                    </tr>
                  ) : (
                    registrations.map((group: RegistrationGroup) => (
                      <tr key={group.groupId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">{group.event.title}</p>
                            <p className="text-sm text-slate-500">{group.event.category}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{group.head?.memberName || 'Unknown'}</p>
                            <p className="text-sm text-slate-500">Membership No: {group.head?.wehvariaNo || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {group.family.length > 0 ? (
                              <div>
                                {group.family.map((member: Registration, index: number) => (
                                  <div key={index} className="mb-1">
                                    • {member.memberName}{member.relation && member.relation !== 'Family Member' ? ` (${member.relation})` : ''}<br />
                                    <span className="text-xs text-slate-500">Membership No: {member.wehvariaNo || 'N/A'}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">No additional family members</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm text-center font-medium">
                          {group.family.length + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${group.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : group.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {group.status === 'approved' ? 'Approved' : group.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {group.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveGroup(group.groupId)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectGroup(group.groupId)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {group.status === 'approved' && (
                              <button
                                onClick={() => handleResendInvitation(group)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Resend Email
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Event Image
                </label>
                <div className="space-y-4">
                  {previewImage && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-100">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-blue-50">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">
                        {uploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {formData.img && (
                    <p className="text-xs text-slate-500">
                      Image path: {formData.img}
                    </p>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Event title"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description *
                </label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleInputChange}
                  placeholder="Event description"
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Date and Category Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Category and Venue Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Sports Events">Sports Events</option>
                    <option value="Islamic Events">Islamic Events</option>
                    <option value="Cultural Events">Cultural Events</option>
                    <option value="Community Events">Community Events</option>
                    <option value="Youth Programs">Youth Programs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Event venue/location"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Islamic Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Islamic Date (Optional)
                </label>
                <input
                  type="text"
                  name="islamicDate"
                  value={formData.islamicDate}
                  onChange={handleInputChange}
                  placeholder="e.g., 15 Rajab 1445"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Facebook Link */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Facebook Link
                </label>
                <input
                  type="url"
                  name="fb"
                  value={formData.fb}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteEventConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteEvent}
        onCancel={() => {
          setShowDeleteEventConfirm(false);
          setEventToDelete(null);
        }}
        type="danger"
      />

      <ConfirmationModal
        isOpen={showApproveConfirm}
        title="Approve Registration"
        message="Are you sure you want to approve this family registration? An invitation email will be sent."
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={confirmApproveGroup}
        onCancel={() => {
          setShowApproveConfirm(false);
          setRegistrationToApprove(null);
        }}
        type="info"
      />

      <ConfirmationModal
        isOpen={showRejectConfirm}
        title="Reject Registration"
        message="Are you sure you want to reject this family registration?"
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={confirmRejectGroup}
        onCancel={() => {
          setShowRejectConfirm(false);
          setRegistrationToReject(null);
        }}
        type="danger"
      />

      <ConfirmationModal
        isOpen={showResendConfirm}
        title="Resend Invitation"
        message="Are you sure you want to resend the invitation email?"
        confirmText="Resend"
        cancelText="Cancel"
        onConfirm={confirmResendInvitation}
        onCancel={() => {
          setShowResendConfirm(false);
          setRegistrationToResend(null);
        }}
        type="warning"
      />
    </div>
  );
}