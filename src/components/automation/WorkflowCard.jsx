import React, { useState } from "react";
import axios from "axios";
import { toast } from 'sonner';
import { buildUrl } from "../../config/api";

const WorkflowCard = ({ workflow, onWorkflowUpdate, onSaveAsTemplate, userToken }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleStatus = async () => {
    if (isToggling) return;

    const action = workflow.isActive ? "disable" : "enable";
    const confirmMessage = workflow.isActive
      ? `Are you sure you want to disable "${workflow.name}"? This will stop all automated requests for this workflow.`
      : `Enable "${workflow.name}"? This will resume automated requests.`;

    if (!window.confirm(confirmMessage)) return;

    setIsToggling(true);
    try {
      await axios.put(
        buildUrl(`/api/automation/workflows/${workflow.id}/status`),
        { isActive: !workflow.isActive },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      toast.success(`Workflow ${action}d successfully`);
      onWorkflowUpdate();
    } catch (error) {
      console.error(`Error ${action}ing workflow:`, error);
      toast.error(`Failed to ${action} workflow`);
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusBadge = () => {
    if (workflow.isActive) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">Active</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-gray-400 text-sm font-medium">Paused</span>
        </div>
      );
    }
  };

  const getTriggerIcon = () => {
    switch (workflow.triggerType) {
      case "CUSTOMER_CREATED":
        return "👤";
      case "SERVICE_COMPLETED":
        return "✅";
      case "REVIEW_COMPLETED":
        return "⭐";
      default:
        return "🎯";
    }
  };

  const getDeliveryIcon = () => {
    switch (workflow.deliveryMethod) {
      case "SMS":
        return "📱";
      case "EMAIL":
        return "📧";
      case "BOTH":
        return "📧📱";
      default:
        return "📧";
    }
  };

  return (
    <div
      className={`bg-white/10 backdrop-blur-xl rounded-2xl border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] p-6 ${
        workflow.isActive ? "border-green-400/30" : "border-white/20"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{getTriggerIcon()}</span>
            <h3 className="text-white font-bold text-lg truncate">
              {workflow.name}
            </h3>
          </div>
          <p className="text-blue-200 text-sm leading-relaxed">
            {workflow.description}
          </p>
        </div>

        <div className="flex-shrink-0 ml-4">
          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              workflow.isActive ? "bg-green-500" : "bg-gray-600"
            } ${
              isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                workflow.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        {getStatusBadge()}
        <div className="flex items-center space-x-4 text-blue-200 text-sm">
          <div className="flex items-center space-x-1">
            <span>{getDeliveryIcon()}</span>
            <span>{workflow.deliveryMethod || "EMAIL"}</span>
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>{workflow.executionCount || 0} runs</span>
          </div>
        </div>
      </div>

      {workflow.triggerConfig && (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-200">Trigger:</span>
            <span className="text-white font-medium">
              {workflow.triggerConfig.delay_hours &&
                `${workflow.triggerConfig.delay_hours}h delay`}
              {workflow.triggerConfig.delay_days &&
                `${workflow.triggerConfig.delay_days}d delay`}
              {!workflow.triggerConfig.delay_hours &&
                !workflow.triggerConfig.delay_days &&
                "Immediate"}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            /* TODO: Open edit modal */
          }}
          className="text-blue-300 hover:text-white text-sm font-medium transition-colors"
        >
          Edit Settings
        </button>
        <button
          onClick={() => onSaveAsTemplate?.(workflow)}
          className="text-green-300 hover:text-white text-sm font-medium transition-colors"
        >
          Save as Template
        </button>
        <button
          onClick={() => {
            /* TODO: View execution history */
          }}
          className="text-blue-300 hover:text-white text-sm font-medium transition-colors"
        >
          View History
        </button>
      </div>
    </div>
  );
};

export default WorkflowCard;
