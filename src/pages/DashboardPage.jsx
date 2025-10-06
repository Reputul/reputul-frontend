import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { buildUrl, API_ENDPOINTS } from "../config/api";

// Component imports
import MetricCard from "../components/dashboard/MetricCard";
import PeriodSelector from "../components/dashboard/PeriodSelector";
import BusinessCard from "../components/dashboard/BusinessCard";
import QuickActions from "../components/dashboard/QuickActions";
import RecentActivity from "../components/dashboard/RecentActivity";
import ProTip from "../components/dashboard/ProTip";

// Modal imports
import AddBusinessModal from "../components/dashboard/modals/AddBusinessModal";
import EditBusinessModal from "../components/dashboard/modals/EditBusinessModal";
import RequestReviewsModal from "../components/dashboard/modals/RequestReviewsModal";
import AnalyticsModal from "../components/dashboard/modals/AnalyticsModal";
import ReputationModal from "../components/dashboard/modals/ReputationModal";

const DashboardPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State management
  const [businesses, setBusinesses] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [reviewSummaries, setReviewSummaries] = useState({});
  const [setupBannerDismissed, setSetupBannerDismissed] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);

  // Mobile menu state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Metrics state
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsPeriod, setMetricsPeriod] = useState(30);

  // Business form state
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editBusinessData, setEditBusinessData] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });

  // Modal state
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showRequestReviews, setShowRequestReviews] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [requestReviewsData, setRequestReviewsData] = useState({
    selectedBusiness: "",
    customerEmail: "",
    customerName: "",
    message: "",
  });

  // Wilson Score state
  const [wilsonBreakdowns, setWilsonBreakdowns] = useState({});
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [selectedBusinessForReputation, setSelectedBusinessForReputation] =
    useState(null);
  const [reputationBreakdownData, setReputationBreakdownData] = useState(null);

  // Fetch functions (keep all existing fetch functions - no changes needed)
  const fetchMetrics = useCallback(async () => {
    if (!token) return;
    setMetricsLoading(true);
    try {
      const response = await axios.get(
        buildUrl(`${API_ENDPOINTS.DASHBOARD.METRICS}?days=${metricsPeriod}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMetrics(response.data);
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
      setMetrics({
        sent: 0,
        delivered: 0,
        failed: 0,
        completed: 0,
        totalReviewsInPeriod: 0,
        averageRatingInPeriod: 0.0,
        activeBusinesses: 0,
        totalBusinesses: 0,
        byDay: [],
      });
    } finally {
      setMetricsLoading(false);
    }
  }, [token, metricsPeriod]);

  const fetchBusinesses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(buildUrl(API_ENDPOINTS.DASHBOARD.LIST), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(res.data);

      const summaries = {};
      await Promise.all(
        res.data.map(async (biz) => {
          try {
            const summaryRes = await axios.get(
              buildUrl(API_ENDPOINTS.BUSINESS.REVIEW_SUMMARY(biz.id)),
              { headers: { Authorization: `Bearer ${token}` } }
            );
            summaries[biz.id] = summaryRes.data;
          } catch (err) {
            console.error(
              `Error fetching summary for business ${biz.id}:`,
              err
            );
          }
        })
      );
      setReviewSummaries(summaries);

      const reviewsData = {};
      await Promise.all(
        res.data.map(async (biz) => {
          try {
            const reviewRes = await axios.get(
              buildUrl(API_ENDPOINTS.REVIEWS.BY_BUSINESS(biz.id)),
              { headers: { Authorization: `Bearer ${token}` } }
            );
            reviewsData[biz.id] = reviewRes.data;
          } catch (err) {
            console.error(
              `Error fetching reviews for business ${biz.id}:`,
              err
            );
          }
        })
      );
      setReviewsMap(reviewsData);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      alert("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchContactsCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get("/api/v1/contacts", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 1 },
      });
      setContactsCount(response.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching contacts count:", err);
    }
  }, [token]);

  const fetchWilsonBreakdowns = useCallback(async () => {
    if (!token) return;
    try {
      const breakdowns = {};
      await Promise.all(
        businesses.map(async (business) => {
          try {
            const response = await axios.get(
              buildUrl(`/api/v1/reputation/business/${business.id}/breakdown`),
              { headers: { Authorization: `Bearer ${token}` } }
            );
            breakdowns[business.id] = response.data;
          } catch (err) {
            console.error(
              `Error fetching Wilson breakdown for business ${business.id}:`,
              err
            );
          }
        })
      );
      setWilsonBreakdowns(breakdowns);
    } catch (err) {
      console.error("Error fetching Wilson breakdowns:", err);
    }
  }, [token, businesses]);

  const fetchReputationBreakdown = useCallback(
    async (businessId) => {
      if (!token) return;
      try {
        const response = await axios.get(
          buildUrl(`/api/v1/reputation/business/${businessId}/detailed`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReputationBreakdownData(response.data);
      } catch (err) {
        console.error(
          `Error fetching detailed reputation for business ${businessId}:`,
          err
        );
        setReputationBreakdownData({
          reputulRating: 0.0,
          compositeScore: 0,
          qualityScore: 0,
          velocityScore: 0,
          responsivenessScore: 0,
          totalReviews: 0,
          positiveReviews: 0,
          reviewsLast90d: 0,
        });
      }
    },
    [token]
  );

  // Event handlers (keep all existing handlers)
  const handleBusinessChange = useCallback((e) => {
    setNewBusiness((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleEditBusinessChange = useCallback((e) => {
    setEditBusinessData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleCreateBusiness = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await axios.post(buildUrl(API_ENDPOINTS.BUSINESS.LIST), newBusiness, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewBusiness({
          name: "",
          industry: "",
          phone: "",
          website: "",
          address: "",
        });
        setShowAddBusiness(false);
        alert("Business created successfully!");
        fetchBusinesses();
        fetchMetrics();
      } catch (err) {
        console.error("Error creating business:", err);
        alert("Failed to create business");
      }
    },
    [newBusiness, token, fetchBusinesses, fetchMetrics]
  );

  const handleEditBusiness = useCallback((business) => {
    setEditingBusiness(business.id);
    setEditBusinessData({
      name: business.name || "",
      industry: business.industry || "",
      phone: business.phone || "",
      website: business.website || "",
      address: business.address || "",
    });
  }, []);

  const handleUpdateBusiness = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await axios.put(
          buildUrl(API_ENDPOINTS.BUSINESS.BY_ID(editingBusiness)),
          editBusinessData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditingBusiness(null);
        setEditBusinessData({
          name: "",
          industry: "",
          phone: "",
          website: "",
          address: "",
        });
        alert("Business updated successfully!");
        fetchBusinesses();
      } catch (err) {
        console.error("Error updating business:", err);
        alert("Failed to update business");
      }
    },
    [editingBusiness, editBusinessData, token, fetchBusinesses]
  );

  const handleRequestReviews = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await axios.post(
          buildUrl("/api/v1/review-requests/send-direct"),
          requestReviewsData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRequestReviewsData({
          selectedBusiness: "",
          customerEmail: "",
          customerName: "",
          message: "",
        });
        setShowRequestReviews(false);
        alert("Review request sent successfully!");
        fetchMetrics();
      } catch (err) {
        console.error("Error sending review request:", err);
        alert("Failed to send review request");
      }
    },
    [requestReviewsData, token, fetchMetrics]
  );

  const handleRequestReviewsChange = useCallback((e) => {
    setRequestReviewsData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleShowReputationBreakdown = useCallback(
    async (business) => {
      setSelectedBusinessForReputation(business);
      setShowReputationModal(true);
      await fetchReputationBreakdown(business.id);
    },
    [fetchReputationBreakdown]
  );

  const handleRecalculateReputation = useCallback(
    async (businessId) => {
      try {
        await axios.post(
          buildUrl(`/api/v1/reputation/business/${businessId}/recalculate`),
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await fetchReputationBreakdown(businessId);
        await fetchWilsonBreakdowns();
        alert("Reputation score recalculated successfully!");
      } catch (err) {
        console.error("Error recalculating reputation:", err);
        alert("Failed to recalculate reputation score");
      }
    },
    [token, fetchReputationBreakdown, fetchWilsonBreakdowns]
  );

  const handleDeleteBusiness = useCallback(
    async (businessId) => {
      if (!window.confirm("Are you sure you want to delete this business?"))
        return;
      try {
        await axios.delete(buildUrl(API_ENDPOINTS.BUSINESS.BY_ID(businessId)), {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Business deleted successfully!");
        fetchBusinesses();
        fetchMetrics();
      } catch (err) {
        console.error("Error deleting business:", err);
        alert("Failed to delete business");
      }
    },
    [token, fetchBusinesses, fetchMetrics]
  );

  const handleDismissBanner = () => {
    setSetupBannerDismissed(true);
    localStorage.setItem("platformSetupBannerDismissed", "true");
  };

  const handleRemindLater = () => {
    setSetupBannerDismissed(true);
    const remindTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("platformSetupRemindTime", remindTime.toString());
    localStorage.setItem("platformSetupBannerDismissed", "true");
  };

  const copyPublicLink = useCallback((businessId) => {
    const link = `${window.location.origin}/business/${businessId}`;
    navigator.clipboard.writeText(link);
    alert("Public link copied to clipboard!");
  }, []);

  // Effects (keep all existing useEffects)
  useEffect(() => {
    fetchBusinesses();
    fetchContactsCount();
    fetchMetrics();
  }, [fetchBusinesses, fetchContactsCount, fetchMetrics]);

  useEffect(() => {
    if (businesses.length > 0) {
      fetchWilsonBreakdowns();
    }
  }, [businesses, fetchWilsonBreakdowns]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, metricsPeriod]);

  useEffect(() => {
    const handlePlatformUpdate = () => {
      fetchBusinesses();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBusinesses();
      }
    };

    const handleWindowFocus = () => {
      fetchBusinesses();
    };

    window.addEventListener("platformsUpdated", handlePlatformUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("platformsUpdated", handlePlatformUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchBusinesses]);

  useEffect(() => {
    const dismissed = localStorage.getItem("platformSetupBannerDismissed");
    const remindTime = localStorage.getItem("platformSetupRemindTime");

    if (dismissed === "true") {
      if (remindTime && Date.now() >= parseInt(remindTime)) {
        localStorage.removeItem("platformSetupBannerDismissed");
        localStorage.removeItem("platformSetupRemindTime");
        setSetupBannerDismissed(false);
      } else {
        setSetupBannerDismissed(true);
      }
    }
  }, []);

  // Helper functions
  const getCompletionRateTrend = () => {
    if (!metrics || !metrics.sent) return null;
    const rate = ((metrics.completed / metrics.sent) * 100).toFixed(1);
    return `${rate}%`;
  };

  const staticMetrics = {
    totalReviews: businesses.reduce(
      (sum, biz) => sum + (biz.reviewCount || 0),
      0
    ),
    averageRating:
      businesses.length > 0
        ? (
            businesses.reduce(
              (sum, biz) => sum + (biz.reputationScore || 0),
              0
            ) / businesses.length
          ).toFixed(1)
        : "0.0",
    responseTime: 18,
    totalBusinesses: businesses.length,
    totalContacts: contactsCount,
  };

  // Loading state
  if (loading && !businesses.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 mx-auto mb-4"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-primary-500 border-r-primary-400 border-b-primary-300 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-full animate-pulse left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent truncate">
                Reputul
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 hidden sm:block">
                Manage your business reputation
              </p>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Desktop add business button */}
            <button
              onClick={() => setShowAddBusiness(true)}
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
            >
              <svg
                className="w-4 h-4 lg:w-5 lg:h-5"
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
              <span className="text-sm lg:text-base font-semibold hidden sm:inline">
                Add Business
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-6">
              <QuickActions
                setShowAddBusiness={(val) => {
                  setShowAddBusiness(val);
                  setShowMobileSidebar(false);
                }}
                setShowRequestReviews={(val) => {
                  setShowRequestReviews(val);
                  setShowMobileSidebar(false);
                }}
                setShowAnalytics={(val) => {
                  setShowAnalytics(val);
                  setShowMobileSidebar(false);
                }}
              />
              <RecentActivity businesses={businesses} reviewsMap={reviewsMap} />
              <ProTip />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <PeriodSelector
            metricsPeriod={metricsPeriod}
            setMetricsPeriod={setMetricsPeriod}
          />
        </div>

        {/* Metrics Cards - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <MetricCard
            icon={
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            }
            title="Requests Sent"
            value={metrics?.sent || 0}
            subtitle={`Last ${metricsPeriod}d`}
            color="primary"
            loading={metricsLoading}
          />

          <MetricCard
            icon={
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="Completed"
            value={metrics?.completed || 0}
            subtitle="Reviews"
            trend={getCompletionRateTrend()}
            color="green"
            loading={metricsLoading}
          />

          <MetricCard
            icon={
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            title="Avg Rating"
            value={
              metrics?.averageRatingInPeriod?.toFixed(1) ||
              staticMetrics.averageRating
            }
            subtitle={`${metricsPeriod}d`}
            color="yellow"
            loading={metricsLoading}
          />

          <MetricCard
            icon={
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            title="Contacts"
            value={staticMetrics.totalContacts}
            subtitle="Total"
            color="purple"
            loading={false}
          />
        </div>

        {/* Time Series Chart - Hide on small mobile, show on tablet+ */}
        {metrics?.byDay && metrics.byDay.length > 0 && (
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Activity Over Time
            </h3>
            <div className="h-48 sm:h-64 flex items-end space-x-1 sm:space-x-2 overflow-x-auto">
              {metrics.byDay.map((day) => {
                const maxValue = Math.max(
                  ...metrics.byDay.map((d) =>
                    Math.max(d.requestsSent, d.reviewsReceived)
                  )
                );
                const requestHeight =
                  maxValue > 0 ? (day.requestsSent / maxValue) * 150 : 0;
                const reviewHeight =
                  maxValue > 0 ? (day.reviewsReceived / maxValue) * 150 : 0;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center min-w-[20px]"
                  >
                    <div className="relative w-full max-w-16 mb-2">
                      <div
                        className="bg-blue-500 rounded-t mx-0.5 sm:mx-1"
                        style={{ height: `${requestHeight}px` }}
                        title={`${day.requestsSent} requests`}
                      />
                      <div
                        className="bg-green-500 rounded-t mx-0.5 sm:mx-1"
                        style={{ height: `${reviewHeight}px` }}
                        title={`${day.reviewsReceived} reviews`}
                      />
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500 transform -rotate-45 origin-center whitespace-nowrap">
                      {new Date(day.date).getMonth() + 1}/
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-4 sm:space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Requests
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Reviews
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Platform Setup Banner */}
        {!setupBannerDismissed &&
          businesses.some((b) => !b.reviewPlatformsConfigured) && (
            <div className="bg-white/90 backdrop-blur-xl border border-yellow-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg flex-shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Complete Your Setup
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 mb-3">
                      {businesses.filter((b) => !b.reviewPlatformsConfigured)
                        .length === 1
                        ? "1 business needs"
                        : `${
                            businesses.filter(
                              (b) => !b.reviewPlatformsConfigured
                            ).length
                          } businesses need`}{" "}
                      platform configuration.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => navigate("/review-platform-setup")}
                        className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                      >
                        Configure Now
                      </button>
                      <button
                        onClick={handleRemindLater}
                        className="text-gray-600 hover:text-gray-800 px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        Remind in 24h
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDismissBanner}
                  className="self-start sm:self-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content - Full width until xl, then 2 columns */}
          <div className="col-span-1 xl:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Your Businesses
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Manage your reputation
                </p>
              </div>
              <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
                <button
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === "all"
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                  onClick={() => setSelectedFilter("all")}
                >
                  All
                </button>
                <button
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === "top-rated"
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                  onClick={() => setSelectedFilter("top-rated")}
                >
                  Top Rated
                </button>
              </div>
            </div>

            {businesses.length === 0 ? (
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-primary-200 p-8 sm:p-12 text-center">
                <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 rounded-full w-full h-full flex items-center justify-center shadow-xl">
                    <svg
                      className="w-12 h-12 sm:w-16 sm:h-16 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Ready to boost your reputation?
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
                  Add your first business and start collecting 5-star reviews
                </p>
                <button
                  onClick={() => setShowAddBusiness(true)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-2xl hover:shadow-primary-500/25 transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
                >
                  Add Your First Business
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {businesses
                  .filter(
                    (business) =>
                      selectedFilter === "all" || business.badge === "Top Rated"
                  )
                  .map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      reviewSummaries={reviewSummaries}
                      reviewsMap={reviewsMap}
                      wilsonBreakdowns={wilsonBreakdowns}
                      token={token}
                      handleEditBusiness={handleEditBusiness}
                      copyPublicLink={copyPublicLink}
                      handleDeleteBusiness={handleDeleteBusiness}
                      handleShowReputationBreakdown={
                        handleShowReputationBreakdown
                      }
                      fetchBusinesses={fetchBusinesses}
                      fetchMetrics={fetchMetrics}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Desktop Sidebar - Only visible on xl screens */}
          <div className="hidden xl:block col-span-1">
            <div className="space-y-6 sticky top-24">
              <QuickActions
                setShowAddBusiness={setShowAddBusiness}
                setShowRequestReviews={setShowRequestReviews}
                setShowAnalytics={setShowAnalytics}
              />
              <RecentActivity businesses={businesses} reviewsMap={reviewsMap} />
              <ProTip />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB (Floating Action Button) for Add Business */}
      <button
        onClick={() => setShowAddBusiness(true)}
        className="sm:hidden fixed bottom-6 right-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white p-4 rounded-full shadow-2xl hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 z-30"
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
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* All Modals */}
      <AddBusinessModal
        showAddBusiness={showAddBusiness}
        setShowAddBusiness={setShowAddBusiness}
        newBusiness={newBusiness}
        handleBusinessChange={handleBusinessChange}
        handleCreateBusiness={handleCreateBusiness}
        businesses={businesses}
        fetchBusinesses={fetchBusinesses}
      />

      <EditBusinessModal
        editingBusiness={editingBusiness}
        setEditingBusiness={setEditingBusiness}
        editBusinessData={editBusinessData}
        handleEditBusinessChange={handleEditBusinessChange}
        handleUpdateBusiness={handleUpdateBusiness}
        businesses={businesses}
        fetchBusinesses={fetchBusinesses}
      />

      <RequestReviewsModal
        showRequestReviews={showRequestReviews}
        setShowRequestReviews={setShowRequestReviews}
        requestReviewsData={requestReviewsData}
        handleRequestReviewsChange={handleRequestReviewsChange}
        handleRequestReviews={handleRequestReviews}
        businesses={businesses}
      />

      <AnalyticsModal
        showAnalytics={showAnalytics}
        setShowAnalytics={setShowAnalytics}
        metrics={metrics}
        staticMetrics={staticMetrics}
        businesses={businesses}
        reviewSummaries={reviewSummaries}
      />

      <ReputationModal
        showReputationModal={showReputationModal}
        setShowReputationModal={setShowReputationModal}
        selectedBusinessForReputation={selectedBusinessForReputation}
        setSelectedBusinessForReputation={setSelectedBusinessForReputation}
        reputationBreakdownData={reputationBreakdownData}
        setReputationBreakdownData={setReputationBreakdownData}
        handleRecalculateReputation={handleRecalculateReputation}
      />
    </div>
  );
};

export default DashboardPage;
