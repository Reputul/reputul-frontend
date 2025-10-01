import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { buildUrl } from '../../config/api';
import ModalPortal from '../common/ModalPortal'; 

const CampaignExecutionModal = ({ executions, onClose, onRefresh }) => {
  console.log('=== CampaignExecutionModal RENDERING ===');
  console.log('Executions prop:', executions);
  console.log('onClose prop:', typeof onClose);
  console.log('onRefresh prop:', typeof onRefresh);
  const { token } = useAuth();
  const { showToast } = useToast();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStopExecution = async (executionId) => {
    if (!window.confirm('Are you sure you want to stop this campaign?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.post(buildUrl(`/api/campaigns/executions/${executionId}/stop`), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Campaign stopped successfully', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error stopping campaign:', error);
      showToast('Failed to stop campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!onClose || !onRefresh) {
    console.error('Missing required props!', { onClose, onRefresh });
  }

  const handleCancelExecution = async (executionId) => {
    if (!window.confirm('Are you sure you want to cancel this campaign? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      await axios.post(buildUrl(`/api/campaigns/executions/${executionId}/cancel`), {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Campaign cancelled successfully', 'success');
      onRefresh();
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      showToast('Failed to cancel campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredExecutions = executions.filter(execution => {
    const statusMatch = filterStatus === 'all' || execution.status.toLowerCase() === filterStatus;
    const searchMatch = !searchTerm || 
      execution.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      execution.sequenceName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startedAt, completedAt) => {
    if (!startedAt) return 'N/A';
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffHours = Math.round((end - start) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      return `${days}d ${hours}h`;
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Campaign History</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredExecutions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No campaigns found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExecutions.map(execution => (
                  <div key={execution.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-800">{execution.customerName || 'Unknown Customer'}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                            {execution.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Email:</span>
                            <p className="font-medium">{execution.customerEmail || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Sequence:</span>
                            <p className="font-medium">{execution.sequenceName || 'Unknown Sequence'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Current Step:</span>
                            <p className="font-medium">{execution.currentStep || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <p className="font-medium">{calculateDuration(execution.startedAt, execution.completedAt)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Started:</span>
                            <p className="font-medium">{formatDate(execution.startedAt)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Completed:</span>
                            <p className="font-medium">{formatDate(execution.completedAt)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Business:</span>
                            <p className="font-medium">{execution.businessName || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Campaign ID:</span>
                            <p className="font-medium font-mono text-xs">{execution.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        {execution.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => handleStopExecution(execution.id)}
                              disabled={loading}
                              className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                            >
                              Stop
                            </button>
                            <button
                              onClick={() => handleCancelExecution(execution.id)}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {(execution.status === 'COMPLETED' || execution.status === 'FAILED') && (
                          <button
                            onClick={() => {
                              showToast('Execution details coming soon', 'info');
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Showing {filteredExecutions.length} of {executions.length} campaigns
              </span>
              <div className="flex gap-4">
                <span>Active: {executions.filter(e => e.status === 'ACTIVE').length}</span>
                <span>Completed: {executions.filter(e => e.status === 'COMPLETED').length}</span>
                <span>Failed: {executions.filter(e => e.status === 'FAILED').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CampaignExecutionModal;