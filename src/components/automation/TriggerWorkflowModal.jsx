import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const TriggerWorkflowModal = ({ 
  isOpen, 
  onClose, 
  selectedCustomers = [], 
  availableWorkflows = [], 
  userToken,
  onSuccess 
}) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [triggerReason, setTriggerReason] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('EMAIL');
  const [customDelay, setCustomDelay] = useState(0);
  const [delayUnit, setDelayUnit] = useState('hours');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSelectedWorkflow('');
      setTriggerReason('');
      setDeliveryMethod('EMAIL');
      setCustomDelay(0);
      setDelayUnit('hours');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedWorkflow) {
      showToast('Please select a workflow', 'error');
      return;
    }

    if (!triggerReason.trim()) {
      showToast('Please provide a reason for manual triggering', 'error');
      return;
    }

    if (selectedCustomers.length === 0) {
      showToast('No customers selected', 'error');
      return;
    }

    // Validate SMS consent for SMS delivery
    if (deliveryMethod === 'SMS') {
      const invalidSmsCustomers = selectedCustomers.filter(
        customer => !customer.phone || !customer.smsOptIn || customer.smsOptOut
      );
      
      if (invalidSmsCustomers.length > 0) {
        showToast(
          `${invalidSmsCustomers.length} customers are not eligible for SMS delivery. Please check SMS consent.`,
          'error'
        );
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const triggerData = {
        workflowId: parseInt(selectedWorkflow),
        customerIds: selectedCustomers.map(c => c.id),
        reason: triggerReason.trim(),
        deliveryMethod,
        customSettings: {
          delay: customDelay > 0 ? {
            value: customDelay,
            unit: delayUnit
          } : null
        }
      };

      const response = await axios.post(
        buildUrl('/api/v1/automation/triggers/manual-bulk'),
        triggerData,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      const { successful, failed } = response.data;
      
      if (successful > 0) {
        showToast(
          `Successfully triggered automation for ${successful} customer${successful > 1 ? 's' : ''}`,
          'success'
        );
      }
      
      if (failed > 0) {
        showToast(
          `Failed to trigger automation for ${failed} customer${failed > 1 ? 's' : ''}`,
          'warning'
        );
      }

      onSuccess?.();
      onClose();
      
    } catch (error) {
      console.error('Error triggering workflow:', error);
      showToast('Failed to trigger automation workflow', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWorkflowDescription = (workflow) => {
    const triggerType = workflow.triggerType?.replace(/_/g, ' ').toLowerCase() || 'manual trigger';
    const delay = workflow.triggerConfig?.delay_hours 
      ? `${workflow.triggerConfig.delay_hours}h delay`
      : workflow.triggerConfig?.delay_days 
        ? `${workflow.triggerConfig.delay_days}d delay`
        : 'immediate';
    
    return `${triggerType} • ${delay} • ${workflow.deliveryMethod || 'EMAIL'}`;
  };

  const getSmsEligibleCount = () => {
    return selectedCustomers.filter(
      customer => customer.phone && customer.smsOptIn && !customer.smsOptOut
    ).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Trigger Automation Workflow
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Customers Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">
              Selected Customers ({selectedCustomers.length})
            </h3>
            <div className="max-h-32 overflow-y-auto">
              {selectedCustomers.slice(0, 5).map(customer => (
                <div key={customer.id} className="text-sm text-blue-800">
                  {customer.name} ({customer.email})
                </div>
              ))}
              {selectedCustomers.length > 5 && (
                <div className="text-sm text-blue-600 font-medium">
                  +{selectedCustomers.length - 5} more customers
                </div>
              )}
            </div>
          </div>

          {/* Workflow Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Workflow *
            </label>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a workflow...</option>
              {availableWorkflows.filter(w => w.isActive).map(workflow => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </option>
              ))}
            </select>
            {selectedWorkflow && (
              <div className="mt-2 text-sm text-gray-600">
                {getWorkflowDescription(availableWorkflows.find(w => w.id == selectedWorkflow))}
              </div>
            )}
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Method
            </label>
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
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email ({selectedCustomers.length} eligible)
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
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0v10l-5-5-5 5V8z" />
                  </svg>
                  SMS ({getSmsEligibleCount()} eligible)
                </span>
              </label>
            </div>
            {deliveryMethod === 'SMS' && getSmsEligibleCount() < selectedCustomers.length && (
              <div className="mt-2 text-sm text-yellow-600">
                {selectedCustomers.length - getSmsEligibleCount()} customers are not eligible for SMS (missing phone or consent)
              </div>
            )}
          </div>

          {/* Custom Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Delay (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                max="72"
                value={customDelay}
                onChange={(e) => setCustomDelay(parseInt(e.target.value) || 0)}
                className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              <select
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Leave at 0 to use workflow's default timing. Max 72 hours.
            </div>
          </div>

          {/* Trigger Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Manual Trigger *
            </label>
            <textarea
              value={triggerReason}
              onChange={(e) => setTriggerReason(e.target.value)}
              placeholder="e.g., Customer requested resend, High-value project completion, Special campaign"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <div className="mt-1 text-xs text-gray-500">
              This reason will be logged for tracking and compliance purposes.
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedWorkflow || !triggerReason.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Triggering...' : `Trigger for ${selectedCustomers.length} Customer${selectedCustomers.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TriggerWorkflowModal;