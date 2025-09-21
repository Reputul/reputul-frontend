import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const CustomerAutomationStatus = ({ customer, userToken, onStatusUpdate }) => {
  const [automationData, setAutomationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (customer?.id && userToken) {
      fetchAutomationStatus();
    }
  }, [customer?.id, userToken]);

  const fetchAutomationStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildUrl(`/api/automation/customers/${customer.id}/status`),
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      setAutomationData(response.data);
    } catch (error) {
      console.error('Error fetching automation status:', error);
      // Don't show toast for missing automation data - it's optional
      setAutomationData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action, workflowId = null) => {
    if (actionLoading) return;

    setActionLoading(true);
    try {
      let endpoint;
      let payload = { customerId: customer.id };

      switch (action) {
        case 'send_now':
          endpoint = '/api/automation/triggers/manual';
          if (workflowId) payload.workflowId = workflowId;
          break;
        case 'skip_automation':
          endpoint = '/api/automation/customers/skip';
          payload.reason = 'Manual skip from customer management';
          break;
        case 'mark_complete':
          endpoint = '/api/automation/triggers/service-complete';
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }

      await axios.post(buildUrl(endpoint), payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      showToast(`Action completed successfully`, 'success');
      
      // Refresh automation status
      await fetchAutomationStatus();
      
      // Notify parent component
      if (onStatusUpdate) {
        onStatusUpdate(customer.id);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      showToast(`Failed to ${action.replace('_', ' ')}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = () => {
    if (!automationData) {
      return {
        status: 'none',
        message: 'No automation',
        color: 'text-gray-400',
        bgColor: 'bg-gray-400/20',
        icon: '—'
      };
    }

    const { status, nextExecution, lastExecution } = automationData;

    switch (status) {
      case 'PENDING':
        const timeUntil = nextExecution ? 
          getTimeUntilExecution(nextExecution) : 'Soon';
        return {
          status: 'pending',
          message: `Request in ${timeUntil}`,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          icon: '⏳'
        };
      
      case 'SENT':
        const sentTime = lastExecution ? 
          getTimeSince(lastExecution.createdAt) : 'recently';
        return {
          status: 'sent',
          message: `Request sent ${sentTime}`,
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/20',
          icon: '📧'
        };
      
      case 'RESPONDED':
        return {
          status: 'completed',
          message: 'Customer responded',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          icon: '✓'
        };
      
      case 'FAILED':
        return {
          status: 'failed',
          message: 'Request failed',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          icon: '✗'
        };
      
      default:
        return {
          status: 'unknown',
          message: 'Status unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          icon: '?'
        };
    }
  };

  const getTimeUntilExecution = (timestamp) => {
    const now = new Date();
    const executionTime = new Date(timestamp);
    const diffMs = executionTime - now;
    
    if (diffMs <= 0) return 'Now';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days}d`;
    }
    if (diffHours > 0) {
      return `${diffHours}h`;
    }
    return `${diffMinutes}m`;
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const pastTime = new Date(timestamp);
    const diffMs = now - pastTime;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'just now';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse bg-gray-300 rounded w-16 h-4"></div>
      </div>
    );
  }

  const statusConfig = getStatusConfig();

  return (
    <div className="flex items-center justify-between min-w-0">
      {/* Status Badge */}
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
        <span>{statusConfig.icon}</span>
        <span className="truncate">{statusConfig.message}</span>
      </div>

      {/* Quick Actions */}
      {automationData && (
        <div className="flex items-center space-x-1 ml-3">
          {(statusConfig.status === 'pending' || statusConfig.status === 'failed') && (
            <button
              onClick={() => handleQuickAction('send_now')}
              disabled={actionLoading}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors disabled:opacity-50"
              title="Send review request now"
            >
              Send Now
            </button>
          )}
          
          {statusConfig.status === 'pending' && (
            <button
              onClick={() => handleQuickAction('skip_automation')}
              disabled={actionLoading}
              className="text-gray-400 hover:text-gray-300 text-xs font-medium transition-colors disabled:opacity-50 ml-2"
              title="Skip automation for this customer"
            >
              Skip
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerAutomationStatus;