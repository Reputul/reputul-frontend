import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SMSStepEditor from './SMSStepEditor';
import EmailStepEditor from './EmailStepEditor';

const EditCampaignStepModal = ({ step, onClose, onSave }) => {
  const { token } = useAuth();
  const [editedStep, setEditedStep] = useState(step);
  const [saving, setSaving] = useState(false);

  const isSMS = editedStep?.messageType === 'SMS';
  const isEmail = editedStep?.messageType?.includes('EMAIL');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedStep);
      onClose();
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStepIcon = () => {
    if (isSMS) return '📱';
    if (isEmail) return '📧';
    return '💬';
  };

  const getStepTypeLabel = () => {
    if (isSMS) return 'SMS';
    if (isEmail) return 'Email';
    return 'Message';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStepIcon()}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Edit {getStepTypeLabel()} Step
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Step {step.stepNumber} • {step.delayHours === 0 ? 'Immediate' : `After ${step.delayHours} hours`}
              </p>
            </div>
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Message Type Indicator */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getStepIcon()}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {getStepTypeLabel()} Message
                </p>
                <p className="text-xs text-gray-600">
                  {isSMS && 'Quick, personal text message'}
                  {isEmail && 'Professional branded email using template'}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Editor Based on Message Type */}
          {isSMS && (
            <SMSStepEditor 
              step={editedStep} 
              onChange={setEditedStep}
            />
          )}

          {isEmail && (
            <EmailStepEditor 
              step={editedStep} 
              onChange={setEditedStep}
              token={token}
            />
          )}

          {/* Fallback for unknown types */}
          {!isSMS && !isEmail && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                ⚠️ Unknown message type: {editedStep?.messageType}
              </p>
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
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
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCampaignStepModal;