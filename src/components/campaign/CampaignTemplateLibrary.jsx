import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { buildUrl } from "../../config/api";
import ModalPortal from "../common/ModalPortal";

/**
 * CampaignTemplateLibrary Component
 *
 * A comprehensive library of pre-built campaign templates.
 * Includes industry-specific templates and general best practices.
 *
 * Props:
 * - onSelectTemplate: Function called when user selects a template
 * - onClose: Function called when closing the modal
 * - selectedIndustry: Optional industry filter (e.g., 'hvac', 'roofing')
 */
const CampaignTemplateLibrary = ({
  onSelectTemplate,
  onClose,
  selectedIndustry = null,
}) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Built-in templates for home services
  const builtInTemplates = [
    {
      id: "quick-sms",
      name: "Quick SMS Follow-up",
      description: "Simple SMS request sent 2 hours after service completion",
      category: "quick",
      industry: "all",
      rating: 4.8,
      usageCount: 1247,
      steps: [
        {
          stepNumber: 1,
          delayHours: 2,
          messageType: "SMS",
          subjectTemplate: "",
          bodyTemplate:
            "Hi {{customerName}}! How was your experience with {{businessName}}? Please share your feedback: {{reviewLink}}",
        },
      ],
    },
    {
      id: "professional-2step",
      name: "Professional 2-Step",
      description: "Email request with SMS follow-up for maximum response",
      category: "multi-channel",
      industry: "all",
      rating: 4.9,
      usageCount: 2156,
      steps: [
        {
          stepNumber: 1,
          delayHours: 4,
          messageType: "EMAIL_PROFESSIONAL",
          subjectTemplate: "How was your {{serviceType}} experience?",
          bodyTemplate:
            "Dear {{customerName}},\n\nThank you for choosing {{businessName}} for your {{serviceType}}. We hope everything went perfectly!\n\nYour feedback means the world to us. Could you take 30 seconds to share your experience?\n\n{{reviewLink}}\n\nBest regards,\n{{businessName}} Team\n\n{{unsubscribeLink}}",
        },
        {
          stepNumber: 2,
          delayHours: 72,
          messageType: "SMS",
          subjectTemplate: "",
          bodyTemplate:
            "Quick reminder: How was your {{serviceType}} with {{businessName}}? {{reviewLink}}",
        },
      ],
    },
    {
      id: "hvac-specialist",
      name: "HVAC Service Sequence",
      description: "Optimized for heating and cooling services",
      category: "industry",
      industry: "hvac",
      rating: 4.7,
      usageCount: 834,
      steps: [
        {
          stepNumber: 1,
          delayHours: 24,
          messageType: "EMAIL_PROFESSIONAL",
          subjectTemplate: "How is your {{serviceType}} working?",
          bodyTemplate:
            "Hi {{customerName}},\n\nI hope your {{serviceType}} is working perfectly! At {{businessName}}, we take pride in ensuring your comfort.\n\nWould you mind sharing how everything went? Your review helps other homeowners find reliable HVAC service.\n\n{{reviewLink}}\n\nStay comfortable!\n{{businessName}}\n\n{{unsubscribeLink}}",
        },
        {
          stepNumber: 2,
          delayHours: 120,
          messageType: "SMS",
          subjectTemplate: "",
          bodyTemplate:
            "Hi {{customerName}}, just checking in on your {{serviceType}}. Mind leaving a quick review? {{reviewLink}} - {{businessName}}",
        },
      ],
    },
    {
      id: "roofing-specialist",
      name: "Roofing Project Follow-up",
      description: "Designed for roofing contractors and major projects",
      category: "industry",
      industry: "roofing",
      rating: 4.8,
      usageCount: 567,
      steps: [
        {
          stepNumber: 1,
          delayHours: 48,
          messageType: "EMAIL_PROFESSIONAL",
          subjectTemplate: "Your roofing project is complete!",
          bodyTemplate:
            "Dear {{customerName}},\n\nYour roofing project with {{businessName}} is now complete. We hope you're thrilled with the results!\n\nProtecting your home is our top priority. If you're satisfied with our craftsmanship, would you consider sharing your experience?\n\n{{reviewLink}}\n\nThank you for trusting us with your home.\n\nBest regards,\n{{businessName}}\n\n{{unsubscribeLink}}",
        },
      ],
    },
    {
      id: "plumbing-emergency",
      name: "Plumbing Service Sequence",
      description: "Perfect for emergency and scheduled plumbing services",
      category: "industry",
      industry: "plumbing",
      rating: 4.6,
      usageCount: 723,
      steps: [
        {
          stepNumber: 1,
          delayHours: 12,
          messageType: "SMS",
          subjectTemplate: "",
          bodyTemplate:
            "Hi {{customerName}}! Is everything working well after our {{serviceType}} service? We'd appreciate a quick review: {{reviewLink}} - {{businessName}}",
        },
        {
          stepNumber: 2,
          delayHours: 96,
          messageType: "EMAIL_PLAIN",
          subjectTemplate: "How did we do with your plumbing?",
          bodyTemplate:
            "Hi {{customerName}},\n\nJust following up on the {{serviceType}} we completed. We hope everything is working perfectly!\n\nIf you have a moment, we'd really appreciate your feedback: {{reviewLink}}\n\nThanks!\n{{businessName}}\n\n{{unsubscribeLink}}",
        },
      ],
    },
    {
      id: "landscaping-seasonal",
      name: "Landscaping Follow-up",
      description: "Great for landscaping and outdoor services",
      category: "industry",
      industry: "landscaping",
      rating: 4.7,
      usageCount: 445,
      steps: [
        {
          stepNumber: 1,
          delayHours: 24,
          messageType: "EMAIL_PROFESSIONAL",
          subjectTemplate: "How does your property look?",
          bodyTemplate:
            "Hi {{customerName}},\n\nWe hope you're loving the results of our {{serviceType}} work! At {{businessName}}, we take pride in transforming outdoor spaces.\n\nIf you're happy with how everything turned out, would you mind sharing your experience?\n\n{{reviewLink}}\n\nThank you for choosing us for your landscaping needs!\n\n{{businessName}}\n\n{{unsubscribeLink}}",
        },
      ],
    },
    {
      id: "aggressive-3step",
      name: "Aggressive 3-Step Sequence",
      description: "Maximum follow-up for businesses wanting more reviews",
      category: "high-volume",
      industry: "all",
      rating: 4.5,
      usageCount: 892,
      steps: [
        {
          stepNumber: 1,
          delayHours: 2,
          messageType: "SMS",
          subjectTemplate: "",
          bodyTemplate:
            "Hi {{customerName}}! Thanks for choosing {{businessName}}. How did everything go? {{reviewLink}}",
        },
        {
          stepNumber: 2,
          delayHours: 48,
          messageType: "EMAIL_PROFESSIONAL",
          subjectTemplate: "We'd love your feedback!",
          bodyTemplate:
            "Dear {{customerName}},\n\nThank you for choosing {{businessName}} for your {{serviceType}}. We hope you had a great experience!\n\nWould you mind taking a moment to share your feedback? It really helps us and other customers.\n\n{{reviewLink}}\n\nBest regards,\n{{businessName}} Team\n\n{{unsubscribeLink}}",
        },
        {
          stepNumber: 3,
          delayHours: 168,
          messageType: "SMS",
          subjectTemplate: "",
          bodyTemplate:
            "Last reminder: Could you spare 30 seconds to review {{businessName}}? {{reviewLink}} Thank you!",
        },
      ],
    },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // Try to fetch from API, fall back to built-in templates
      const response = await axios.get(buildUrl("/api/v1/campaigns/templates"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const apiTemplates = response.data || [];
      const allTemplates = [...builtInTemplates, ...apiTemplates];

      setTemplates(allTemplates);

      // Extract categories
      const uniqueCategories = [
        ...new Set(allTemplates.map((t) => t.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.warn(
        "Could not fetch templates from API, using built-in templates"
      );
      setTemplates(builtInTemplates);
      setCategories([...new Set(builtInTemplates.map((t) => t.category))]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry =
      !selectedIndustry ||
      template.industry === "all" ||
      template.industry === selectedIndustry;

    return matchesCategory && matchesSearch && matchesIndustry;
  });

  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate({
        name: template.name,
        description: template.description,
        steps: template.steps.map((step) => ({
          ...step,
          stepNumber: step.stepNumber,
        })),
      });
    }
    onClose();
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "quick":
        return "⚡";
      case "multi-channel":
        return "📱";
      case "industry":
        return "🏠";
      case "high-volume":
        return "📈";
      default:
        return "📋";
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "quick":
        return "Quick & Simple";
      case "multi-channel":
        return "Multi-Channel";
      case "industry":
        return "Industry-Specific";
      case "high-volume":
        return "High Volume";
      default:
        return category;
    }
  };

  const renderStarRating = (rating) => {
    const stars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    return (
      <div className="flex items-center gap-1">
        {[...Array(stars)].map((_, i) => (
          <span key={i} className="text-yellow-400">
            ★
          </span>
        ))}
        {hasHalf && <span className="text-yellow-400">★</span>}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading templates...</p>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <>
      <ModalPortal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Template Library
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
                >
                  ×
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📧</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No templates found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getCategoryIcon(template.category)}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                            {getCategoryName(template.category)}
                          </span>
                        </div>
                        {template.industry !== "all" && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            {template.industry.toUpperCase()}
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-800 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        {renderStarRating(template.rating)}
                        <span className="text-xs text-gray-500">
                          {template.usageCount?.toLocaleString()} uses
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <span>
                          {template.steps.length} step
                          {template.steps.length > 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>
                          {template.steps.some(
                            (s) => s.messageType === "SMS"
                          ) &&
                          template.steps.some((s) =>
                            s.messageType.includes("EMAIL")
                          )
                            ? "SMS + Email"
                            : template.steps.some(
                                (s) => s.messageType === "SMS"
                              )
                            ? "SMS Only"
                            : "Email Only"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Showing {filteredTemplates.length} of {templates.length}{" "}
                  templates
                </span>
                <div className="flex gap-4">
                  <span>Built-in: {builtInTemplates.length}</span>
                  <span>
                    Custom: {templates.length - builtInTemplates.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>

      {/* Preview Modal - Separate portal */}
      {previewTemplate && (
        <ModalPortal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    {previewTemplate.name}
                  </h3>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl font-semibold"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  {previewTemplate.description}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {previewTemplate.steps.map((step, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          Step {step.stepNumber}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {index === 0
                            ? "Immediately"
                            : `${step.delayHours}h delay`}
                        </span>
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {step.messageType}
                        </span>
                      </div>

                      {step.subjectTemplate && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-gray-700">
                            Subject:
                          </div>
                          <div className="text-sm text-gray-600">
                            {step.subjectTemplate}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-sm font-medium text-gray-700">
                          Message:
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {step.bodyTemplate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};

export default CampaignTemplateLibrary;
