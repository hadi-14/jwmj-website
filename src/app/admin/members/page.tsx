'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  X,
  Save,
  Loader,
  UserCheck,
  AlertCircle,
  UserPlus,
  Shield,
  Lock
} from 'lucide-react';

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '', role: 'MEMBER' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, statusFilter, members]);

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users?limit=1000');
      const data = await response.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      showNotification('error', 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterMembers = useCallback(() => {
    let filtered = [...members];

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.role === statusFilter);
    }

    setFilteredMembers(filtered);
  }, [members, searchQuery, statusFilter]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        showNotification('success', 'User deleted successfully');
        fetchMembers();
      }
    } catch {
      showNotification('error', 'Failed to delete user');
    }
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      showNotification('error', 'Email is required');
      return;
    }

    if (!showEditModal && !formData.password) {
      showNotification('error', 'Password is required for new users');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      showNotification('error', 'Password must be at least 8 characters');
      return;
    }

    setIsSaving(true);
    try {
      const url = showEditModal && selectedMember
        ? `/api/users/${selectedMember.id}`
        : '/api/users';

      const method = showEditModal ? 'PUT' : 'POST';

      const payload: Record<string, unknown> = {
        name: formData.name || null,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Operation failed');
      }

      showNotification('success', showEditModal ? 'User updated successfully' : 'User created successfully');
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
      setSelectedMember(null);
      fetchMembers();
    } catch (error: unknown) {
      if (error instanceof Error) {
        showNotification('error', error.message || 'Operation failed');
      } else {
        showNotification('error', 'Operation failed');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      email: member.email,
      password: '',
      role: member.role,
    });
    setShowEditModal(true);
  };

  const exportMembers = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Created Date'],
      ...filteredMembers.map((m) => [
        m.id,
        m.name || '',
        m.email,
        m.role,
        new Date(m.createdAt).toLocaleDateString()
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.role === 'MEMBER').length,
    pending: members.filter((m) => m.role === 'USER').length,
    inactive: members.filter((m) => m.role === 'ADMIN').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#038DCD] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Users Management</h1>
          <p className="text-slate-600">Manage and monitor all system users</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportMembers}
            className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white rounded-xl hover:shadow-lg font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border-2 ${notification.type === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
            <p
              className={`font-semibold ${notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                }`}
            >
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 font-medium mb-2">Total Users</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Users className="w-6 h-6 text-[#038DCD]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 font-medium mb-2">Members</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <UserCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 font-medium mb-2">Users</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-600 font-medium mb-2">Admins</p>
              <p className="text-3xl font-bold text-slate-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <XCircle className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none cursor-pointer transition-all"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filteredMembers.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{members.length}</span> users
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Created Date</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">No users found</p>
                      <p className="text-sm text-slate-500">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by adding your first user'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#038DCD] to-[#0369A1] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{member.name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${member.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : member.role === 'MEMBER'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                          }`}
                      >
                        {member.role === 'ADMIN' && <Shield className="w-3.5 h-3.5" />}
                        {member.role === 'MEMBER' && <UserCheck className="w-3.5 h-3.5" />}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setShowViewModal(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                          title="Edit member"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          title="Delete member"
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

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white p-6 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-3">
                {showEditModal ? <Edit className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                <h2 className="text-2xl font-bold">{showEditModal ? 'Edit User' : 'Add New User'}</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
                  setSelectedMember(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password {!showEditModal && <span className="text-rose-500">*</span>}
                  {showEditModal && <span className="text-slate-500 text-xs font-normal ml-2">(Leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={showEditModal ? "Enter new password (optional)" : "Minimum 8 characters"}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none transition-all"
                  />
                </div>
                {!showEditModal && (
                  <p className="mt-2 text-xs text-slate-500">Password must be at least 8 characters long</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  User Role <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#038DCD] focus:ring-4 focus:ring-[#038DCD]/10 outline-none cursor-pointer transition-all appearance-none bg-white"
                  >
                    <option value="USER">User - Basic access</option>
                    <option value="MEMBER">Member - Standard privileges</option>
                    <option value="ADMIN">Admin - Full access</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-800">
                    <strong>Role Permissions:</strong>
                    {formData.role === 'ADMIN' && ' Full system access including user management'}
                    {formData.role === 'MEMBER' && ' Standard access to member features'}
                    {formData.role === 'USER' && ' Basic read-only access'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setFormData({ name: '', email: '', password: '', role: 'MEMBER' });
                    setSelectedMember(null);
                  }}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white rounded-xl hover:shadow-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {showEditModal ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {showEditModal ? 'Update User' : 'Create User'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white p-6 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">Member Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-[#038DCD] to-[#0369A1] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {(selectedMember.name || selectedMember.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedMember.name || 'N/A'}</h3>
                  <p className="text-slate-600 text-sm">{selectedMember.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-500">Role</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${selectedMember.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : selectedMember.role === 'MEMBER'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}
                  >
                    {selectedMember.role}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-500">Created Date</p>
                  </div>
                  <p className="text-slate-900">{new Date(selectedMember.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-500">Last Updated</p>
                  </div>
                  <p className="text-slate-900">{new Date(selectedMember.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedMember);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#038DCD] to-[#0369A1] text-white rounded-xl hover:shadow-lg font-semibold transition-all"
                >
                  <Edit className="w-5 h-5" />
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}