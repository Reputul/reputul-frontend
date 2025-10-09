import React, { useState } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';
import { toast } from 'sonner';

const QuickActionButtons = ({ customer, userToken, onActionComplete }) => {
  const [loading, setLoading] = useState({});

  const handleQuickAction = async (action, additionalData = {}) => {
    setLoading(prev => ({ ...prev, [action]: true }));
    
    try {
      let endpoint, payload, successMessage;

      switch (action) {
        case 'send_review_request':
          endpoint = '/api/v1/automation/triggers/review-request';
          payload = { 
            customerId: customer.id,
            deliveryMethod: customer.phone && customer.smsOptIn ? 'SMS' : 'EMAIL',
            reason: 'Quick action from customer management',
            ...additionalData
          };
          successMessage = 'Review request sent successfully';
          break;

        case 'skip_automation':
          endpoint = '/api/v1/automation/customers/skip';
          payload = { 
            customerId: customer.id,
            reason: 'Manual skip from customer management',
            ...additionalData
          };
          successMessage = 'Automation skipped for this customer';
          break;

        case 'mark_service_complete':
          endpoint = '/api/v1/automation/triggers/service-complete';
          payload = { 
            customerId: customer.id,
            reason: 'Manual service completion from customer management',
            ...additionalData
          };
          successMessage = 'Service marked as complete, automation triggered';
          break;

        case 'reset_automation':
          endpoint = '/api/v1/automation/customers/reset';
          payload = { 
            customerId: customer.id,
            reason: 'Manual reset from customer management',
            ...additionalData
          };
          successMessage = 'Automation reset for this customer';
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      await axios.post(buildUrl(endpoint), payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      toast.success(successMessage);
      onActionComplete?.(customer.id, action);
      
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action.replace('_', ' ')}`;
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const getActionButton = (action, config) => {
    const isLoading = loading[action];
    const isDisabled = config.disabled || isLoading;

    return (
      <button
        key={action}
        onClick={() => {
          if (config.confirm) {
            if (window.confirm(config.confirm)) {
              handleQuickAction(action, config.data);
            }
          } else {
            handleQuickAction(action, config.data);
          }
        }}
        disabled={isDisabled}
        className={`${config.className} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        title={config.tooltip}
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          config.icon
        )}
        <span className="ml-1">{config.label}</span>
      </button>
    );
  };

  // Define available actions based on customer state
  const actions = {
    send_review_request: {
      label: 'Send Request',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      className: 'flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700',
      tooltip: 'Send review request immediately',
      disabled: !customer.email && (!customer.phone || !customer.smsOptIn)
    },

    skip_automation: {
      label: 'Skip',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      className: 'flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600',
      tooltip: 'Skip automation for this customer',
      confirm: 'Skip automation for this customer? They will not receive automated review requests.',
      data: { permanent: false }
    },

    mark_service_complete: {
      label: 'Mark Complete',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      className: 'flex items-center px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700',
      tooltip: 'Mark service as complete and trigger automation',
      disabled: customer.status === 'COMPLETED'
    },

    reset_automation: {
      label: 'Reset',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      className: 'flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700',
      tooltip: 'Reset automation state for this customer',
      confirm: 'Reset automation for this customer? This will clear their current automation state and restart workflows.'
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(actions).map(([action, config]) => 
        getActionButton(action, config)
      )}
    </div>
  );
};

export default QuickActionButtons;