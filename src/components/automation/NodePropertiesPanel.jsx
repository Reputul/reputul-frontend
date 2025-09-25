import React, { useState, useEffect } from "react";
import axios from "axios";
import { buildUrl } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const NodePropertiesPanel = ({
  node,
  onUpdate,
  onDelete,
  validationErrors = [],
}) => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState({ email: [], sms: [] });
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Load templates when component mounts
  useEffect(() => {
    if (node?.type === "email" || node?.type === "sms") {
      fetchTemplates();
    }
  }, [node?.type]);

  // Load selected template details
  useEffect(() => {
    if (node?.data?.templateId) {
      loadTemplateDetails(node.data.templateId);
    } else {
      setSelectedTemplate(null);
    }
  }, [node?.data?.templateId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const [emailRes, smsRes] = await Promise.all([
        axios.get(buildUrl("/api/email-templates"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(buildUrl("/api/sms-templates"), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTemplates({
        email: emailRes.data || [],
        sms: smsRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching templates:", error);
      // Fallback to mock templates
      setTemplates({
        email: [
          {
            id: "review-request-standard",
            name: "Review Request - Standard",
            subject: "How was our service?",
            category: "Review Request",
            preview:
              "Hi {{customer_name}}, we hope you're happy with our {{service_type}} service. Would you mind sharing your experience?",
            mergeFields: [
              "customer_name",
              "business_name",
              "service_type",
              "review_link",
            ],
          },
          {
            id: "review-request-premium",
            name: "Review Request - Premium",
            subject: "Your experience matters to us - {{business_name}}",
            category: "Review Request",
            preview:
              "Dear {{customer_name}}, thank you for choosing {{business_name}} for your {{service_type}}. Your feedback helps us serve you better.",
            mergeFields: [
              "customer_name",
              "business_name",
              "service_type",
              "review_link",
            ],
          },
          {
            id: "follow-up-reminder",
            name: "Follow-up Reminder",
            subject: "Quick reminder - Share your experience",
            category: "Follow-up",
            preview:
              "Hi {{customer_name}}, we noticed you haven't had a chance to review our {{service_type}} service yet. It only takes 30 seconds.",
            mergeFields: [
              "customer_name",
              "business_name",
              "service_type",
              "review_link",
            ],
          },
        ],
        sms: [
          {
            id: "sms-review-short",
            name: "Review Request - Short",
            content:
              "Hi {{customer_name}}! Thanks for choosing {{business_name}}. Quick review? {{review_link}} Reply STOP to opt out.",
            category: "Review Request",
            mergeFields: ["customer_name", "business_name", "review_link"],
          },
          {
            id: "sms-review-friendly",
            name: "Review Request - Friendly",
            content:
              "Hey {{customer_name}}! Hope you loved our {{service_type}}! Mind sharing your experience? {{review_link}} Text STOP to unsubscribe.",
            category: "Review Request",
            mergeFields: [
              "customer_name",
              "business_name",
              "service_type",
              "review_link",
            ],
          },
          {
            id: "sms-follow-up",
            name: "Follow-up SMS",
            content:
              "{{customer_name}}, got a sec to review our {{service_type}}? Your feedback matters! {{review_link}} Reply STOP to opt out.",
            category: "Follow-up",
            mergeFields: [
              "customer_name",
              "business_name",
              "service_type",
              "review_link",
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateDetails = (templateId) => {
    const emailTemplate = templates.email.find((t) => t.id == templateId);
    const smsTemplate = templates.sms.find((t) => t.id == templateId);
    setSelectedTemplate(emailTemplate || smsTemplate || null);
  };

  const handleUpdate = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handleTemplateChange = (templateId) => {
    handleUpdate("templateId", templateId);
    if (!templateId) {
      // Clear template-related overrides
      handleUpdate("customizeTemplate", false);
      handleUpdate("customSubject", "");
      handleUpdate("customContent", "");
    }
  };

  const handleSmsTemplateChange = (templateId) => {
    const template = templates.sms.find((t) => t.id == templateId);
    handleUpdate("smsTemplateId", templateId);
    if (template) {
      handleUpdate("message", template.content);
    }
  };

  if (!node) {
    return (
      <div className="h-full flex items-center justify-center text-center py-8 text-gray-500">
        <div>
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-lg font-medium text-gray-700">Select a Node</p>
          <p className="text-sm">Click any node to edit its properties</p>
        </div>
      </div>
    );
  }

  const renderTriggerProperties = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Trigger Event
        </label>
        <select
          value={node.data.triggerType || "SERVICE_COMPLETED"}
          onChange={(e) => handleUpdate("triggerType", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="SERVICE_COMPLETED">Service Completed</option>
          <option value="CUSTOMER_CREATED">New Customer Added</option>
          <option value="PAYMENT_RECEIVED">Payment Received</option>
          <option value="MANUAL_TRIGGER">Manual Trigger</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="e.g., Service Complete"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-500 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div className="text-sm font-medium text-blue-900 mb-1">
              Trigger Information
            </div>
            <div className="text-sm text-blue-700">
              This node starts your workflow automatically when the selected
              event occurs. Each workflow must have exactly one trigger node.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDelayProperties = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="e.g., Wait 24 Hours"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <input
            type="number"
            min="1"
            max="168"
            value={node.data.duration || 24}
            onChange={(e) =>
              handleUpdate("duration", parseInt(e.target.value) || 1)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Unit
          </label>
          <select
            value={node.data.unit || "hours"}
            onChange={(e) => handleUpdate("unit", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-1">Recommended Timing:</div>
          <div className="text-xs space-y-1">
            <div>
              • <strong>Email:</strong> 2-24 hours after service
            </div>
            <div>
              • <strong>SMS:</strong> 1-4 hours for faster response
            </div>
            <div>
              • <strong>Follow-up:</strong> 3-7 days if no response
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailProperties = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="e.g., Send Review Request Email"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Template
        </label>
        <select
          value={node.data.templateId || ""}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Create Custom Message</option>
          <optgroup label="System Templates">
            {templates.email.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.category}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Template Preview Card */}
      {selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedTemplate.name}
            </span>
            <button
              onClick={() => setShowTemplateEditor(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Customize
            </button>
          </div>
          <div className="text-sm text-blue-800 font-medium mb-2">
            Subject: {selectedTemplate.subject}
          </div>
          <div className="text-xs text-blue-600 mb-3 line-clamp-3">
            {selectedTemplate.preview}
          </div>
          <div className="flex flex-wrap gap-1">
            <div className="text-xs text-blue-700 font-medium mr-2">
              Available fields:
            </div>
            {selectedTemplate.mergeFields?.map((field) => (
              <span
                key={field}
                className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
              >
                {`{{${field}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom Email Content (when no template selected) */}
      {!node.data.templateId && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={node.data.subject || ""}
              onChange={(e) => handleUpdate("subject", e.target.value)}
              placeholder="How was our service?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Content
            </label>
            <textarea
              value={node.data.content || ""}
              onChange={(e) => handleUpdate("content", e.target.value)}
              placeholder="Hi {{customer_name}}, we hope you're happy with our {{service_type}} service..."
              rows={6}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <div className="space-x-1">
                <span>Available:</span>
                {[
                  "customer_name",
                  "business_name",
                  "service_type",
                  "review_link",
                ].map((field) => (
                  <span
                    key={field}
                    className="px-1.5 py-0.5 bg-gray-100 rounded text-xs"
                  >
                    {`{{${field}}}`}
                  </span>
                ))}
              </div>
              <span
                className={`${
                  (node.data.message || "").length > 160
                    ? "text-red-500 font-medium"
                    : ""
                }`}
              >
                {(node.data.message || "").length}/160
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Template Customization */}
      {node.data.templateId && (
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="customizeTemplate"
              checked={node.data.customizeTemplate || false}
              onChange={(e) =>
                handleUpdate("customizeTemplate", e.target.checked)
              }
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="customizeTemplate"
              className="text-sm text-gray-700"
            >
              Customize template for this workflow
            </label>
          </div>

          {node.data.customizeTemplate && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Override
                </label>
                <input
                  type="text"
                  value={node.data.customSubject || ""}
                  onChange={(e) =>
                    handleUpdate("customSubject", e.target.value)
                  }
                  placeholder={selectedTemplate?.subject || "Email subject..."}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Override
                </label>
                <textarea
                  value={node.data.customContent || ""}
                  onChange={(e) =>
                    handleUpdate("customContent", e.target.value)
                  }
                  placeholder="Override email content..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSmsProperties = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="e.g., Send SMS Review Request"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SMS Template
        </label>
        <select
          value={node.data.smsTemplateId || ""}
          onChange={(e) => handleSmsTemplateChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Create Custom Message</option>
          {templates.sms.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} - {template.category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SMS Message
        </label>
        <textarea
          value={node.data.message || ""}
          onChange={(e) => handleUpdate("message", e.target.value)}
          rows={4}
          maxLength={160}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Hi {{customer_name}}! Thanks for choosing {{business_name}}. Quick review? {{review_link}} Reply STOP to opt out."
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <div className="space-x-1">
            <span>Available:</span>
            {[
              "customer_name",
              "business_name",
              "service_type",
              "review_link",
            ].map((field) => (
              <span
                key={field}
                className="px-1.5 py-0.5 bg-gray-100 rounded text-xs"
              >
                {`{{${field}}}`}
              </span>
            ))}
          </div>
          <span
            className={`${
              (node.data.message || "").length > 160
                ? "text-red-500 font-medium"
                : ""
            }`}
          >
            {(node.data.message || "").length}/160
          </span>
        </div>
      </div>

      {/* TCPA Compliance Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-amber-500 mt-0.5 mr-3"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <div className="text-sm font-medium text-amber-800 mb-1">
              TCPA Compliance Required
            </div>
            <div className="text-sm text-amber-700">
              Ensure customers have consented to SMS. Include opt-out language
              (STOP) in all messages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConditionProperties = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="e.g., If No Response"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Condition Type
        </label>
        <select
          value={node.data.type || "no_response"}
          onChange={(e) => handleUpdate("type", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="no_response">No Response Received</option>
          <option value="negative_response">
            Negative Response (1-3 stars)
          </option>
          <option value="positive_response">
            Positive Response (4-5 stars)
          </option>
          <option value="time_elapsed">Time Elapsed</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wait Duration
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={node.data.duration || 3}
            onChange={(e) =>
              handleUpdate("duration", parseInt(e.target.value) || 1)
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Unit
          </label>
          <select
            value={node.data.unit || "days"}
            onChange={(e) => handleUpdate("unit", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="hours">Hours</option>
            <option value="days">Days</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700">
          <div className="font-medium mb-2">How Conditions Work:</div>
          <div className="space-y-1 text-xs">
            <div>• The workflow waits for the specified duration</div>
            <div>
              • If the condition is met, it continues to the next connected node
            </div>
            <div>• If not met, the workflow stops at this node</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWebhookProperties = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Label
        </label>
        <input
          type="text"
          value={node.data.label || ""}
          onChange={(e) => handleUpdate("label", e.target.value)}
          placeholder="e.g., Send to CRM"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook URL
        </label>
        <input
          type="url"
          value={node.data.url || ""}
          onChange={(e) => handleUpdate("url", e.target.value)}
          placeholder="https://your-system.com/webhook"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          HTTP Method
        </label>
        <select
          value={node.data.method || "POST"}
          onChange={(e) => handleUpdate("method", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <div className="font-medium mb-2">Data Sent:</div>
          <div className="text-xs space-y-1 font-mono bg-white/50 p-2 rounded">
            <div>customer_name, customer_email, customer_phone</div>
            <div>business_name, service_type, service_date</div>
            <div>workflow_id, execution_id, timestamp</div>
          </div>
        </div>
      </div>
    </div>
  );

  const getNodeTypeIcon = () => {
    const icons = {
      trigger: "🎯",
      delay: "⏰",
      email: "📧",
      sms: "📱",
      condition: "❓",
      webhook: "🔗",
    };
    return icons[node.type] || "⚙️";
  };

  const getNodeTypeName = () => {
    const names = {
      trigger: "Trigger",
      delay: "Delay",
      email: "Email",
      sms: "SMS",
      condition: "Condition",
      webhook: "Webhook",
    };
    return names[node.type] || "Unknown";
  };

  const renderNodeProperties = () => {
    switch (node.type) {
      case "trigger":
        return renderTriggerProperties();
      case "delay":
        return renderDelayProperties();
      case "email":
        return renderEmailProperties();
      case "sms":
        return renderSmsProperties();
      case "condition":
        return renderConditionProperties();
      case "webhook":
        return renderWebhookProperties();
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No properties available for this node type</p>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getNodeTypeIcon()}</span>
            <div>
              <h3 className="font-semibold text-gray-900">
                {getNodeTypeName()} Node
              </h3>
              <p className="text-sm text-gray-500">Configure node properties</p>
            </div>
          </div>
          {!node.id.startsWith("trigger-") && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete node"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Properties Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          renderNodeProperties()
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border-t border-red-200 bg-red-50 p-4">
          <div className="text-sm font-medium text-red-800 mb-2">
            Validation Errors:
          </div>
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index} className="text-xs text-red-700">
                • {error.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-xs text-gray-500">
          <div>Node ID: {node.id}</div>
          <div>
            Position: ({Math.round(node.position.x)},{" "}
            {Math.round(node.position.y)})
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;
