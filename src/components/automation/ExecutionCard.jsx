import React, { useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { buildUrl } from "../../config/api";

const ExecutionCard = ({ execution, userToken }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const { showToast } = useToast();

  const getStatusConfig = (status) => {
    const configs = {
      COMPLETED: {
        color: "text-green-400",
        bgColor: "bg-green-400/20",
        icon: "✓",
        label: "Completed",
      },
      PENDING: {
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/20",
        icon: "⏳",
        label: "Pending",
      },
      RUNNING: {
        color: "text-blue-400",
        bgColor: "bg-blue-400/20",
        icon: "⚡",
        label: "Running",
      },
      FAILED: {
        color: "text-red-400",
        bgColor: "bg-red-400/20",
        icon: "✗",
        label: "Failed",
      },
    };
    return configs[status] || configs.PENDING;
  };

  const handleRetry = async () => {
    if (retrying) return;

    setRetrying(true);
    try {
      await axios.post(
        buildUrl(`/api/automation/executions/${execution.id}/retry`),
        {},
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      showToast("Execution retry initiated", "success");
    } catch (error) {
      console.error("Error retrying execution:", error);
      showToast("Failed to retry execution", "error");
    } finally {
      setRetrying(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;

    if (diffMs < 60000) return "Just now";
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const statusConfig = getStatusConfig(execution.status);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
      {/* Main Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Left Side - Execution Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div
                className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                <span className="mr-1">{statusConfig.icon}</span>
                {statusConfig.label}
              </div>
              <span className="text-blue-200 text-sm">
                {execution.workflowName || "Unknown Workflow"}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-blue-200">
              <div className="flex items-center space-x-1">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="truncate">
                  {execution.customerName || "Unknown Customer"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatTime(execution.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2 ml-4">
            {execution.status === "FAILED" && (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="text-blue-400 hover:text-white text-xs font-medium transition-colors disabled:opacity-50"
              >
                {retrying ? "Retrying..." : "Retry"}
              </button>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-400 hover:text-white text-xs font-medium transition-colors"
            >
              {showDetails ? "Hide" : "Details"}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-white/10 p-4 bg-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-200">Execution ID:</span>
              <span className="text-white ml-2 font-mono text-xs">
                {execution.id}
              </span>
            </div>
            <div>
              <span className="text-blue-200">Trigger Type:</span>
              <span className="text-white ml-2">
                {execution.triggerType || "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-blue-200">Started:</span>
              <span className="text-white ml-2">
                {execution.createdAt
                  ? new Date(execution.createdAt).toLocaleString()
                  : "Unknown"}
              </span>
            </div>
            <div>
              <span className="text-blue-200">Completed:</span>
              <span className="text-white ml-2">
                {execution.completedAt
                  ? new Date(execution.completedAt).toLocaleString()
                  : "In progress"}
              </span>
            </div>
          </div>

          {execution.errorMessage && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="text-red-400 text-sm font-medium mb-1">
                Error:
              </div>
              <div className="text-red-200 text-sm">
                {execution.errorMessage}
              </div>
            </div>
          )}

          {execution.triggerData && (
            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-blue-200 text-sm font-medium mb-1">
                Trigger Data:
              </div>
              <pre className="text-white text-xs font-mono overflow-x-auto">
                {JSON.stringify(execution.triggerData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionCard;
