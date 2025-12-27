import React, { useState, useEffect } from 'react';

// Feature flag - flip to true when SMS templates are ready
const USE_SMS_TEMPLATES = false;

const SMSStepEditor = ({ step, onChange }) => {
  const [message, setMessage] = useState(step?.bodyTemplate || '');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    setMessage(step?.bodyTemplate || '');
  }, [step]);

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    onChange({ ...step, bodyTemplate: newMessage });
  };

  const insertVariable = (variable) => {
    const newMessage = message + `{{${variable}}}`;
    setMessage(newMessage);
    onChange({ ...step, bodyTemplate: newMessage });
  };

  const availableVariables = [
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'business_name', label: 'Business Name' },
    { key: 'review_link', label: 'Review Link' },
    { key: 'business_phone', label: 'Business Phone' },
  ];

  const charCount = message.length;
  const charLimit = 320;
  const isNearLimit = charCount > 280;
  const isOverLimit = charCount > charLimit;

  return (
    <div className="space-y-4">
      {/* Future: SMS Template Selector (hidden for now) */}
      {USE_SMS_TEMPLATES && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SMS Template
          </label>
          <select
            value={selectedTemplate || 'custom'}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setSelectedTemplate(null);
              } else {
                // Future: Load template by ID
                setSelectedTemplate(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="custom">Custom (Write Your Own)</option>
            {/* Future: Map SMS templates here */}
          </select>
        </div>
      )}

      {/* SMS Message Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SMS Message
        </label>
        <textarea
          value={message}
          onChange={handleMessageChange}
          placeholder="Hi {{customer_name}}! Thanks for choosing {{business_name}}. We'd love your feedback: {{review_link}}

Reply STOP to opt out."
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
            isOverLimit ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={8}
        />
        
        {/* Character Counter */}
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-sm font-medium ${
              isOverLimit
                ? 'text-red-600'
                : isNearLimit
                ? 'text-yellow-600'
                : 'text-gray-600'
            }`}
          >
            {charCount}/{charLimit} characters
            {isOverLimit && ' - Message too long!'}
          </span>
          
          {/* Segment Counter (SMS segments every 160 chars) */}
          <span className="text-xs text-gray-500">
            {Math.ceil(charCount / 160)} message segment{Math.ceil(charCount / 160) !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Variable Inserter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Insert Variables
        </label>
        <div className="flex flex-wrap gap-2">
          {availableVariables.map((variable) => (
            <button
              key={variable.key}
              type="button"
              onClick={() => insertVariable(variable.key)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {variable.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Variables will be replaced with actual customer data when sent
        </p>
      </div>

      {/* SMS Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">SMS Best Practices:</p>
            <ul className="space-y-1 text-blue-800">
              <li>• Keep it under 160 characters when possible (1 segment = lower cost)</li>
              <li>• Always include your business name</li>
              <li>• Always include "Reply STOP to opt out" for compliance</li>
              <li>• Be friendly and personal - SMS is intimate</li>
              <li>• Make the link easy to click (use {'{{review_link}}'})</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance Check */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-green-900">
            {message.toLowerCase().includes('stop') 
              ? '✓ STOP opt-out included (TCPA compliant)'
              : '⚠️ Add "Reply STOP to opt out" for compliance'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SMSStepEditor;