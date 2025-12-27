import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const InteractiveCampaignBuilder = ({ campaign, onSave, onClose }) => {
  const { token } = useAuth();
  const [steps, setSteps] = useState(campaign.steps || []);
  const [saving, setSaving] = useState(false);

  // Add new step after a specific index
  const handleAddStep = (afterIndex) => {
    const newStep = {
      id: null, // New step, no ID yet
      stepNumber: afterIndex + 2,
      messageType: 'EMAIL_PROFESSIONAL',
      delayHours: 72, // Default 3 days
      subjectTemplate: '',
      bodyTemplate: '',
      isActive: true,
      isNew: true // Flag for frontend
    };

    // Insert after the specified index
    const updatedSteps = [...steps];
    updatedSteps.splice(afterIndex + 1, 0, newStep);

    // Renumber all steps
    updatedSteps.forEach((step, idx) => {
      step.stepNumber = idx + 1;
    });

    setSteps(updatedSteps);
  };

  // Update step delay
  const handleDelayChange = (index, newDelayHours) => {
    const updatedSteps = [...steps];
    updatedSteps[index].delayHours = newDelayHours;
    setSteps(updatedSteps);
  };

  // Toggle step active/inactive
  const handleToggleStep = (index) => {
    const updatedSteps = [...steps];
    updatedSteps[index].isActive = !updatedSteps[index].isActive;
    setSteps(updatedSteps);
  };

  // Delete step
  const handleDeleteStep = (index) => {
    if (steps.length <= 1) {
      alert('Campaign must have at least one step');
      return;
    }

    const confirmed = window.confirm('Delete this step?');
    if (!confirmed) return;

    const updatedSteps = steps.filter((_, idx) => idx !== index);
    
    // Renumber
    updatedSteps.forEach((step, idx) => {
      step.stepNumber = idx + 1;
    });

    setSteps(updatedSteps);
  };

  // Edit step content
  const handleEditStep = (index) => {
    // Open edit modal for this step
    // You'll use the EditCampaignStepModal here
    console.log('Edit step:', steps[index]);
  };

  // Change step type (SMS <-> Email)
  const handleChangeStepType = (index, newType) => {
    const updatedSteps = [...steps];
    updatedSteps[index].messageType = newType;
    
    // Clear inappropriate fields
    if (newType === 'SMS') {
      updatedSteps[index].emailTemplateId = null;
      updatedSteps[index].subjectTemplate = null;
    }
    
    setSteps(updatedSteps);
  };

  // Save campaign
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...campaign, steps });
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const getDelayOptions = () => {
    const options = [
      { value: 0, label: 'Immediately' },
      { value: 1, label: 'Wait 1 hour' },
      { value: 2, label: 'Wait 2 hours' },
      { value: 6, label: 'Wait 6 hours' },
      { value: 12, label: 'Wait 12 hours' },
      { value: 24, label: 'Wait 1 day' },
      { value: 48, label: 'Wait 2 days' },
      { value: 72, label: 'Wait 3 days' },
      { value: 120, label: 'Wait 5 days' },
      { value: 168, label: 'Wait 7 days' },
      { value: 336, label: 'Wait 14 days' },
    ];
    return options;
  };

  const getMessageTypeIcon = (type) => {
    if (type === 'SMS') return '📱';
    return '📧';
  };

  const getMessageTypeLabel = (type) => {
    if (type === 'SMS') return 'SMS Review Request';
    return 'Email Review Request';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{campaign.name}</h2>
            <p className="text-sm text-gray-600 mt-0.5">{campaign.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Campaign Flow - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-2xl mx-auto space-y-4">
            {steps.map((step, index) => (
              <div key={step.id || `step-${index}`}>
                {/* Step Card */}
                <div
                  className={`bg-white rounded-lg border-2 transition-all ${
                    step.isActive
                      ? 'border-gray-200 hover:border-blue-300'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  {/* Step Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Collapse Arrow */}
                      <button className="text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Icon */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg">
                        {getMessageTypeIcon(step.messageType)}
                      </div>

                      {/* Type Selector */}
                      <select
                        value={step.messageType}
                        onChange={(e) => handleChangeStepType(index, e.target.value)}
                        className="text-base font-medium text-gray-900 border-none bg-transparent focus:ring-0 cursor-pointer"
                      >
                        <option value="SMS">SMS Review Request</option>
                        <option value="EMAIL_PROFESSIONAL">Email Review Request</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Active Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.isActive}
                          onChange={() => handleToggleStep(index)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full transition-all ${
                          step.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform ${
                            step.isActive ? 'translate-x-5' : ''
                          }`}></div>
                        </div>
                      </label>

                      {/* More Options */}
                      <button
                        onClick={() => handleDeleteStep(index)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete step"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Step Content - Expandable */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => handleEditStep(index)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                    >
                      <p className="text-sm text-gray-600 mb-1">
                        {step.messageType === 'SMS' ? 'Text Message' : `Subject: ${step.subjectTemplate || 'Not set'}`}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {step.bodyTemplate?.startsWith('[Uses Email Template:')
                          ? 'Click to configure email template'
                          : (step.bodyTemplate || 'Click to edit message content...')}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Delay Selector (between steps) */}
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center py-4">
                    {/* Timeline Line */}
                    <div className="w-0.5 h-4 bg-gray-300"></div>

                    {/* Delay Dropdown */}
                    <select
                      value={steps[index + 1].delayHours}
                      onChange={(e) => handleDelayChange(index + 1, parseInt(e.target.value))}
                      className="px-4 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
                    >
                      {getDelayOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          🕐 {option.label}
                        </option>
                      ))}
                    </select>

                    {/* Timeline Line */}
                    <div className="w-0.5 h-4 bg-gray-300"></div>
                  </div>
                )}

                {/* Add Step Button */}
                <div className="flex justify-center py-2">
                  <button
                    onClick={() => handleAddStep(index)}
                    className="w-10 h-10 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
                    title="Add step after this one"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Campaign
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractiveCampaignBuilder;