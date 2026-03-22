'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBusinessAdRequests, approveBusinessAdRequest, rejectBusinessAdRequest } from '@/actions/business';
import { useNotification } from '@/components/Notification';
import { ConfirmationModal } from '@/components/ConfirmationModal';

interface BusinessAdApproval {
  id: number;
  approvedStartDate: Date;
  approvedEndDate: Date;
  adminNotes?: string;
  approvedAt: Date;
}

interface BusinessAdRequest {
  id: number;
  memberId: number;
  businessName: string;
  category: string;
  phone: string;
  email: string;
  website: string | null;
  address: string;
  established: string;
  owner: string;
  specialOffers: string | null;
  services: string;
  description: string;
  detailedDescription: string;
  logo: string | null;
  requestedStartDate: Date;
  requestedEndDate: Date;
  status: string;
  submittedAt: Date;
  member: {
    MemName: string | null;
    MemMembershipNo: string | null;
    MemFatherName: string | null;
  };
  approvals: BusinessAdApproval[];
}

export default function BusinessAdsManagement() {
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState<BusinessAdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<BusinessAdRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [requestToReject, setRequestToReject] = useState<number | null>(null);
  const [approvalData, setApprovalData] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await getBusinessAdRequests(status);
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const result = await approveBusinessAdRequest(
        selectedRequest.id,
        'Admin User', // In a real app, get from auth context
        new Date(approvalData.startDate),
        new Date(approvalData.endDate),
        approvalData.notes
      );

      if (result.success) {
        showNotification('Request approved successfully!', 'success');
        setShowApprovalModal(false);
        setSelectedRequest(null);
        loadRequests();
      } else {
        showNotification('Failed to approve request', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('An error occurred', 'error');
    }
  };

  const handleReject = async (requestId: number) => {
    setRequestToReject(requestId);
    setShowRejectConfirm(true);
  };

  const confirmReject = async () => {
    if (!requestToReject) return;

    try {
      const result = await rejectBusinessAdRequest(requestToReject);
      if (result.success) {
        showNotification('Request rejected successfully!', 'success');
        loadRequests();
      } else {
        showNotification('Failed to reject request', 'error');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('An error occurred', 'error');
    } finally {
      setShowRejectConfirm(false);
      setRequestToReject(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Ad Requests Management</h1>
        <p className="text-gray-600">Review and manage business advertisement requests from community members.</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${filter === status
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No requests found.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{request.businessName}</h3>
                  <p className="text-gray-600">{request.category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-500">
                      Submitted by: {request.member.MemName} ({request.member.MemMembershipNo})
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(request.submittedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                          setApprovalData({
                            startDate: request.requestedStartDate.toISOString().split('T')[0],
                            endDate: request.requestedEndDate.toISOString().split('T')[0],
                            notes: ''
                          });
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-600">{request.phone}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-600">{request.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Owner:</span>
                  <p className="text-gray-600">{request.owner}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Established:</span>
                  <p className="text-gray-600">{request.established}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Requested Period:</span>
                  <p className="text-gray-600">
                    {formatDate(request.requestedStartDate)} - {formatDate(request.requestedEndDate)}
                  </p>
                </div>
                {request.approvals.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Approved Period:</span>
                    <p className="text-gray-600">
                      {formatDate(request.approvals[0].approvedStartDate)} - {formatDate(request.approvals[0].approvedEndDate)}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <span className="font-medium text-gray-700">Services:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {JSON.parse(request.services).map((service: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {request.specialOffers && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Special Offers:</span>
                  <p className="text-gray-600 mt-1">{request.specialOffers}</p>
                </div>
              )}

              <div className="mt-4">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{request.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Approve Business Ad Request</h3>
            <p className="text-gray-600 mb-4">
              Approve &quot;{selectedRequest.businessName}&quot; advertisement request
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={approvalData.startDate}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={approvalData.endDate}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={approvalData.notes}
                  onChange={(e) => setApprovalData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Any notes about this approval..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showRejectConfirm}
        title="Reject Business Ad Request"
        message="Are you sure you want to reject this business advertisement request? This action cannot be undone."
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={confirmReject}
        onCancel={() => {
          setShowRejectConfirm(false);
          setRequestToReject(null);
        }}
        type="danger"
      />
    </div>
  );
}