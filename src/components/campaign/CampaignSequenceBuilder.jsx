import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { buildUrl } from "../../config/api";
import CampaignStepEditor from "./CampaignStepEditor";
import CampaignTemplateLibrary from "./CampaignTemplateLibrary";
import ModalPortal from "../common/ModalPortal";

const CampaignSequenceBuilder = ({ sequence, onClose, onSave }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isDefault: false,
    steps: [],
  });
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);

  useEffect(() => {
    if (sequence) {
      setFormData({
        name: sequence.name || "",
        description: sequence.description || "",
        isDefault: sequence.isDefault || false,
        steps: sequence.steps || [],
      });
    } else {
      // Initialize with default SMS + email sequence
      setFormData({
        name: "",
        description: "",
        isDefault: false,
        steps: [
          {
            stepNumber: 1,
            delayHours: 0,
            messageType: "SMS",
            subjectTemplate: "",
            bodyTemplate:
              "Hi {{customerName}}! How was your experience with {{businessName}}? We'd love to hear about it: {{reviewLink}}",
          },
          {
            stepNumber: 2,
            delayHours: 24,
            messageType: "EMAIL_PROFESSIONAL",
            subjectTemplate: "How was your {{serviceType}} experience?",
            bodyTemplate:
              "Thank you for choosing {{businessName}}! Please share your experience: {{reviewLink}}",
          },
        ],
      });
    }
  }, [sequence]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStepChange = (stepIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, index) =>
        index === stepIndex ? { ...step, [field]: value } : step
      ),
    }));
  };

  const addStep = () => {
    const newStep = {
      stepNumber: formData.steps.length + 1,
      delayHours: 72,
      messageType: "EMAIL_PLAIN",
      subjectTemplate: "Quick follow-up",
      bodyTemplate:
        "Hi {{customerName}}, just following up on your recent experience with {{businessName}}. {{reviewLink}}",
    };

    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setActiveStepIndex(formData.steps.length);
  };

  const removeStep = (stepIndex) => {
    if (formData.steps.length <= 1) {
      showToast("Campaign must have at least one step", "warning");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, index) => index !== stepIndex)
        .map((step, index) => ({ ...step, stepNumber: index + 1 })),
    }));

    if (activeStepIndex >= formData.steps.length - 1) {
      setActiveStepIndex(Math.max(0, formData.steps.length - 2));
    }
  };

  const moveStepUp = (stepIndex) => {
    if (stepIndex <= 0) return;

    setFormData((prev) => {
      const newSteps = [...prev.steps];
      [newSteps[stepIndex - 1], newSteps[stepIndex]] = [
        newSteps[stepIndex],
        newSteps[stepIndex - 1],
      ];
      return {
        ...prev,
        steps: newSteps.map((step, index) => ({
          ...step,
          stepNumber: index + 1,
        })),
      };
    });
    setActiveStepIndex(stepIndex - 1);
  };

  const moveStepDown = (stepIndex) => {
    if (stepIndex >= formData.steps.length - 1) return;

    setFormData((prev) => {
      const newSteps = [...prev.steps];
      [newSteps[stepIndex], newSteps[stepIndex + 1]] = [
        newSteps[stepIndex + 1],
        newSteps[stepIndex],
      ];
      return {
        ...prev,
        steps: newSteps.map((step, index) => ({
          ...step,
          stepNumber: index + 1,
        })),
      };
    });
    setActiveStepIndex(stepIndex + 1);
  };

  const handleSelectTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      steps: template.steps,
    }));
    setShowTemplateLibrary(false);
    setActiveStepIndex(0);
    showToast("Template loaded successfully", "success");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("Please enter a campaign name", "warning");
      return;
    }

    if (formData.steps.length === 0) {
      showToast("Please add at least one step", "warning");
      return;
    }

    // Validate steps
    for (let i = 0; i < formData.steps.length; i++) {
      const step = formData.steps[i];
      if (!step.bodyTemplate.trim()) {
        showToast(`Step ${i + 1} requires a message template`, "warning");
        return;
      }
      if (step.messageType.includes("EMAIL") && !step.subjectTemplate.trim()) {
        showToast(
          `Step ${i + 1} requires a subject for email messages`,
          "warning"
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        isDefault: formData.isDefault,
        steps: formData.steps,
      };

      if (sequence) {
        await axios.put(
          buildUrl(`/api/campaigns/sequences/${sequence.id}`),
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        showToast("Campaign sequence updated successfully", "success");
      } else {
        await axios.post(buildUrl("/api/campaigns/sequences"), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Campaign sequence created successfully", "success");
      }

      onSave();
    } catch (error) {
      console.error("Error saving sequence:", error);
      showToast(
        error.response?.data?.message || "Failed to save campaign sequence",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStepIcon = (messageType) => {
    switch (messageType) {
      case "SMS":
        return "📱";
      case "EMAIL_PROFESSIONAL":
        return "✉️";
      case "EMAIL_PLAIN":
        return "📧";
      default:
        return "📝";
    }
  };

  const getDelayDescription = (hours) => {
    if (hours === 0) return "Immediately";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        {/* FIXED: Changed structure for better scrolling and height management */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col md:flex-row max-h-[85vh]">
            {/* Sidebar - Step List */}
            <div className="w-full md:w-80 bg-gray-50 border-r border-gray-200 flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                {/* FIXED: Added close button */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {sequence ? "Edit Campaign" : "Create Campaign"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Campaign name"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  rows={2}
                  className="w-full mt-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <label className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      handleFormChange("isDefault", e.target.checked)
                    }
                    className="mr-2 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Set as default campaign
                  </span>
                </label>

                <button
                  onClick={() => setShowTemplateLibrary(true)}
                  className="w-full mt-3 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                >
                  📚 Browse Templates
                </button>
              </div>

              {/* FIXED: Properly scrollable step list */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Campaign Steps
                  </h3>
                  <button
                    onClick={addStep}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add Step
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                        activeStepIndex === index
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveStepIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getStepIcon(step.messageType)}
                          </span>
                          <div>
                            <div className="font-medium text-sm">
                              Step {step.stepNumber}
                            </div>
                            <div className="text-xs text-gray-600">
                              {getDelayDescription(step.delayHours)}
                            </div>
                          </div>
                        </div>
                        {formData.steps.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeStep(index);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content - Step Editor */}
            <div className="flex-1 flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">
                  Step {formData.steps[activeStepIndex]?.stepNumber} Details
                </h3>
              </div>

              {/* FIXED: Properly scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6">
                {formData.steps[activeStepIndex] && (
                  <CampaignStepEditor
                    step={formData.steps[activeStepIndex]}
                    stepIndex={activeStepIndex}
                    totalSteps={formData.steps.length}
                    onChange={handleStepChange}
                    onRemove={removeStep}
                    onMoveUp={moveStepUp}
                    onMoveDown={moveStepDown}
                    readonly={false}
                  />
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0 bg-white">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : sequence
                    ? "Update Campaign"
                    : "Create Campaign"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Library Modal */}
        {showTemplateLibrary && (
          <CampaignTemplateLibrary
            onSelectTemplate={handleSelectTemplate}
            onClose={() => setShowTemplateLibrary(false)}
            selectedIndustry={null}
          />
        )}
      </div>
    </ModalPortal>
  );
};

export default CampaignSequenceBuilder;
