import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReviewRequestsPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('EMAIL'); // NEW: Email or SMS
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

  const handleSendReviewRequest = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/review-requests`, {
        customerId,
        deliveryMethod // NEW: Include delivery method
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
    if (selectedCustomers.length === 0) {
      setError('Please select customers');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const results = [];
      
      for (const customerId of selectedCustomers) {
        const result = await handleSendReviewRequest(customerId);
        results.push(result);
      }

      const successCount = results.filter(r => r.status === 'SENT').length;
      const failCount = results.length - successCount;

      setSuccess(`✅ ${successCount} ${deliveryMethod.toLowerCase()} review requests sent successfully! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
      
      // Refresh data
      fetchReviewRequests();
      fetchStats();
      
      // Reset form
      setSelectedCustomers([]);
      setShowSendModal(false);
      
    } catch (err) {
      setError(`Failed to send ${deliveryMethod.toLowerCase()} review requests`);
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

  const getDeliveryMethodIcon = (method) => {
    return method === 'SMS' ? '📱' : '📧';
  };

  // NEW: Generate feedback gate URL for customer
  const generateFeedbackGateUrl = (customerId) => {
    return `${window.location.origin}/feedback-gate/${customerId}`;
  };

  const filteredRequests = reviewRequests.filter(request => 
    filterStatus === 'ALL' || request.status === filterStatus
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Requests</h1>
        <p className="text-gray-600">Send personalized review requests to your customers via email or SMS</p>
        
        {/* NEW: Google Compliance Notice */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6.938-4.697a3.42 3.42 0 01-.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 01.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138 3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138z" />
            </svg>
            <span className="text-green-800 font-medium">Google Compliant System Active</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            ✅ All emails include ALL review platform options for ALL customers
            <br />
            ✅ Smart feedback gate routes customers based on initial rating
            <br />
            ✅ 1-3 star ratings → Private feedback • 4-5 star ratings → Public platforms
          </p>
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.emailRequests || 0}</h3>
              <p className="text-sm text-gray-600">Email Requests</p>
            </div>
          </div>
        </div>

        {/* NEW: SMS Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.smsRequests || 0}</h3>
              <p className="text-sm text-gray-600">SMS Requests</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
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
            <div className="p-3 bg-indigo-100 rounded-full">
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
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <span>🚀</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
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
                      <div className="text-sm text-gray-500">
                        {request.deliveryMethod === 'SMS' ? request.customerPhone : request.customerEmail}
                      </div>
                    </div>
                  </td>
                  {/* NEW: Delivery Method Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-1">{getDeliveryMethodIcon(request.deliveryMethod)}</span>
                      <span className="text-sm text-gray-900">{request.deliveryMethod || 'EMAIL'}</span>
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
                    <div className="flex space-x-2">
                      {/* NEW: Copy Feedback Gate Link */}
                      <button
                        onClick={() => navigator.clipboard.writeText(generateFeedbackGateUrl(request.customerId))}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        title="Copy Google-compliant feedback gate link"
                      >
                        📋 Gate Link
                      </button>
                      {request.reviewLink && (
                        <button
                          onClick={() => window.open(request.reviewLink, '_blank')}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                          title="View original review link"
                        >
                          🔗 Direct
                        </button>
                      )}
                    </div>
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
            
            {/* NEW: Delivery Method Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Choose Delivery Method</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="EMAIL"
                    checked={deliveryMethod === 'EMAIL'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    📧 Email (Google-compliant templates)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="SMS"
                    checked={deliveryMethod === 'SMS'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span className="flex items-center">
                    📱 SMS (Short feedback gate link)
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {deliveryMethod === 'EMAIL' 
                  ? '📧 Emails include all review platforms and route via feedback gate'
                  : '📱 SMS sends short link to Google-compliant feedback gate'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select Customers</h3>
                <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                  {customers.map((customer) => {
                    // Check if customer has required info for selected delivery method
                    const hasEmail = customer.email && customer.email.trim();
                    const hasPhone = customer.phone && customer.phone.trim();
                    const canSend = deliveryMethod === 'EMAIL' ? hasEmail : hasPhone;
                    
                    return (
                      <div key={customer.id} className={`p-3 border-b border-gray-200 last:border-b-0 ${!canSend ? 'opacity-50' : ''}`}>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleCustomerSelect(customer.id)}
                            disabled={!canSend}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              {deliveryMethod === 'EMAIL' ? customer.email : customer.phone}
                              {!canSend && (
                                <span className="text-red-500 ml-2">
                                  ({deliveryMethod === 'EMAIL' ? 'No email' : 'No phone'})
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">{customer.serviceType}</div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {selectedCustomers.length} customer(s) selected for {deliveryMethod.toLowerCase()}
                </div>
              </div>

              {/* Information Panel */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">✅ Google Compliance Features</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>All customers see all review platform options</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Smart routing: 1-3 stars → private feedback</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>4-5 stars → encouraged to public platforms</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>No filtering or manipulation of reviews</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>Honest messaging that doesn't mislead</span>
                  </div>
                </div>
                
                {deliveryMethod === 'EMAIL' && (
                  <div className="mt-4 bg-blue-50 rounded p-3">
                    <h4 className="font-medium text-blue-900">📧 Email Template</h4>
                    <p className="text-xs text-blue-800 mt-1">Uses Google-compliant HTML templates with buttons for Google, Facebook, Yelp, and private feedback.</p>
                  </div>
                )}
                
                {deliveryMethod === 'SMS' && (
                  <div className="mt-4 bg-green-50 rounded p-3">
                    <h4 className="font-medium text-green-900">📱 SMS Message</h4>
                    <p className="text-xs text-green-800 mt-1">Sends short, friendly message with link to feedback gate for rating selection.</p>
                  </div>
                )}
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
                disabled={loading || selectedCustomers.length === 0}
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? 'Sending...' : `Send ${deliveryMethod} to ${selectedCustomers.length} Customer(s)`}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opened</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicked</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{request.customerName}</div>
                          <div className="text-sm text-gray-500">
                            {request.deliveryMethod === 'SMS' ? request.customerPhone : request.customerEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="mr-1">{getDeliveryMethodIcon(request.deliveryMethod)}</span>
                          <span className="text-sm">{request.deliveryMethod || 'EMAIL'}</span>
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
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => navigator.clipboard.writeText(generateFeedbackGateUrl(request.customerId))}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium text-left"
                            title="Copy Google-compliant feedback gate link"
                          >
                            📋 Gate Link
                          </button>
                          {request.reviewLink && (
                            <button
                              onClick={() => navigator.clipboard.writeText(request.reviewLink)}
                              className="text-green-600 hover:text-green-900 text-xs font-medium text-left"
                              title="Copy direct link"
                            >
                              🔗 Direct Link
                            </button>
                          )}
                        </div>
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