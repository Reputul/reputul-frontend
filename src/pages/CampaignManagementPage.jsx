import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { buildUrl, API_ENDPOINTS } from "../config/api";
import CampaignSequenceBuilder from "../components/campaign/CampaignSequenceBuilder";
import CampaignExecutionModal from "../components/campaign/CampaignExecutionModal";
import CampaignAnalyticsModal from "../components/campaign/CampaignAnalyticsModal";
import CampaignSequenceList from "../components/campaign/CampaignSequenceList";
import CampaignPreviewModal from "../components/campaign/CampaignPreviewModal";

const CampaignManagementPage = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sequences, setSequences] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [showSequenceBuilder, setShowSequenceBuilder] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewSequence, setPreviewSequence] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sequencesRes, executionsRes, customersRes] = await Promise.all([
        axios.get(buildUrl(API_ENDPOINTS.CAMPAIGNS.SEQUENCES), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(buildUrl(API_ENDPOINTS.CAMPAIGNS.EXECUTIONS), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(buildUrl(API_ENDPOINTS.CUSTOMERS), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSequences(sequencesRes.data);
      setExecutions(executionsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      showToast("Failed to load campaign data", "error");
    } finally {
      setLoading(false);
    }
  }, [token, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSequence = () => {
    setSelectedSequence(null);
    setShowSequenceBuilder(true);
  };

  const handleEditSequence = (sequence) => {
    setSelectedSequence(sequence);
    setShowSequenceBuilder(true);
  };

  const handleDeleteSequence = async (sequenceId) => {
    if (
      !window.confirm("Are you sure you want to delete this campaign sequence?")
    ) {
      return;
    }

    try {
      await axios.delete(buildUrl(`/api/v1/campaigns/sequences/${sequenceId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Campaign sequence deleted successfully", "success");
      fetchData();
    } catch (error) {
      console.error("Error deleting sequence:", error);
      showToast("Failed to delete campaign sequence", "error");
    }
  };

  // NEW: Toggle sequence active/inactive status
  const handleToggleSequenceStatus = async (sequenceId, isActive) => {
    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${sequenceId}/status`),
        { isActive },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast(
        `Campaign ${isActive ? "activated" : "deactivated"} successfully`,
        "success"
      );
      fetchData();
    } catch (error) {
      console.error("Error toggling sequence status:", error);
      showToast("Failed to update campaign status", "error");
    }
  };

  // NEW: Set a sequence as default
  const handleSetAsDefault = async (sequenceId) => {
    try {
      await axios.put(
        buildUrl(`/api/v1/campaigns/sequences/${sequenceId}/set-default`),
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast("Default campaign updated successfully", "success");
      fetchData();
    } catch (error) {
      console.error("Error setting default sequence:", error);
      showToast("Failed to set default campaign", "error");
    }
  };

  // NEW: Preview a sequence
  const handlePreviewSequence = (sequence) => {
    setPreviewSequence(sequence);
    setShowPreviewModal(true);
  };

  const handleStartCampaign = async (customerId, sequenceId = null) => {
    try {
      await axios.post(
        buildUrl("/api/v1/campaigns/executions"),
        {
          reviewRequestId: null, // Will need to create review request first
          sequenceId: sequenceId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast("Campaign started successfully", "success");
      fetchData();
    } catch (error) {
      console.error("Error starting campaign:", error);
      showToast("Failed to start campaign", "error");
    }
  };

  // NEW: Start campaign from a sequence
  const handleStartCampaignForSequence = (sequence) => {
    // This would open a modal to select customers or start immediately
    // For now, just show a success message
    showToast(`Ready to start campaign: ${sequence.name}`, "info");
    // You can implement customer selection logic here
  };

  const handleStopExecution = async (executionId) => {
    try {
      await axios.post(
        buildUrl(`/api/v1/campaigns/executions/${executionId}/stop`),
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showToast("Campaign stopped successfully", "success");
      fetchData();
    } catch (error) {
      console.error("Error stopping campaign:", error);
      showToast("Failed to stop campaign", "error");
    }
  };

  const handleBulkStartCampaigns = async () => {
    if (selectedCustomers.length === 0) {
      showToast("Please select customers first", "warning");
      return;
    }

    try {
      // Create review requests with campaigns for selected customers
      await axios.post(
        buildUrl("/api/v1/review-requests/bulk-campaigns"),
        {
          customerIds: selectedCustomers.map((c) => c.id),
          sequenceId: null, // Use default sequence
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showToast(
        `Started campaigns for ${selectedCustomers.length} customers`,
        "success"
      );
      setSelectedCustomers([]);
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      console.error("Error starting bulk campaigns:", error);
      showToast("Failed to start bulk campaigns", "error");
    }
  };

  const filteredExecutions = executions.filter((execution) => {
    if (filterStatus === "all") return true;
    return execution.status.toLowerCase() === filterStatus;
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Campaign Management
                </h1>
                <p className="text-gray-600">
                  Create and manage automated review collection campaigns
                </p>
              </div>
              <button
                onClick={handleCreateSequence}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>

        {/* UPDATED: Campaign Sequences - Now using CampaignSequenceList component */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CampaignSequenceList
            sequences={sequences}
            loading={false}
            onEdit={handleEditSequence}
            onDelete={handleDeleteSequence}
            onCreate={handleCreateSequence}
            onToggleStatus={handleToggleSequenceStatus}
            onSetAsDefault={handleSetAsDefault}
          />

          {/* Active Campaigns */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Active Campaigns
              </h2>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">
                          {execution.customerName}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            execution.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : execution.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {execution.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {execution.sequenceName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Step {execution.currentStep}
                      </p>
                    </div>
                    {execution.status === "ACTIVE" && (
                      <button
                        onClick={() => handleStopExecution(execution.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Stop
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredExecutions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No campaigns found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Selection for Bulk Campaigns */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Start New Campaigns
            </h2>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {selectedCustomers.length > 0 && (
                <button
                  onClick={handleBulkStartCampaigns}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Start {selectedCustomers.length} Campaigns
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCustomers.find((c) => c.id === customer.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (selectedCustomers.find((c) => c.id === customer.id)) {
                    setSelectedCustomers(
                      selectedCustomers.filter((c) => c.id !== customer.id)
                    );
                  } else {
                    setSelectedCustomers([...selectedCustomers, customer]);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      !!selectedCustomers.find((c) => c.id === customer.id)
                    }
                    onChange={() => {}} // Handled by parent onClick
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              console.log("=== View Analytics Clicked ===");
              console.log("Current showAnalyticsModal:", showAnalyticsModal);
              console.log("Sequences available:", sequences.length);
              setShowAnalyticsModal(true);
              console.log("Set showAnalyticsModal to true");
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            View Analytics
          </button>
          <button
            onClick={() => {
              console.log("=== Campaign History Clicked ===");
              console.log("Current showExecutionModal:", showExecutionModal);
              console.log("Executions available:", executions.length);
              setShowExecutionModal(true);
              console.log("Set showExecutionModal to true");
            }}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Campaign History
          </button>
        </div>
      </div>

      {/* Modals */}
      {showSequenceBuilder && (
        <CampaignSequenceBuilder
          sequence={selectedSequence}
          onClose={() => {
            setShowSequenceBuilder(false);
            setSelectedSequence(null);
          }}
          onSave={() => {
            setShowSequenceBuilder(false);
            setSelectedSequence(null);
            fetchData();
          }}
        />
      )}

      {showExecutionModal && (
        <CampaignExecutionModal
          executions={executions}
          onClose={() => setShowExecutionModal(false)}
          onRefresh={fetchData}
        />
      )}

      {showAnalyticsModal && (
        <CampaignAnalyticsModal
          sequences={sequences}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* NEW: Preview Modal */}
      {showPreviewModal && (
        <CampaignPreviewModal
          sequence={previewSequence}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewSequence(null);
          }}
          onEdit={handleEditSequence}
          onStart={handleStartCampaignForSequence}
        />
      )}
    </div>
  );
};

export default CampaignManagementPage;
