import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { buildUrl } from "../config/api";
import AutomationMetricsCards from "../components/automation/AutomationMetricsCards";
import CustomerJourneyOverview from "../components/automation/CustomerJourneyOverview";
import WorkflowGrid from "../components/automation/WorkflowGrid";
import ExecutionsFeed from "../components/automation/ExecutionsFeed";
import axios from "axios";
import TemplateLibrary from "../components/automation/TemplateLibrary";
import WorkflowTemplateManager from "../components/automation/WorkflowTemplateManager";
import QuickStartWizard from "../components/automation/QuickStartWizard";
import JourneyBuilder from "../components/automation/JourneyBuilder";

const AutomationPage = () => {
  const { token } = useContext(AuthContext);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    requestsSent: 0,
    responseRate: 0,
    reviewsGenerated: 0,
    avgResponseTime: "0 hours",
  });
  const [workflows, setWorkflows] = useState([]);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [selectedWorkflowForTemplate, setSelectedWorkflowForTemplate] =
    useState(null);
  const [showQuickStart, setShowQuickStart] = useState(false);

  const [showJourneyBuilder, setShowJourneyBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchAutomationData();
  }, []);

  // Check if user has no workflows and show quick start
  useEffect(() => {
    if (!loading && workflows.length === 0) {
      setShowQuickStart(true);
    }
  }, [loading, workflows.length]);

  const fetchAutomationData = async () => {
    try {
      setLoading(true);

      // Fetch workflows
      const workflowsResponse = await axios.get(
        buildUrl("/api/v1/automation/workflows"),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkflows(workflowsResponse.data);

      // Fetch execution metrics
      const metricsResponse = await axios.get(
        buildUrl("/api/v1/automation/monitoring/metrics?hoursBack=168"),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Calculate metrics from API response
      const apiMetrics = metricsResponse.data;
      setMetrics({
        requestsSent: apiMetrics.totalExecutions || 0,
        responseRate: Math.round(apiMetrics.successRate || 0),
        reviewsGenerated: Math.round((apiMetrics.totalExecutions || 0) * 0.35), // Estimated conversion
        avgResponseTime: "2.3 hours", // Placeholder
      });
    } catch (error) {
      console.error("Error fetching automation data:", error);
      showToast("Failed to load automation data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendManualRequest = () => {
    showToast("Manual request feature coming soon!", "info");
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setShowJourneyBuilder(true);
  };

  const handleSaveAsTemplate = (workflow) => {
    setSelectedWorkflowForTemplate(workflow);
    setShowSaveTemplate(true);
  };

  const handleCreateWorkflow = () => {
    setSelectedTemplate(null);
    setShowJourneyBuilder(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Automation Dashboard
              </h1>
              <p className="text-blue-200">
                Manage your customer review automation workflows
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Browse Templates
              </button>
              <button
                onClick={handleSendManualRequest}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
              >
                Send Manual Request
              </button>
              <button
                onClick={fetchAutomationData}
                className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 border border-white/20"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <AutomationMetricsCards metrics={metrics} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Workflow Management Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Active Workflows
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-blue-200 text-sm">
                  {workflows.filter((w) => w.isActive).length} of{" "}
                  {workflows.length} active
                </span>
                <button
                  onClick={handleCreateWorkflow}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  + Create Workflow
                </button>
              </div>
            </div>

            <WorkflowGrid
              workflows={workflows}
              onWorkflowUpdate={fetchAutomationData}
              onSaveAsTemplate={handleSaveAsTemplate}
              onCreateWorkflow={handleCreateWorkflow}
              userToken={token}
            />
          </div>

          {/* Customer Journey Overview */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Customer Journey Preview
            </h2>
            <CustomerJourneyOverview workflows={workflows} />
          </div>

          {/* Recent Executions Feed */}
          <div>
            <ExecutionsFeed userToken={token} />
          </div>
        </div>
      </div>
      {/* Template Library Modal */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onSelectTemplate={handleTemplateSelect}
        userToken={token}
      />

      {/* Save as Template Modal */}
      <WorkflowTemplateManager
        workflow={selectedWorkflowForTemplate}
        isOpen={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        onSaveAsTemplate={(templateData) => {
          console.log("Template saved:", templateData);
          fetchAutomationData(); // Refresh data
        }}
        userToken={token}
      />

      {/* Quick Start Wizard */}
      <QuickStartWizard
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onComplete={(template) => {
          console.log("Quick start completed with template:", template);
          setShowQuickStart(false);
          handleTemplateSelect(template);
        }}
        userToken={token}
      />

      {/* Journey Builder Modal */}
      {showJourneyBuilder && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <JourneyBuilder
            workflow={
              selectedTemplate
                ? {
                    name: selectedTemplate.name,
                    description: selectedTemplate.description,
                    nodes: selectedTemplate.nodes,
                    connections: selectedTemplate.connections,
                  }
                : null
            }
            userToken={token}
            onSave={(workflowData) => {
              console.log("Workflow saved:", workflowData);
              setShowJourneyBuilder(false);
              fetchAutomationData();
            }}
            onCancel={() => setShowJourneyBuilder(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AutomationPage;
