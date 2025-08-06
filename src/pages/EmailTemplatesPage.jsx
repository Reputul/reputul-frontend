import React, { useState, useEffect } from "react";
import axios from "axios";
import { renderTrustedHtml } from "../utils/sanitizer";

// Email preview styles
const emailPreviewStyles = `
  .email-preview-content {
    font-family: Arial, Helvetica, sans-serif !important;
    line-height: 1.4 !important;
    color: #333333 !important;
    width: 100% !important;
    max-width: none !important;
  }
  
  .email-preview-content table {
    border-collapse: collapse !important;
    width: 100% !important;
    mso-table-lspace: 0pt !important;
    mso-table-rspace: 0pt !important;
  }
  
  .email-preview-content td {
    border-collapse: collapse !important;
  }
  
  .email-preview-content img {
    max-width: 100% !important;
    height: auto !important;
    border: 0 !important;
    display: block !important;
  }
  
  .email-preview-content a {
    text-decoration: underline !important;
    cursor: pointer !important;
    color: inherit !important;
  }
  
  .email-preview-content a[style*="background"] {
    display: inline-block !important;
    text-decoration: none !important;
  }
  
  .email-preview-content a[style*="background"]:hover {
    opacity: 0.8 !important;
  }
  
  .email-preview-content h1,
  .email-preview-content h2,
  .email-preview-content h3,
  .email-preview-content h4,
  .email-preview-content h5,
  .email-preview-content h6 {
    margin-top: 0 !important;
    font-weight: bold !important;
    line-height: 1.2 !important;
  }
  
  .email-preview-content p {
    margin: 0 0 15px 0 !important;
    font-size: 14px !important;
    line-height: 1.4 !important;
  }
`;

const EmailTemplatesPage = () => {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
  const API_BASE_URL = `${API_BASE}/api/email-templates`;
  const [templates, setTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [previewData, setPreviewData] = useState({
    customerName: "John Smith",
    businessName: "ABC Home Services",
    serviceType: "Kitchen Sink Repair",
    serviceDate: "2025-01-15",
    businessPhone: "(555) 123-4567",
    businessWebsite: "www.abchomeservices.com",
    businessAddress: "123 Main St, Springfield, IL 62701",
    supportEmail: "support@abchomeservices.com",
    googleReviewUrl: "https://google.com/review/placeholder",
    facebookReviewUrl: "https://facebook.com/review/placeholder",
    yelpReviewUrl: "https://yelp.com/review/placeholder",
    privateReviewUrl: "https://reputul.com/feedback/placeholder",
    unsubscribeUrl: "https://reputul.com/unsubscribe/placeholder"
  });

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    subject: "",
    body: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Fetch templates and types on mount
  useEffect(() => {
    fetchTemplates();
    fetchTemplateTypes();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching all templates...");

      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }

      const templates = await response.json();
      console.log("✅ Fetched templates:", templates.length);

      setTemplates(templates);
      return templates;
    } catch (error) {
      console.error("❌ Error fetching templates:", error);
      setError("Failed to load templates. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE}/api/email-templates/types`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Template types response:", response.data);
      setTemplateTypes(response.data);
    } catch (err) {
      console.error("Error fetching template types:", err);
      // Fallback to hardcoded types if API fails
      setTemplateTypes([
        "INITIAL_REQUEST",
        "FOLLOW_UP_3_DAY",
        "FOLLOW_UP_7_DAY",
        "FOLLOW_UP_14_DAY",
        "THANK_YOU",
        "CUSTOM",
      ]);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/api/email-templates`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowCreateModal(false);
      setFormData({ name: "", type: "", subject: "", body: "" });
      setSuccess("Template created successfully!");
      fetchTemplates();
    } catch (err) {
      setError("Failed to create template");
      console.error("Error creating template:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTemplate = async (templateId, formData) => {
    try {
      console.log(`🚀 Updating template ${templateId}...`);
      setLoading(true);
      setError("");
      setSuccess("");

      // First, fetch the current template to ensure we have all required fields
      const currentTemplateResponse = await fetch(
        `${API_BASE_URL}/${templateId}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      if (!currentTemplateResponse.ok) {
        throw new Error(
          `Failed to fetch current template: ${currentTemplateResponse.status}`
        );
      }

      const currentTemplate = await currentTemplateResponse.json();
      console.log("📋 Current template data:", currentTemplate);

      // Prepare update data with all required fields
      const updateData = {
        name: formData.name || currentTemplate.name,
        subject: formData.subject || currentTemplate.subject,
        body: formData.body || currentTemplate.body,
        type: formData.type || currentTemplate.type,
        isActive:
          formData.isActive !== undefined
            ? formData.isActive
            : currentTemplate.isActive,
        isDefault:
          formData.isDefault !== undefined
            ? formData.isDefault
            : currentTemplate.isDefault,
        availableVariables: formData.availableVariables ||
          currentTemplate.availableVariables || [
            "customerName",
            "businessName",
            "serviceType",
            "serviceDate",
            "businessPhone",
            "businessWebsite",
            "googleReviewUrl",
            "facebookReviewUrl",
            "privateReviewUrl",
            "unsubscribeUrl",
          ],
      };

      console.log("📤 Sending update data:", updateData);

      // Send the update request
      const updateResponse = await fetch(`${API_BASE_URL}/${templateId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      console.log(`📊 Update response status: ${updateResponse.status}`);

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("❌ Update failed:", errorText);
        throw new Error(
          `Update failed: ${updateResponse.status} - ${errorText}`
        );
      }

      const updatedTemplate = await updateResponse.json();
      console.log("✅ Template updated successfully:", updatedTemplate);

      setSuccess("Template updated successfully!");
      setShowEditModal(false);

      // Refresh the template list
      await fetchTemplates();

      return updatedTemplate;
    } catch (error) {
      console.error("❌ Error updating template:", error);

      let errorMessage = "Failed to update template. Please try again.";

      if (error.message.includes("404")) {
        errorMessage =
          "Template not found. Please refresh the page and try again.";
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        errorMessage = "Authentication error. Please log in again.";
      } else if (error.message.includes("400")) {
        errorMessage = "Invalid template data. Please check your inputs.";
      }

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) {
      setError("No template selected for editing");
      return;
    }

    try {
      await handleUpdateTemplate(selectedTemplate.id, formData);
    } catch (error) {
      // Error is already handled in handleUpdateTemplate
      console.log("Update failed, but error is already displayed to user");
    }
  };

  // Handle delete template
  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_BASE_URL}/${templateId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }

      setSuccess("Template deleted successfully!");
      await fetchTemplates();
    } catch (error) {
      console.error("❌ Error deleting template:", error);
      setError("Failed to delete template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Updated preview handler with better error handling and debugging
  const handlePreviewTemplate = async (template) => {
    try {
      console.log('🔍 Previewing template:', template.name);
      console.log('📋 Preview data:', previewData);
      
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE}/api/email-templates/${template.id}/preview`,
        previewData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📧 Preview response:", response.data);

      // Better handling of different response formats
      let content = "";
      let subject = "";
      
      if (typeof response.data === "string") {
        // If response is just HTML string
        content = response.data;
      } else if (response.data && typeof response.data === "object") {
        // If response is an object with preview data
        content = response.data.renderedBody || response.data.body || response.data.content || "";
        subject = response.data.renderedSubject || response.data.subject || "";
        
        console.log("📧 Extracted content length:", content.length);
        console.log("📧 Extracted subject:", subject);
      }

      // Safety check: Ensure we have content
      if (!content || content.trim().length === 0) {
        console.warn("⚠️ No content received, using fallback");
        content = `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Preview Error</h2>
            <p>Unable to generate preview content. Response:</p>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
              ${JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        `;
      }

      // Ensure proper HTML structure for better preview
      if (content && !content.includes('<!DOCTYPE') && !content.includes('<html')) {
        console.log("🔧 Content appears to be HTML fragment, preserving as-is for preview");
        // Keep the content as-is since our templates are complete HTML documents
      }

      setPreviewContent(content);
      setSelectedTemplate({...template, subject: subject || template.subject});
      setShowPreviewModal(true);
      
      console.log("✅ Preview modal opened successfully");
      
    } catch (err) {
      console.error("❌ Error generating preview:", err);
      
      // Show detailed error information
      let errorMessage = "Failed to generate preview";
      if (err.response) {
        errorMessage += `: ${err.response.status} - ${err.response.data || err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Show error in modal instead of just alert
      setPreviewContent(`
        <div style="padding: 20px; font-family: Arial, sans-serif; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">⚠️ Preview Error</h3>
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p><strong>Template:</strong> ${template.name}</p>
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
            <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto; margin-top: 10px; white-space: pre-wrap;">
              ${JSON.stringify(err.response?.data || err, null, 2)}
            </pre>
          </details>
        </div>
      `);
      setSelectedTemplate(template);
      setShowPreviewModal(true);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", type: "", subject: "", body: "" });
    setShowCreateModal(true);
    setError("");
    setSuccess("");
  };

  const openEditModal = (template) => {
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
    });
    setSelectedTemplate(template);
    setShowEditModal(true);
    setError("");
    setSuccess("");
  };

  const insertVariable = (variable, isEdit = false) => {
    const textareaId = isEdit ? "template-body-edit" : "template-body";
    const textarea = document.getElementById(textareaId);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText =
      text.substring(0, start) + `{{${variable}}}` + text.substring(end);

    setFormData((prev) => ({ ...prev, body: newText }));

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + variable.length + 4,
        start + variable.length + 4
      );
    }, 0);
  };

  const getTypeDisplayName = (type) => {
    if (!type || typeof type !== "string") {
      console.warn("getTypeDisplayName received non-string:", type);
      return String(type || "");
    }
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTypeColor = (type) => {
    const colors = {
      INITIAL_REQUEST: "bg-blue-100 text-blue-800",
      FOLLOW_UP_3_DAY: "bg-yellow-100 text-yellow-800",
      FOLLOW_UP_7_DAY: "bg-orange-100 text-orange-800",
      FOLLOW_UP_14_DAY: "bg-red-100 text-red-800",
      THANK_YOU: "bg-green-100 text-green-800",
      CUSTOM: "bg-purple-100 text-purple-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <style>{emailPreviewStyles}</style>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">
            Manage your review request email templates
          </p>
        </div>

        {/* Show both error and success messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Create New Template
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow border">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                      template.type
                    )}`}
                  >
                    {template.typeDisplayName ||
                      getTypeDisplayName(template.type)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">{template.subject}</p>

                <div className="text-xs text-gray-500 mb-4">
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => openEditModal(template)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Create Email Template</h2>

              <form onSubmit={handleCreateTemplate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">Select Type</option>
                      {templateTypes.map((type, index) => {
                        // Handle both string and object formats
                        const typeValue =
                          typeof type === "string" ? type : type.type || type;
                        const typeDisplay =
                          typeof type === "string"
                            ? getTypeDisplayName(type)
                            : type.displayName ||
                              getTypeDisplayName(type.type || type);

                        return (
                          <option key={`${typeValue}-${index}`} value={typeValue}>
                            {typeDisplay}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Body
                    </label>
                    <textarea
                      id="template-body"
                      value={formData.body}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, body: e.target.value }))
                      }
                      rows="10"
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variables
                    </label>
                    <div className="space-y-2">
                      {[
                        "customerName",
                        "businessName",
                        "serviceType",
                        "serviceDate",
                        "businessPhone",
                        "businessWebsite",
                        "googleReviewUrl",
                        "facebookReviewUrl",
                        "yelpReviewUrl",
                        "privateReviewUrl",
                      ].map((variable) => (
                        <button
                          key={variable}
                          type="button"
                          onClick={() => insertVariable(variable)}
                          className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Edit Email Template</h2>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    >
                      <option value="">Select Type</option>
                      {templateTypes.map((type, index) => {
                        // Handle both string and object formats
                        const typeValue =
                          typeof type === "string" ? type : type.type || type;
                        const typeDisplay =
                          typeof type === "string"
                            ? getTypeDisplayName(type)
                            : type.displayName ||
                              getTypeDisplayName(type.type || type);

                        return (
                          <option
                            key={`edit-${typeValue}-${index}`}
                            value={typeValue}
                          >
                            {typeDisplay}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Body
                    </label>
                    <textarea
                      id="template-body-edit"
                      value={formData.body}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, body: e.target.value }))
                      }
                      rows="10"
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variables
                    </label>
                    <div className="space-y-2">
                      {[
                        "customerName",
                        "businessName",
                        "serviceType",
                        "serviceDate",
                        "businessPhone",
                        "businessWebsite",
                        "googleReviewUrl",
                        "facebookReviewUrl",
                        "yelpReviewUrl",
                        "privateReviewUrl",
                      ].map((variable) => (
                        <button
                          key={variable}
                          type="button"
                          onClick={() => insertVariable(variable, true)}
                          className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-7xl max-h-[95vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Preview: {selectedTemplate?.name}
                </h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Preview Controls */}
                <div className="lg:col-span-1">
                  <h3 className="font-medium text-gray-900 mb-3">Preview Data</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.entries(previewData).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 text-xs">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            setPreviewData((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded text-xs"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => handlePreviewTemplate(selectedTemplate)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Update Preview
                    </button>
                  </div>
                </div>

                {/* Email Preview */}
                <div className="lg:col-span-3">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Email Preview
                  </h3>
                  
                  {/* Email Client Mockup */}
                  <div className="border border-gray-300 rounded-lg bg-gray-100 p-4">
                    {/* Mock Email Header */}
                    <div className="bg-white rounded-t-lg border border-gray-200 p-3 mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {previewData.businessName?.charAt(0) || 'B'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{previewData.businessName || 'Business Name'}</div>
                            <div className="text-xs text-gray-500">no-reply@business.com</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">Just now</div>
                      </div>
                      
                      {/* Subject Line */}
                      <div className="text-sm text-gray-900 font-medium mb-2 border-b pb-2">
                        Subject: {selectedTemplate?.subject ? 
                          selectedTemplate.subject
                            .replace(/\{\{customerName\}\}/g, previewData.customerName)
                            .replace(/\{\{businessName\}\}/g, previewData.businessName)
                            .replace(/\{\{serviceType\}\}/g, previewData.serviceType)
                            .replace(/\{\{serviceDate\}\}/g, previewData.serviceDate)
                          : 'Email Subject'
                        }
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="bg-white rounded-b-lg border-l border-r border-b border-gray-200 overflow-hidden">
                      <div 
                        className="email-preview-content"
                        style={{
                          fontFamily: 'Arial, Helvetica, sans-serif',
                          lineHeight: '1.4',
                          color: '#333333',
                          width: '100%',
                          maxWidth: 'none'
                        }}
                        dangerouslySetInnerHTML={{
                          __html: renderTrustedHtml(previewContent || '<p>Loading preview...</p>')
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-500 mt-0.5">💡</div>
                      <div className="text-sm text-blue-800">
                        <strong>Preview Note:</strong> This shows how your email will appear with full styling. 
                        Some email clients may display slightly differently due to their CSS limitations.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EmailTemplatesPage;