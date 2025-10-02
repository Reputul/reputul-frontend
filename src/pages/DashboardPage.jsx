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
  const [selectedBusinessForReputation, setSelectedBusinessForReputation] = useState(null);
  const [reputationBreakdownData, setReputationBreakdownData] = useState(null);

  // Fetch functions
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
            console.error(`Error fetching summary for business ${biz.id}:`, err);
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
            console.error(`Error fetching reviews for business ${biz.id}:`, err);
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
            console.error(`Error fetching Wilson breakdown for business ${business.id}:`, err);
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
        console.error(`Error fetching detailed reputation for business ${businessId}:`, err);
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

  // Event handlers
  const handleBusinessChange = useCallback((e) => {
    setNewBusiness((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleEditBusinessChange = useCallback((e) => {
    setEditBusinessData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    setRequestReviewsData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      if (!window.confirm("Are you sure you want to delete this business?")) return;
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

  // Effects
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
    totalReviews: businesses.reduce((sum, biz) => sum + (biz.reviewCount || 0), 0),
    averageRating:
      businesses.length > 0
        ? (
            businesses.reduce((sum, biz) => sum + (biz.reputationScore || 0), 0) /
            businesses.length
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
    <div className="bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Reputul Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your business reputation with confidence
              </p>
            </div>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 group"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">Add Business</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PeriodSelector metricsPeriod={metricsPeriod} setMetricsPeriod={setMetricsPeriod} />

        {/* Metrics Cards */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              }
              title="Requests Sent"
              value={metrics?.sent || 0}
              subtitle={`Last ${metricsPeriod} days`}
              color="primary"
              loading={metricsLoading}
            />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Completed"
              value={metrics?.completed || 0}
              subtitle="Reviews submitted"
              trend={getCompletionRateTrend()}
              color="green"
              loading={metricsLoading}
            />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              }
              title="Avg Rating"
              value={metrics?.averageRatingInPeriod?.toFixed(1) || staticMetrics.averageRating}
              subtitle={`Last ${metricsPeriod} days`}
              color="yellow"
              loading={metricsLoading}
            />
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              title="Total Contacts"
              value={staticMetrics.totalContacts}
              subtitle="In your database"
              color="purple"
              loading={false}
            />
          </div>
        </div>

        {/* Time Series Chart */}
        {metrics?.byDay && metrics.byDay.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Over Time</h3>
            <div className="h-64 flex items-end space-x-2">
              {metrics.byDay.map((day) => {
                const maxValue = Math.max(...metrics.byDay.map((d) => Math.max(d.requestsSent, d.reviewsReceived)));
                const requestHeight = maxValue > 0 ? (day.requestsSent / maxValue) * 200 : 0;
                const reviewHeight = maxValue > 0 ? (day.reviewsReceived / maxValue) * 200 : 0;

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full max-w-16 mb-2">
                      <div className="bg-blue-500 rounded-t mx-1" style={{ height: `${requestHeight}px` }} title={`${day.requestsSent} requests sent`} />
                      <div className="bg-green-500 rounded-t mx-1" style={{ height: `${reviewHeight}px` }} title={`${day.reviewsReceived} reviews received`} />
                    </div>
                    <div className="text-xs text-gray-500 transform -rotate-45 origin-center">
                      {new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Requests Sent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Reviews Received</span>
              </div>
            </div>
          </div>
        )}

        {/* Platform Setup Banner */}
        {!setupBannerDismissed && businesses.some((b) => !b.reviewPlatformsConfigured) && (
          <div className="bg-white/90 backdrop-blur-xl border border-yellow-200 rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-4 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Complete Your Setup</h3>
                  <p className="text-gray-700 mb-3">
                    {businesses.filter((b) => !b.reviewPlatformsConfigured).length === 1
                      ? "1 business needs"
                      : `${businesses.filter((b) => !b.reviewPlatformsConfigured).length} businesses need`}{" "}
                    platform configuration. Set up Google/Facebook review URLs to maximize your reputation impact.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/review-platform-setup")}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Configure Review Platforms
                    </button>
                    <button
                      onClick={handleRemindLater}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Remind me in 24 hours
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleDismissBanner} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200" title="Dismiss permanently">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Businesses</h2>
                <p className="text-gray-600">Manage and monitor your business reputation</p>
              </div>
              <div className="flex space-x-3">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === "all"
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 hover:border-primary-300"
                  }`}
                  onClick={() => setSelectedFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === "top-rated"
                      ? "bg-primary-500 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 hover:border-primary-300"
                  }`}
                  onClick={() => setSelectedFilter("top-rated")}
                >
                  Top Rated
                </button>
              </div>
            </div>

            {businesses.length === 0 ? (
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border-2 border-dashed border-primary-200 p-12 text-center">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 rounded-full w-full h-full flex items-center justify-center shadow-xl">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to boost your reputation?</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Add your first business and start collecting 5-star reviews that drive more customers to your door.
                </p>
                <button
                  onClick={() => setShowAddBusiness(true)}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-primary-500/25 transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
                >
                  Add Your First Business
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {businesses
                  .filter((business) => selectedFilter === "all" || business.badge === "Top Rated")
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
                      handleShowReputationBreakdown={handleShowReputationBreakdown}
                      fetchBusinesses={fetchBusinesses}
                      fetchMetrics={fetchMetrics}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

      {/* Modals */}
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