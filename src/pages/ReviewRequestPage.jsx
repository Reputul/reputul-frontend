import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Add this import

const ReviewRequestsPage = () => {
  const navigate = useNavigate();  // Add this hook
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

  useEffect(() => {
    fetchCustomers();
    fetchTemplates();
    fetchReviewRequests();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/email-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to fetch templates');
      console.error('Error fetching templates:', err);
    }
  };

  const fetchReviewRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/review-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewRequests(response.data);
    } catch (err) {
      console.error('Error fetching review requests:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/api/review-requests/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSendReviewRequest = async (customerId, templateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/review-requests`, {
        customerId,
        templateId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Review request sent:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error sending review request:', err);
      throw err;
    }
  };

  const handleSendToSelected = async () => {
    if (selectedCustomers.length === 0 || !selectedTemplate) {
      setError('Please select customers and a template');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const results = [];
      
      for (const customerId of selectedCustomers) {
        const result = await handleSendReviewRequest(customerId, selectedTemplate);
        results.push(result);
      }

      const successCount = results.filter(r => r.status === 'SENT').length;
      const failCount = results.length - successCount;

      setSuccess(`✅ ${successCount} review requests sent successfully! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
      
      // Refresh data
      fetchReviewRequests();
      fetchStats();
      
      // Reset form
      setSelectedCustomers([]);
      setSelectedTemplate('');
      setShowSendModal(false);
      
    } catch (err) {
      setError('Failed to send review requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'SENT': 'bg-green-100 text-green-800',
      'DELIVERED': 'bg-blue-100 text-blue-800',
      'OPENED': 'bg-purple-100 text-purple-800',
      'CLICKED': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-emerald-100 text-emerald-800',
      'FAILED': 'bg-red-100 text-red-800',
      'BOUNCED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDING': '⏳',
      'SENT': '📧',
      'DELIVERED': '✅',
      'OPENED': '👀',
      'CLICKED': '🔗',
      'COMPLETED': '⭐',
      'FAILED': '❌',
      'BOUNCED': '↩️'
    };
    return icons[status] || '📧';
  };

  const filteredRequests = reviewRequests.filter(request => 
    filterStatus === 'ALL' || request.status === filterStatus
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
        <p className="text-gray-600">Send personalized review requests to your customers</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.totalSent || 0}</h3>
              <p className="text-sm text-gray-600">Emails Sent</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">👀</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.openRate || 0}%</h3>
              <p className="text-sm text-gray-600">Open Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">🔗</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.clickRate || 0}%</h3>
              <p className="text-sm text-gray-600">Click Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.completionRate || 0}%</h3>
              <p className="text-sm text-gray-600">Review Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowSendModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <span>📧</span>
          Send Review Requests
        </button>
        
        <button
          onClick={() => setShowHistoryModal(true)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <span>📋</span>
          View History
        </button>

        <button
          onClick={() => navigate('/review-platform-setup')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          Platform Setup
        </button>
      </div>

      {/* Recent Review Requests */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="SENT">Sent</option>
              <option value="OPENED">Opened</option>
              <option value="CLICKED">Clicked</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.slice(0, 10).map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{request.customerName}</div>
                      <div className="text-sm text-gray-500">{request.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{request.templateName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      <span className="mr-1">{getStatusIcon(request.status)}</span>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {request.sentAt ? new Date(request.sentAt).toLocaleDateString() : 'Not sent'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => window.open(request.reviewLink, '_blank')}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Send Review Requests</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Customers</h3>
                <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-3 border-b border-gray-200 last:border-b-0">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleCustomerSelect(customer.id)}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-xs text-gray-400">{customer.serviceType}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedCustomers.length} customer(s) selected
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Template</h3>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <label key={template.id} className="flex items-start cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplate == template.id}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">{template.typeDisplayName}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToSelected}
                disabled={loading || selectedCustomers.length === 0 || !selectedTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : `Send to ${selectedCustomers.length} Customer(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Review Request History</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{request.customerName}</div>
                          <div className="text-sm text-gray-500">{request.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{request.templateName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)} {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {request.sentAt ? new Date(request.sentAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {request.openedAt ? new Date(request.openedAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {request.clickedAt ? new Date(request.clickedAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigator.clipboard.writeText(request.reviewLink)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Copy Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewRequestsPage;