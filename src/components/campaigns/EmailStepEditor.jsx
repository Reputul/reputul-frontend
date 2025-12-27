import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buildUrl } from '../../config/api';

const EmailStepEditor = ({ step, onChange, token }) => {
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(step?.emailTemplateId || null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState(step?.subjectTemplate || '');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  useEffect(() => {
    if (step?.emailTemplateId) {
      setSelectedTemplateId(step.emailTemplateId);
      loadTemplateDetails(step.emailTemplateId);
    }
  }, [step]);

  const fetchEmailTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildUrl('/api/v1/email-templates'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailTemplates(response.data);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateDetails = async (templateId) => {
    try {
      const response = await axios.get(buildUrl(`/api/v1/email-templates/${templateId}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTemplate(response.data);
      setSubject(response.data.subject || '');
    } catch (error) {
      console.error('Error loading template details:', error);
    }
  };

  const handleTemplateChange = async (templateId) => {
    setSelectedTemplateId(templateId);
    
    if (templateId) {
      await loadTemplateDetails(templateId);
      onChange({ 
        ...step, 
        emailTemplateId: templateId,
        subjectTemplate: selectedTemplate?.subject || subject
      });
    } else {
      setSelectedTemplate(null);
      onChange({ 
        ...step, 
        emailTemplateId: null,
        subjectTemplate: subject
      });
    }
  };

  const handleSubjectChange = (e) => {
    const newSubject = e.target.value;
    setSubject(newSubject);
    onChange({ ...step, subjectTemplate: newSubject });
  };

  const getTemplateTypeLabel = (type) => {
    const labels = {
      'INITIAL_REQUEST': 'Initial Review Request',
      'FOLLOW_UP_3_DAY': '3-Day Follow-up',
      'FOLLOW_UP_7_DAY': '7-Day Follow-up',
      'FOLLOW_UP_14_DAY': '14-Day Final Follow-up',
      'THANK_YOU': 'Thank You',
      'CUSTOM': 'Custom'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Email Template Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Template
        </label>
        <select
          value={selectedTemplateId || ''}
          onChange={(e) => handleTemplateChange(e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a template...</option>
          {emailTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} {template.isDefault ? '(Default)' : ''}
            </option>
          ))}
        </select>
        
        {emailTemplates.length === 0 && (
          <p className="text-sm text-red-600 mt-2">
            ⚠️ No email templates found. Please create email templates first.
          </p>
        )}
      </div>

      {/* Subject Line (auto-filled from template) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={handleSubjectChange}
          placeholder="Enter email subject..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {selectedTemplate && (
          <p className="text-xs text-gray-500 mt-1">
            💡 Auto-filled from template. You can customize it.
          </p>
        )}
      </div>

      {/* Template Details */}
      {selectedTemplate && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {selectedTemplate.name}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Type: {getTemplateTypeLabel(selectedTemplate.type)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview Template
            </button>
          </div>

          {/* Template Preview Snippet */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-500 mb-2 font-semibold">Email Preview:</p>
            <p className="text-sm text-gray-700 line-clamp-3">
              {selectedTemplate.body?.replace(/<[^>]*>/g, '').substring(0, 150)}...
            </p>
          </div>
        </div>
      )}

      {/* Available Variables */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Variables
        </label>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="font-mono text-blue-900">{'{{customerName}}'}</div>
            <div className="text-blue-700">Customer's name</div>
            <div className="font-mono text-blue-900">{'{{businessName}}'}</div>
            <div className="text-blue-700">Your business name</div>
            <div className="font-mono text-blue-900">{'{{serviceType}}'}</div>
            <div className="text-blue-700">Service provided</div>
            <div className="font-mono text-blue-900">{'{{serviceDate}}'}</div>
            <div className="text-blue-700">Service date</div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            💡 These variables are automatically replaced in the email template
          </p>
        </div>
      </div>

      {/* Email Best Practices */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-purple-900">
            <p className="font-semibold mb-1">Email Best Practices:</p>
            <ul className="space-y-1 text-purple-800">
              <li>• Use templates for consistent branding across all emails</li>
              <li>• Edit the template itself to update all campaigns at once</li>
              <li>• Subject lines should be clear and personal</li>
              <li>• Templates include your logo and brand colors automatically</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Link to Email Templates Page */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
        <span className="text-sm text-gray-700">
          Need to customize the email content?
        </span>
        <a
          href="/email-templates"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Edit Templates
        </a>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Template Preview: {selectedTemplate.name}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailStepEditor;