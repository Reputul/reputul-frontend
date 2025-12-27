import React, { useState, useEffect } from "react";
import axios from "axios";
import { renderTrustedHtml } from "../utils/sanitizer";
import { API_ENDPOINTS, buildUrl } from '../config/api';
import EmailTemplateVisualEditor from '../components/EmailTemplateVisualEditor';

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
  const [templates, setTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [templateStats, setTemplateStats] = useState({});
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filterType, setFilterType] = useState("all"); // Filter by template type
  const [searchQuery, setSearchQuery] = useState("");
  const [previewData, setPreviewData] = useState({
    customerName: "John Smith",
    businessName: "ABC Home Services",
    serviceType: "Kitchen Sink Repair",
    serviceDate: "2025-01-15",
    businessPhone: "(555) 123-4567",
    businessWebsite: "www.abchomeservices.com",
    businessAddress: "123 Main St, Springfield, IL 62701",
    supportEmail: "support@abchomeservices.com",
    googleReviewUrl: "https://search.google.com/local/writereview?placeid=sample_place_id",
    facebookReviewUrl: "https://facebook.com/abchomeservices/reviews",
    yelpReviewUrl: "https://yelp.com/biz/abc-home-services",
    privateFeedbackUrl: "https://reputul.com/feedback-gate/123",
    privateReviewUrl: "https://reputul.com/feedback/123",
    unsubscribeUrl: "https://reputul.com/unsubscribe/123"
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
    fetchTemplateStats();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log("📋 Fetching all templates...");

      const response = await fetch(buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.LIST), {
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
        buildUrl('/api/v1/email-templates/types'),
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

  const fetchTemplateStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(buildUrl(API_ENDPOINTS.REVIEW_REQUESTS.STATS), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplateStats(response.data);
    } catch (err) {
      console.error('Error fetching template stats:', err);
    }
  };

  const handleCreateTemplate = async (templateData) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      await axios.post(buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.LIST), templateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowVisualEditor(false);
      setSuccess("Template created successfully!");
      await fetchTemplates();
      await fetchTemplateStats();
    } catch (err) {
      setError("Failed to create template");
      console.error("Error creating template:", err);
      throw err;
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

      const currentTemplateResponse = await fetch(
        buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.BY_ID(templateId)),
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
            "yelpReviewUrl",
            "privateFeedbackUrl",
            "privateReviewUrl",
            "unsubscribeUrl",
          ],
      };

      console.log("📤 Sending update data:", updateData);

      const updateResponse = await fetch(buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.BY_ID(templateId)), {
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
      setShowVisualEditor(false);
      setEditingTemplate(null);

      await fetchTemplates();
      await fetchTemplateStats();

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

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.BY_ID(templateId)), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }

      setSuccess("Template deleted successfully!");
      await fetchTemplates();
      await fetchTemplateStats();
    } catch (error) {
      console.error("❌ Error deleting template:", error);
      setError("Failed to delete template. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      console.log('🔍 Previewing template:', template.name);
      console.log('📋 Preview data:', previewData);
      
      const token = localStorage.getItem("token");
      const response = await axios.post(
        buildUrl(API_ENDPOINTS.EMAIL_TEMPLATES.PREVIEW(template.id)),
        previewData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("📧 Preview response:", response.data);

      let content = "";
      let subject = "";
      
      if (typeof response.data === "string") {
        content = response.data;
      } else if (response.data && typeof response.data === "object") {
        content = response.data.renderedBody || response.data.body || response.data.content || "";
        subject = response.data.renderedSubject || response.data.subject || "";
        
        console.log("📧 Extracted content length:", content.length);
        console.log("📧 Extracted subject:", subject);
      }

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

      if (content && !content.includes('<!DOCTYPE') && !content.includes('<html')) {
        console.log("📧 Content appears to be HTML fragment, preserving as-is for preview");
      }

      setPreviewContent(content);
      setSelectedTemplate({...template, subject: subject || template.subject});
      setShowPreviewModal(true);
      
      console.log("✅ Preview modal opened successfully");
      
    } catch (err) {
      console.error("❌ Error generating preview:", err);
      
      let errorMessage = "Failed to generate preview";
      if (err.response) {
        errorMessage += `: ${err.response.status} - ${err.response.data || err.response.statusText}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
      
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
    setEditingTemplate(null);
    setShowVisualEditor(true);
    setError("");
    setSuccess("");
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setShowVisualEditor(true);
    setError("");
    setSuccess("");
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
      INITIAL_REQUEST: "bg-purple-100 text-purple-700 border-purple-200",
      FOLLOW_UP_3_DAY: "bg-blue-100 text-blue-700 border-blue-200",
      FOLLOW_UP_7_DAY: "bg-indigo-100 text-indigo-700 border-indigo-200",
      FOLLOW_UP_14_DAY: "bg-orange-100 text-orange-700 border-orange-200",
      THANK_YOU: "bg-green-100 text-green-700 border-green-200",
      CUSTOM: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getTypeIcon = (type) => {
    const icons = {
      INITIAL_REQUEST: "📨",
      FOLLOW_UP_3_DAY: "⏰",
      FOLLOW_UP_7_DAY: "🔔",
      FOLLOW_UP_14_DAY: "📢",
      THANK_YOU: "🎉",
      CUSTOM: "✏️",
    };
    return icons[type] || "📧";
  };

  // Template filtering and search
  const filteredTemplates = templates.filter(template => {
    const matchesType = filterType === "all" || template.type === filterType;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });


  return (
    <>
      <style>{emailPreviewStyles}</style>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
                <p className="mt-2 text-gray-600">
                  Create and manage professional email templates for your review campaigns
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Template
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Templates</p>
                    <p className="text-3xl font-bold text-purple-900 mt-1">{templates.length}</p>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-lg">
                    <span className="text-3xl">📧</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Templates</p>
                    <p className="text-3xl font-bold text-blue-900 mt-1">
                      {templates.filter(t => t.isActive).length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-lg">
                    <span className="text-3xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Emails Sent</p>
                    <p className="text-3xl font-bold text-green-900 mt-1">
                      {templateStats.emailRequests || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-200 rounded-lg">
                    <span className="text-3xl">📨</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">HTML Templates</p>
                    <p className="text-3xl font-bold text-orange-900 mt-1">
                      {templates.filter(t => t.isHtml).length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-200 rounded-lg">
                    <span className="text-3xl">🎨</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Filter by Type */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Templates</option>
                  {templateTypes.map((type, index) => {
                    const typeValue = typeof type === "string" ? type : type.type || type;
                    const typeDisplay = typeof type === "string" ? getTypeDisplayName(type) : type.displayName || getTypeDisplayName(type.type || type);
                    return (
                      <option key={`filter-${typeValue}-${index}`} value={typeValue}>
                        {typeDisplay}
                      </option>
                    );
                  })}
                </select>

                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-300 ${
                      viewMode === "list"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Display */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || filterType !== "all" ? "No templates found" : "No templates yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filterType !== "all"
                    ? "Try adjusting your search or filter"
                    : "Get started by creating your first email template"}
                </p>
                {!searchQuery && filterType === "all" && (
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Template
                  </button>
                )}
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Template Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getTypeIcon(template.type)}</span>
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                          {template.name}
                        </h3>
                      </div>
                      {template.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                      {template.typeDisplayName || getTypeDisplayName(template.type)}
                    </span>
                  </div>

                  {/* Template Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500 mb-1">Subject Line</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{template.subject}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                      {template.isActive ? (
                        <span className="inline-flex items-center text-green-600">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-400">Inactive</span>
                      )}
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="px-6 pb-6 flex gap-2">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => openEditModal(template)}
                      className="flex-1 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium rounded-lg transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTemplates.map((template) => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTypeIcon(template.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            {template.isDefault && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                          {template.typeDisplayName || getTypeDisplayName(template.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{template.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.isActive ? (
                          <span className="inline-flex items-center text-sm text-green-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            Active
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Inactive</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Preview"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(template)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visual Template Editor */}
        {showVisualEditor && (
          <EmailTemplateVisualEditor
            template={editingTemplate}
            onSave={editingTemplate ? 
              (data) => handleUpdateTemplate(editingTemplate.id, data) : 
              handleCreateTemplate
            }
            onCancel={() => {
              setShowVisualEditor(false);
              setEditingTemplate(null);
            }}
          />
        )}

        {/* Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Template Preview
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{selectedTemplate?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-8">
                  {/* Preview Controls */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 sticky top-0">
                      <h3 className="font-semibold text-gray-900 mb-4">Preview Data</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {Object.entries(previewData).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => handlePreviewTemplate(selectedTemplate)}
                          className="w-full bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 font-medium transition-colors"
                        >
                          Refresh Preview
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Email Preview */}
                  <div className="lg:col-span-3">
                    <div className="bg-gray-100 rounded-lg p-6">
                      {/* Email Client Mockup */}
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Mock Email Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm">
                                {previewData.businessName?.charAt(0) || 'B'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{previewData.businessName || 'Business Name'}</div>
                                <div className="text-xs text-gray-500">no-reply@business.com</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">Just now</div>
                          </div>
                          
                          {/* Subject Line */}
                          <div className="bg-white rounded-md p-3 border border-gray-200">
                            <div className="text-xs text-gray-500 mb-1">Subject:</div>
                            <div className="text-sm text-gray-900 font-medium">
                              {selectedTemplate?.subject ? 
                                selectedTemplate.subject
                                  .replace(/\{\{customerName\}\}/g, previewData.customerName)
                                  .replace(/\{\{businessName\}\}/g, previewData.businessName)
                                  .replace(/\{\{serviceType\}\}/g, previewData.serviceType)
                                  .replace(/\{\{serviceDate\}\}/g, previewData.serviceDate)
                                : 'Email Subject'
                              }
                            </div>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div 
                          className="email-preview-content bg-white"
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

                      {/* Preview Info */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm text-blue-800">
                            <strong>Preview Note:</strong> This is how your email will appear to customers. 
                            Actual rendering may vary slightly depending on the email client.
                          </div>
                        </div>
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