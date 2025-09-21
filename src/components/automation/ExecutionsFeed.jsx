import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { buildUrl } from "../../config/api";
import ExecutionCard from "./ExecutionCard";

const ExecutionsFeed = ({ userToken, refreshTrigger }) => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { showToast } = useToast();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchExecutions(false); // Silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, [userToken]);

  // Initial load and manual refresh
  useEffect(() => {
    fetchExecutions(true);
  }, [userToken, refreshTrigger]);

  const fetchExecutions = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const response = await axios.get(
        buildUrl("/api/automation/monitoring/executions?hoursBack=24&limit=20"),
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      setExecutions(response.data.executions || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching executions:", error);
      if (showLoading) {
        showToast("Failed to load recent executions", "error");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getStatusCounts = () => {
    const counts = executions.reduce((acc, execution) => {
      acc[execution.status] = (acc[execution.status] || 0) + 1;
      return acc;
    }, {});

    return {
      completed: counts.COMPLETED || 0,
      pending: counts.PENDING || 0,
      failed: counts.FAILED || 0,
      running: counts.RUNNING || 0,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
      {/* Header with Status Summary */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            Recent Executions
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400">
                {statusCounts.completed} completed
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400">
                {statusCounts.running} running
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-400">
                {statusCounts.pending} pending
              </span>
            </div>
            {statusCounts.failed > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400">
                  {statusCounts.failed} failed
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs text-blue-300">
            Updated {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={() => fetchExecutions(true)}
            className="text-blue-300 hover:text-white transition-colors"
            title="Refresh executions"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      </div>

      {/* Executions List */}
      {executions.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {executions.map((execution) => (
            <ExecutionCard
              key={execution.id}
              execution={execution}
              userToken={userToken}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-blue-300 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
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
          <h4 className="text-white font-semibold mb-1">
            No Recent Executions
          </h4>
          <p className="text-blue-200 text-sm">
            Automation executions will appear here once workflows are triggered
          </p>
        </div>
      )}
    </div>
  );
};

export default ExecutionsFeed;
