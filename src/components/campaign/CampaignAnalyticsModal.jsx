import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { buildUrl } from "../../config/api";
import ModalPortal from "../common/ModalPortal";

const CampaignAnalyticsModal = ({ sequences, onClose }) => {
  console.log("=== CampaignAnalyticsModal RENDERING ===");
  console.log("Sequences prop:", sequences);
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [dateRange, setDateRange] = useState("30");
  const [selectedSequence, setSelectedSequence] = useState("all");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedSequence]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(dateRange));

      const params = {
        startDate: startDate.toISOString().split("T")[0] + "T00:00:00",
        endDate: endDate.toISOString().split("T")[0] + "T23:59:59",
      };

      let response;
      if (selectedSequence === "all") {
        response = await axios.get(buildUrl("/api/campaigns/analytics"), {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.get(
          buildUrl(`/api/campaigns/sequences/${selectedSequence}/performance`),
          {
            params,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      showToast("Failed to load analytics data", "error");
      // Set dummy data for testing
      setAnalytics({
        totalExecutions: 45,
        activeExecutions: 12,
        completedExecutions: 28,
        failedExecutions: 5,
        completionRate: 62.2,
        averageStepsCompleted: 2.4,
        sequencePerformance: sequences.map((seq) => ({
          sequenceId: seq.id,
          sequenceName: seq.name,
          totalExecutions: Math.floor(Math.random() * 20) + 5,
          completedExecutions: Math.floor(Math.random() * 15) + 2,
          completionRate: Math.floor(Math.random() * 40) + 40,
          averageCompletionTime: Math.floor(Math.random() * 48) + 12,
          smsPerformance: {
            totalSent: Math.floor(Math.random() * 30) + 10,
            delivered: Math.floor(Math.random() * 25) + 8,
            deliveryRate: Math.floor(Math.random() * 20) + 75,
          },
          emailPerformance: {
            totalSent: Math.floor(Math.random() * 40) + 15,
            delivered: Math.floor(Math.random() * 35) + 12,
            opened: Math.floor(Math.random() * 25) + 8,
            clicked: Math.floor(Math.random() * 15) + 3,
            deliveryRate: Math.floor(Math.random() * 15) + 80,
            openRate: Math.floor(Math.random() * 20) + 25,
            clickRate: Math.floor(Math.random() * 10) + 5,
          },
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value) => {
    return `${Math.round(value * 10) / 10}%`;
  };

  const formatNumber = (value) => {
    return value?.toLocaleString() || "0";
  };

  const getPerformanceColor = (rate) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <ModalPortal>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Campaign Analytics
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <select
                value={selectedSequence}
                onChange={(e) => setSelectedSequence(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sequences</option>
                {sequences.map((sequence) => (
                  <option key={sequence.id} value={sequence.id}>
                    {sequence.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {analytics && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-800">
                      {formatNumber(analytics.totalExecutions)}
                    </div>
                    <div className="text-sm text-blue-600">Total Campaigns</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-800">
                      {formatNumber(analytics.activeExecutions)}
                    </div>
                    <div className="text-sm text-green-600">
                      Active Campaigns
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-2xl font-bold text-purple-800">
                      {formatPercentage(analytics.completionRate)}
                    </div>
                    <div className="text-sm text-purple-600">
                      Completion Rate
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="text-2xl font-bold text-orange-800">
                      {analytics.averageStepsCompleted?.toFixed(1)}
                    </div>
                    <div className="text-sm text-orange-600">
                      Avg Steps Completed
                    </div>
                  </div>
                </div>

                {/* Sequence Performance */}
                {analytics.sequencePerformance &&
                  analytics.sequencePerformance.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Sequence Performance
                      </h3>
                      <div className="space-y-4">
                        {analytics.sequencePerformance.map((sequence) => (
                          <div
                            key={sequence.sequenceId}
                            className="bg-white rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-gray-800">
                                {sequence.sequenceName}
                              </h4>
                              <span
                                className={`font-semibold ${getPerformanceColor(
                                  sequence.completionRate
                                )}`}
                              >
                                {formatPercentage(sequence.completionRate)}{" "}
                                completion
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Campaign Stats */}
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">
                                  Campaign Stats
                                </h5>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Total:
                                    </span>
                                    <span className="font-medium">
                                      {formatNumber(sequence.totalExecutions)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Completed:
                                    </span>
                                    <span className="font-medium">
                                      {formatNumber(
                                        sequence.completedExecutions
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Avg Duration:
                                    </span>
                                    <span className="font-medium">
                                      {sequence.averageCompletionTime}h
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* SMS Performance */}
                              {sequence.smsPerformance && (
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2">
                                    SMS Performance
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Sent:
                                      </span>
                                      <span className="font-medium">
                                        {formatNumber(
                                          sequence.smsPerformance.totalSent
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Delivered:
                                      </span>
                                      <span className="font-medium">
                                        {formatNumber(
                                          sequence.smsPerformance.delivered
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Delivery Rate:
                                      </span>
                                      <span
                                        className={`font-medium ${getPerformanceColor(
                                          sequence.smsPerformance.deliveryRate
                                        )}`}
                                      >
                                        {formatPercentage(
                                          sequence.smsPerformance.deliveryRate
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Email Performance */}
                              {sequence.emailPerformance && (
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2">
                                    Email Performance
                                  </h5>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Sent:
                                      </span>
                                      <span className="font-medium">
                                        {formatNumber(
                                          sequence.emailPerformance.totalSent
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Delivered:
                                      </span>
                                      <span className="font-medium">
                                        {formatNumber(
                                          sequence.emailPerformance.delivered
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Opened:
                                      </span>
                                      <span className="font-medium">
                                        {formatNumber(
                                          sequence.emailPerformance.opened
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Clicked:
                                      </span>
                                      <span className="font-medium">
                                        {formatNumber(
                                          sequence.emailPerformance.clicked
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Open Rate:
                                      </span>
                                      <span
                                        className={`font-medium ${getPerformanceColor(
                                          sequence.emailPerformance.openRate
                                        )}`}
                                      >
                                        {formatPercentage(
                                          sequence.emailPerformance.openRate
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Click Rate:
                                      </span>
                                      <span
                                        className={`font-medium ${getPerformanceColor(
                                          sequence.emailPerformance.clickRate
                                        )}`}
                                      >
                                        {formatPercentage(
                                          sequence.emailPerformance.clickRate
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Insights */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    Key Insights
                  </h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>
                      • Your campaigns have a{" "}
                      {formatPercentage(analytics.completionRate)} completion
                      rate
                    </p>
                    <p>
                      • On average, customers complete{" "}
                      {analytics.averageStepsCompleted?.toFixed(1)} out of your
                      sequence steps
                    </p>
                    <p>
                      • You have {analytics.activeExecutions} campaigns
                      currently running
                    </p>
                    {analytics.sequencePerformance &&
                      analytics.sequencePerformance.length > 0 && (
                        <p>
                          • Best performing sequence:{" "}
                          {
                            analytics.sequencePerformance.reduce(
                              (best, current) =>
                                current.completionRate > best.completionRate
                                  ? current
                                  : best
                            ).sequenceName
                          }
                        </p>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Analytics for last {dateRange} days</span>
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CampaignAnalyticsModal;
