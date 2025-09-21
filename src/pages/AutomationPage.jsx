import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import AutomationMetricsCards from "../components/automation/AutomationMetricsCards";
import CustomerJourneyOverview from "../components/automation/CustomerJourneyOverview";
import WorkflowGrid from '../components/automation/WorkflowGrid';
import axios from "axios";

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
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchAutomationData();
  }, []);

  const fetchAutomationData = async () => {
    try {
      setLoading(true);

      // Fetch workflows
      const workflowsResponse = await axios.get(
        "http://localhost:8080/api/automation/workflows",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setWorkflows(workflowsResponse.data);

      // Fetch execution metrics
      const metricsResponse = await axios.get(
        "http://localhost:8080/api/automation/monitoring/metrics?hoursBack=168",
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

      // Fetch recent activity
      const activityResponse = await axios.get(
        "http://localhost:8080/api/automation/monitoring/executions?hoursBack=24&limit=10",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecentActivity(activityResponse.data.executions || []);
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
                <button className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105">
                  + Create Workflow
                </button>
              </div>
            </div>

            <WorkflowGrid
              workflows={workflows}
              onWorkflowUpdate={fetchAutomationData}
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

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Recent Activity
            </h2>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 8).map((activity, index) => (
                    <div
                      key={activity.id || index}
                      className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl"
                    >
                      <div className="flex-shrink-0">
                        {activity.status === "COMPLETED" && (
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
                        {activity.status === "PENDING" && (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        )}
                        {activity.status === "FAILED" && (
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {activity.workflowName || "Workflow"}
                        </p>
                        <p className="text-blue-200 text-xs truncate">
                          {activity.customerName || "Unknown Customer"}
                        </p>
                      </div>
                      <div className="text-xs text-blue-300">
                        {activity.createdAt
                          ? new Date(activity.createdAt).toLocaleDateString()
                          : "Recent"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-blue-300 mb-2">
                    <svg
                      className="w-8 h-8 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-blue-200 text-sm">No recent activity</p>
                  <p className="text-blue-300 text-xs mt-1">
                    Automation events will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationPage;
