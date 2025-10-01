import React, { useState, useEffect, useRef } from 'react';

const CampaignStepEditor = ({ 
  step, 
  stepIndex, 
  totalSteps,
  onChange, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  readonly = false 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const textareaRef = useRef(null);

  // Template variables available for substitution
  const templateVariables = [
    { key: '{{customerName}}', description: 'Customer\'s full name' },
    { key: '{{businessName}}', description: 'Your business name' },
    { key: '{{serviceType}}', description: 'Type of service provided' },
    { key: '{{reviewLink}}', description: 'Smart review routing link' },
    { key: '{{businessPhone}}', description: 'Your business phone number' },
    { key: '{{businessWebsite}}', description: 'Your business website' },
    { key: '{{serviceDate}}', description: 'Date service was completed' },
    { key: '{{unsubscribeLink}}', description: 'Unsubscribe link (required for emails)' }
  ];

  // Validate step data
  useEffect(() => {
    const errors = {};
    
    if (!step.bodyTemplate?.trim()) {
      errors.bodyTemplate = 'Message content is required';
    }
    
    if (step.messageType?.includes('EMAIL') && !step.subjectTemplate?.trim()) {
      errors.subjectTemplate = 'Subject line is required for emails';
    }
    
    if (step.delayHours < 0) {
      errors.delayHours = 'Delay cannot be negative';
    }
    
    if (step.messageType === 'SMS' && step.bodyTemplate?.length > 160) {
      errors.bodyTemplate = 'SMS messages should be under 160 characters';
    }
    
    setValidationErrors(errors);
  }, [step]);

  const handleStepChange = (field, value) => {
    if (readonly) return;
    onChange(stepIndex, field, value);
  };

  const insertVariable = (variable) => {
    if (readonly) return;
    
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = step.bodyTemplate || '';
      const newValue = currentValue.slice(0, start) + variable + currentValue.slice(end);
      
      handleStepChange('bodyTemplate', newValue);
      
      // Reset cursor position after update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const getStepIcon = (messageType) => {
    switch (messageType) {
      case 'SMS':
        return '📱';
      case 'EMAIL_PROFESSIONAL':
        return '✉️';
      case 'EMAIL_PLAIN':
        return '📧';
      default:
        return '📝';
    }
  };

  const getDelayDescription = (hours) => {
    if (hours === 0) return 'Immediately';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${days}d ${remainingHours}h`;
  };

  const getMessageTypeColor = (messageType) => {
    switch (messageType) {
      case 'SMS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EMAIL_PROFESSIONAL':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EMAIL_PLAIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    const sampleData = {
      '{{customerName}}': 'John Smith',
      '{{businessName}}': 'ABC Home Services',
      '{{serviceType}}': 'Roof Repair',
      '{{reviewLink}}': 'https://review.example.com/abc-123',
      '{{businessPhone}}': '(555) 123-4567',
      '{{businessWebsite}}': 'https://abchomeservices.com',
      '{{serviceDate}}': new Date().toLocaleDateString(),
      '{{unsubscribeLink}}': 'https://unsubscribe.example.com/token'
    };

    let previewSubject = step.subjectTemplate || '';
    let previewBody = step.bodyTemplate || '';

    // Replace variables with sample data
    Object.entries(sampleData).forEach(([variable, value]) => {
      previewSubject = previewSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
      previewBody = previewBody.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-800">Preview</h4>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getMessageTypeColor(step.messageType)}`}>
            {step.messageType?.replace('_', ' ')}
          </span>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          {step.messageType?.includes('EMAIL') && step.subjectTemplate && (
            <div className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
              Subject: {previewSubject || '[No subject]'}
            </div>
          )}
          <div className="text-gray-700 whitespace-pre-wrap text-sm">
            {previewBody || '[No message content]'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`border rounded-lg transition-all duration-200 ${
      readonly ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white hover:border-gray-400'
    }`}>
      {/* Step Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getStepIcon(step.messageType)}</span>
            <div>
              <h3 className="font-semibold text-gray-800">
                Step {step.stepNumber}
                {stepIndex === 0 && <span className="text-sm text-gray-500 ml-2">(Initial)</span>}
              </h3>
              <p className="text-sm text-gray-600">
                {stepIndex === 0 ? 'Sent immediately' : `Sent ${getDelayDescription(step.delayHours || 0)} after previous step`}
              </p>
            </div>
          </div>

          {!readonly && (
            <div className="flex items-center gap-2">
              {/* Move buttons */}
              {stepIndex > 0 && (
                <button
                  onClick={() => onMoveUp(stepIndex)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Move up"
                >
                  ↑
                </button>
              )}
              {stepIndex < totalSteps - 1 && (
                <button
                  onClick={() => onMoveDown(stepIndex)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Move down"
                >
                  ↓
                </button>
              )}
              
              {/* Preview toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              
              {/* Remove button */}
              {totalSteps > 1 && (
                <button
                  onClick={() => onRemove(stepIndex)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step Configuration */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delay Configuration */}
          {stepIndex > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send After Previous Step
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="8760"
                  value={step.delayHours || 0}
                  onChange={(e) => handleStepChange('delayHours', parseInt(e.target.value) || 0)}
                  disabled={readonly}
                  className={`w-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.delayHours ? 'border-red-300' : 'border-gray-300'
                  } ${readonly ? 'bg-gray-100' : ''}`}
                />
                <span className="text-gray-600 text-sm">hours</span>
              </div>
              {validationErrors.delayHours && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.delayHours}</p>
              )}
            </div>
          )}

          {/* Message Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <select
              value={step.messageType || 'EMAIL_PROFESSIONAL'}
              onChange={(e) => handleStepChange('messageType', e.target.value)}
              disabled={readonly}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                readonly ? 'bg-gray-100 border-gray-300' : 'border-gray-300'
              }`}
            >
              <option value="SMS">SMS Text Message</option>
              <option value="EMAIL_PROFESSIONAL">Professional Email (HTML)</option>
              <option value="EMAIL_PLAIN">Plain Text Email</option>
            </select>
          </div>
        </div>

        {/* Subject Line (for emails) */}
        {step.messageType?.includes('EMAIL') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={step.subjectTemplate || ''}
              onChange={(e) => handleStepChange('subjectTemplate', e.target.value)}
              placeholder="Enter subject line..."
              disabled={readonly}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                validationErrors.subjectTemplate ? 'border-red-300' : 'border-gray-300'
              } ${readonly ? 'bg-gray-100' : ''}`}
            />
            {validationErrors.subjectTemplate && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.subjectTemplate}</p>
            )}
          </div>
        )}

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Content
            {step.messageType === 'SMS' && (
              <span className="text-xs text-gray-500 ml-2">
                ({(step.bodyTemplate || '').length}/160 characters)
              </span>
            )}
          </label>
          <textarea
            ref={textareaRef}
            value={step.bodyTemplate || ''}
            onChange={(e) => handleStepChange('bodyTemplate', e.target.value)}
            placeholder={`Enter your ${step.messageType === 'SMS' ? 'SMS' : 'email'} message...`}
            rows={step.messageType === 'SMS' ? 4 : 6}
            disabled={readonly}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none ${
              validationErrors.bodyTemplate ? 'border-red-300' : 'border-gray-300'
            } ${readonly ? 'bg-gray-100' : ''}`}
          />
          {validationErrors.bodyTemplate && (
            <p className="text-red-600 text-xs mt-1">{validationErrors.bodyTemplate}</p>
          )}
          
          {/* Character count warning for SMS */}
          {step.messageType === 'SMS' && (step.bodyTemplate || '').length > 160 && (
            <p className="text-orange-600 text-xs mt-1">
              SMS messages over 160 characters may be split into multiple messages
            </p>
          )}
        </div>

        {/* Template Variables */}
        {!readonly && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insert Variables
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {templateVariables.map(variable => (
                <button
                  key={variable.key}
                  onClick={() => insertVariable(variable.key)}
                  className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs font-mono text-left transition-colors"
                  title={variable.description}
                >
                  {variable.key}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click to insert variables. These will be replaced with actual customer data when sent.
            </p>
          </div>
        )}

        {/* Preview */}
        {renderPreview()}
      </div>
    </div>
  );
};

export default CampaignStepEditor;