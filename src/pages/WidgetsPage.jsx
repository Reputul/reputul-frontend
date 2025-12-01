// src/pages/WidgetsPage.jsx
// Main page for managing social proof widgets

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS, buildUrl } from "../config/api";

// Sub-components
import WidgetTypeSelector from "../components/widgets/WidgetTypeSelector";
import WidgetCustomizer from "../components/widgets/WidgetCustomizer";
import WidgetPreview from "../components/widgets/WidgetPreview";
import WidgetCodeGenerator from "../components/widgets/WidgetCodeGenerator";
import WidgetList from "../components/widgets/WidgetList";

const WidgetsPage = () => {
  const { token } = useAuth();

  // State
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Creation flow state
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [createStep, setCreateStep] = useState(1); // 1: Type, 2: Customize, 3: Code
  const [selectedWidgetType, setSelectedWidgetType] = useState(null);
  const [widgetConfig, setWidgetConfig] = useState(null);
  const [createdWidget, setCreatedWidget] = useState(null);

  // Edit state
  const [editingWidget, setEditingWidget] = useState(null);

  // Analytics state
  const [analyticsOverview, setAnalyticsOverview] = useState(null);

  // ================================================================
  // DATA FETCHING
  // ================================================================

  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.DASHBOARD.LIST), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(response.data);
      if (response.data.length > 0 && !selectedBusinessId) {
        setSelectedBusinessId(response.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Failed to load businesses");
    }
  }, [token, selectedBusinessId]);

  const fetchWidgets = useCallback(async () => {
    try {
      const endpoint = selectedBusinessId
        ? buildUrl(`/api/v1/widgets/business/${selectedBusinessId}`)
        : buildUrl("/api/v1/widgets");

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWidgets(response.data);
    } catch (error) {
      console.error("Error fetching widgets:", error);
      toast.error("Failed to load widgets");
    }
  }, [token, selectedBusinessId]);

  const fetchAnalyticsOverview = useCallback(async () => {
    try {
      const response = await axios.get(
        buildUrl("/api/v1/widgets/analytics/overview"),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalyticsOverview(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBusinesses();
      setLoading(false);
    };
    loadData();
  }, [fetchBusinesses]);

  useEffect(() => {
    if (selectedBusinessId) {
      fetchWidgets();
    }
  }, [selectedBusinessId, fetchWidgets]);

  useEffect(() => {
    fetchAnalyticsOverview();
  }, [fetchAnalyticsOverview]);

  // ================================================================
  // WIDGET CRUD OPERATIONS
  // ================================================================

  const handleCreateWidget = async () => {
    if (!selectedBusinessId || !selectedWidgetType || !widgetConfig) {
      toast.error("Please complete all steps");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        businessId: selectedBusinessId,
        widgetType: selectedWidgetType,
        ...widgetConfig,
      };

      const response = await axios.post(buildUrl("/api/v1/widgets"), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCreatedWidget(response.data);
      setCreateStep(3);
      toast.success("Widget created successfully!");
      fetchWidgets();
    } catch (error) {
      console.error("Error creating widget:", error);
      toast.error(error.response?.data?.error || "Failed to create widget");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateWidget = async (widgetId, updates) => {
    setSaving(true);
    try {
      const response = await axios.put(
        buildUrl(`/api/v1/widgets/${widgetId}`),
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Widget updated successfully!");
      fetchWidgets();
      setEditingWidget(null);
      return response.data;
    } catch (error) {
      console.error("Error updating widget:", error);
      toast.error(error.response?.data?.error || "Failed to update widget");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWidget = async (widgetId) => {
    if (!window.confirm("Are you sure you want to delete this widget?")) return;

    try {
      await axios.delete(buildUrl(`/api/v1/widgets/${widgetId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Widget deleted successfully!");
      fetchWidgets();
    } catch (error) {
      console.error("Error deleting widget:", error);
      toast.error("Failed to delete widget");
    }
  };

  const handleToggleWidget = async (widgetId) => {
    try {
      const response = await axios.post(
        buildUrl(`/api/v1/widgets/${widgetId}/toggle`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(
        `Widget ${response.data.isActive ? "activated" : "deactivated"}`
      );
      fetchWidgets();
    } catch (error) {
      console.error("Error toggling widget:", error);
      toast.error("Failed to toggle widget status");
    }
  };

  // ================================================================
  // CREATION FLOW HANDLERS
  // ================================================================

  const startCreateFlow = () => {
    setShowCreateFlow(true);
    setCreateStep(1);
    setSelectedWidgetType(null);
    setWidgetConfig(null);
    setCreatedWidget(null);
  };

  const closeCreateFlow = () => {
    setShowCreateFlow(false);
    setCreateStep(1);
    setSelectedWidgetType(null);
    setWidgetConfig(null);
    setCreatedWidget(null);
  };

  const handleTypeSelect = (type) => {
    setSelectedWidgetType(type);
    setWidgetConfig(getDefaultConfig(type));
    setCreateStep(2);
  };

  const getDefaultConfig = (type) => {
    const base = {
      theme: "light",
      primaryColor: "#3B82F6",
      accentColor: "#10B981",
      showRating: true,
      showReviewCount: true,
      showBadge: true,
      showBusinessName: true,
      showReputulBranding: true,
      minRating: 4,
      maxReviews: 12,
      showReviewerName: true,
      showReviewDate: true,
      showPlatformSource: true,
    };

    switch (type) {
      case "POPUP":
        return {
          ...base,
          position: "bottom-right",
          popupDelaySeconds: 3,
          popupDisplayDuration: 8,
          popupIntervalSeconds: 15,
          popupMaxPerSession: 5,
          popupEnabledMobile: true,
          popupAnimation: "slide",
        };
      case "BADGE":
        return {
          ...base,
          badgeStyle: "standard",
          badgeSize: "medium",
        };
      case "CAROUSEL":
        return {
          ...base,
          layout: "carousel",
          autoScroll: true,
          scrollSpeed: 5,
          showNavigationArrows: true,
          showPaginationDots: true,
          cardShadow: true,
        };
      case "GRID":
        return {
          ...base,
          layout: "grid",
          columns: 3,
          cardShadow: true,
        };
      default:
        return base;
    }
  };

  // ================================================================
  // RENDER
  // ================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading widgets...</p>
        </div>
      </div>
    );
  }

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Social Proof Widgets
              </h1>
              <p className="text-gray-600 mt-1">
                Create embeddable widgets to showcase your reviews on any
                website
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Business Selector */}
              <select
                value={selectedBusinessId || ""}
                onChange={(e) =>
                  setSelectedBusinessId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Businesses</option>
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>

              <button
                onClick={startCreateFlow}
                disabled={!selectedBusinessId}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Widget
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Overview */}
        {analyticsOverview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Widgets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsOverview.totalWidgets}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsOverview.totalImpressions?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsOverview.totalClicks?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg
                    className="w-5 h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Click-Through Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsOverview.overallClickThroughRate?.toFixed(2) || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {widgets.length === 0 && !showCreateFlow && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create Your First Widget
              </h3>
              <p className="text-gray-600 mb-6">
                Embed social proof on your website to build trust and convert
                more visitors into customers.
              </p>
              <button
                onClick={startCreateFlow}
                disabled={!selectedBusinessId}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium inline-flex items-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Widget
              </button>

              {!selectedBusinessId && (
                <p className="text-sm text-yellow-600 mt-4">
                  Please select a business first
                </p>
              )}
            </div>
          </div>
        )}

        {/* Widget List */}
        {widgets.length > 0 && !showCreateFlow && (
          <WidgetList
            widgets={widgets}
            onEdit={setEditingWidget}
            onDelete={handleDeleteWidget}
            onToggle={handleToggleWidget}
          />
        )}

        {/* Create Flow Modal */}
        {showCreateFlow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {createStep === 1 && "Choose Widget Type"}
                    {createStep === 2 && "Customize Your Widget"}
                    {createStep === 3 && "Get Your Embed Code"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Step {createStep} of 3 •{" "}
                    {selectedBusiness?.name || "Select a business"}
                  </p>
                </div>
                <button
                  onClick={closeCreateFlow}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Step 1: Type Selection */}
                {createStep === 1 && (
                  <WidgetTypeSelector onSelect={handleTypeSelect} />
                )}

                {/* Step 2: Customization with Preview */}
                {createStep === 2 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <WidgetCustomizer
                      widgetType={selectedWidgetType}
                      config={widgetConfig}
                      onChange={setWidgetConfig}
                    />
                    <div className="lg:sticky lg:top-0">
                      <WidgetPreview
                        widgetType={selectedWidgetType}
                        config={widgetConfig}
                        business={selectedBusiness}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Embed Code */}
                {createStep === 3 && createdWidget && (
                  <WidgetCodeGenerator widget={createdWidget} />
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    if (createStep === 1) closeCreateFlow();
                    else if (createStep === 3) closeCreateFlow();
                    else setCreateStep(createStep - 1);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  {createStep === 1 || createStep === 3 ? "Cancel" : "Back"}
                </button>

                {createStep === 2 && (
                  <button
                    onClick={handleCreateWidget}
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-medium flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Creating...
                      </>
                    ) : (
                      <>Create Widget</>
                    )}
                  </button>
                )}

                {createStep === 3 && (
                  <button
                    onClick={closeCreateFlow}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingWidget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Edit Widget</h2>
                <button
                  onClick={() => setEditingWidget(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {/* Edit form would go here - reuse WidgetCustomizer */}
                <p className="text-gray-600">
                  Editing widget: {editingWidget.name || editingWidget.widgetKey}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetsPage;