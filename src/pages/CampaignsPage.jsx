import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";
import { buildUrl } from "../config/api";
import CampaignCard from "../components/campaigns/CampaignCard";
import InteractiveCampaignBuilder from "../components/campaigns/InteractiveCampaignBuilder";
import EditCampaignStepModal from "../components/campaigns/EditCampaignStepModal";

const CampaignsPage = () => {
  const { token } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [editingCampaignForStep, setEditingCampaignForStep] = useState(null);
  const [showStepModal, setShowStepModal] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        buildUrl("/api/v1/campaigns/sequences"),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCampaign = async (campaignId, isActive) => {
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (isActive && campaign?.isDefault) {
      const confirmed = window.confirm(
        "⚠️ This is your default campaign.\n\n" +
          "Deactivating it means new review requests won't be enrolled automatically.\n\n" +
          "Are you sure you want to continue?"
      );
      if (!confirmed) return;
    }

    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${campaignId}/status`),
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Campaign ${!isActive ? "activated" : "deactivated"}`);
      fetchCampaigns();
    } catch (error) {
      console.error("Error toggling campaign:", error);
      toast.error("Failed to update campaign status");
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  const handleSaveCampaign = async (updatedCampaign) => {
    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${updatedCampaign.id}`),
        updatedCampaign,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Campaign updated successfully");
      setShowEditModal(false);
      fetchCampaigns();
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast.error("Failed to update campaign");
    }
  };

  const handleDuplicateCampaign = async (campaign) => {
    try {
      const duplicateData = {
        name: `${campaign.name} (Copy)`,
        description: campaign.description,
        isDefault: false,
        steps: campaign.steps,
      };

      await axios.post(buildUrl("/api/v1/campaigns/sequences"), duplicateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Campaign duplicated successfully");
      fetchCampaigns();
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      toast.error("Failed to duplicate campaign");
    }
  };

  const handleSetAsDefault = async (campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    const currentDefault = campaigns.find((c) => c.isDefault);

    const confirmed = window.confirm(
      `Set "${campaign?.name}" as your default campaign?\n\n` +
        `This will replace "${currentDefault?.name}" as the default.\n\n` +
        `New review requests will automatically use this campaign.`
    );

    if (!confirmed) return;

    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${campaignId}/set-default`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`"${campaign?.name}" is now your default campaign`, {
        description: "New review requests will use this campaign automatically",
      });

      fetchCampaigns();
    } catch (error) {
      console.error("Error setting default campaign:", error);
      toast.error("Failed to set default campaign");
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (campaign?.isDefault) {
      toast.error("Cannot delete the default campaign", {
        description: "Set another campaign as default first",
      });
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Delete "${campaign?.name}"?\n\n` +
        `This will permanently delete this campaign and all its steps.\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        buildUrl(`/api/v1/campaigns/sequences/${campaignId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`"${campaign?.name}" deleted successfully`);
      fetchCampaigns();
    } catch (error) {
      console.error("Error deleting campaign:", error);

      if (error.response?.status === 400) {
        toast.error("Cannot delete this campaign", {
          description:
            error.response?.data?.message || "It may be the only campaign",
        });
      } else {
        toast.error("Failed to delete campaign");
      }
    }
  };

  // NEW: Handle editing individual campaign steps
  const handleEditStep = (step, campaign) => {
    setEditingStep(step);
    setEditingCampaignForStep(campaign);
    setShowStepModal(true);
  };

  const handleSaveStep = async (updatedStep) => {
    try {
      // Update the step via API
      await axios.put(
        buildUrl(`/api/v1/campaigns/steps/${updatedStep.id}`),
        updatedStep,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Step updated successfully");
      setShowStepModal(false);
      fetchCampaigns(); // Refresh to show updated step
    } catch (error) {
      console.error("Error updating step:", error);
      toast.error("Failed to update step");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-600 mt-1">
                Manage your automated review collection campaigns
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Active Campaigns Counter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2">
                <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                  Active
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {campaigns.filter((c) => c.isActive).length}
                </div>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchCampaigns}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 font-medium transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📧</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Campaigns Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Refresh the page to create preset campaigns automatically
            </p>
            <button
              onClick={fetchCampaigns}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Load Preset Campaigns
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onToggle={handleToggleCampaign}
                onEdit={handleEditCampaign}
                onDuplicate={handleDuplicateCampaign}
                onSetAsDefault={handleSetAsDefault}
                onDelete={handleDeleteCampaign}
                onEditStep={(step) => handleEditStep(step, campaign)}
              />
            ))}
          </div>
        )}

        {/* Info Section */}
        {campaigns.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  How Campaigns Work
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Campaigns automatically send review requests using proven
                  message sequences. Click any step to edit its content - SMS
                  steps use simple text, email steps use your professional
                  templates. Customers exit when they leave a review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <InteractiveCampaignBuilder
          campaign={editingCampaign}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveCampaign}
        />
      )}

      {/* Edit Step Modal (NEW) */}
      {showStepModal && editingStep && (
        <EditCampaignStepModal
          step={editingStep}
          onClose={() => setShowStepModal(false)}
          onSave={handleSaveStep}
        />
      )}
    </div>
  );
};

export default CampaignsPage;
