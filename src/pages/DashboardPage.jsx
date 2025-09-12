import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { buildUrl, API_ENDPOINTS } from "../config/api";
import WilsonRating from "../components/WilsonRating";
import ReputationBreakdown from "../components/ReputationBreakdown";

const DashboardPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [reviewsMap, setReviewsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [reviewSummaries, setReviewSummaries] = useState({});
  const [setupBannerDismissed, setSetupBannerDismissed] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);

  // NEW: Real-time metrics state
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsPeriod, setMetricsPeriod] = useState(30);

  // Add state for editing
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editBusinessData, setEditBusinessData] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });

  // Add state for modals
  const [showRequestReviews, setShowRequestReviews] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [requestReviewsData, setRequestReviewsData] = useState({
    selectedBusiness: "",
    customerEmail: "",
    customerName: "",
    message: "",
  });

  //  Wilson Score state
  const [wilsonBreakdowns, setWilsonBreakdowns] = useState({});
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [selectedBusinessForReputation, setSelectedBusinessForReputation] =
    useState(null);
  const [reputationBreakdownData, setReputationBreakdownData] = useState(null);
  

  // Fetch dashboard metrics
  const fetchMetrics = useCallback(async () => {
    if (!token) return;

    setMetricsLoading(true);
    try {
      const response = await axios.get(
        buildUrl(
          `${API_ENDPOINTS.BUSINESS.DASHBOARD_METRICS}?days=${metricsPeriod}`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMetrics(response.data);
      console.log("📊 Dashboard metrics loaded:", response.data);
    } catch (err) {
      console.error("Error fetching dashboard metrics:", err);
      // Set fallback metrics on error
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
    console.log("🔄 fetchBusinesses called");
    try {
      const res = await axios.get(buildUrl(API_ENDPOINTS.BUSINESS.DASHBOARD), {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("🔥 Raw API response:", res.data);
      setBusinesses(res.data);

      // Fetch review summaries
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

      // Fetch all reviews
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

  // Fetch contacts count for dashboard metrics
  const fetchContactsCount = useCallback(async () => {
    try {
      const response = await axios.get("/api/contacts", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 1 }, // Just get count, not data
      });
      setContactsCount(response.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching contacts count:", err);
    }
  }, [token]);

  // Fetch Wilson Score breakdown for businesses
  const fetchWilsonBreakdowns = useCallback(async () => {
    if (!token) return;

    try {
      const breakdowns = {};
      await Promise.all(
        businesses.map(async (business) => {
          try {
            const response = await axios.get(
              buildUrl(`/api/reputation/business/${business.id}/breakdown`),
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

  // Fetch detailed reputation breakdown for modal
  const fetchReputationBreakdown = useCallback(
    async (businessId) => {
      if (!token) return;

      try {
        const response = await axios.get(
          buildUrl(`/api/reputation/business/${businessId}/detailed`),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReputationBreakdownData(response.data);
      } catch (err) {
        console.error(
          `Error fetching detailed reputation for business ${businessId}:`,
          err
        );
        // Set fallback data
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

  useEffect(() => {
    fetchBusinesses();
    fetchContactsCount();
    fetchMetrics(); // NEW: Fetch metrics on load
  }, [fetchBusinesses, fetchContactsCount, fetchMetrics]);

  useEffect(() => {
    if (businesses.length > 0) {
      fetchWilsonBreakdowns();
    }
  }, [businesses, fetchWilsonBreakdowns]);

  // NEW: Refetch metrics when period changes
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, metricsPeriod]);

  // Listen for platform updates and page visibility changes
  useEffect(() => {
    const handlePlatformUpdate = () => {
      console.log("Platform configuration updated, refreshing businesses...");
      fetchBusinesses();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refreshing businesses...");
        fetchBusinesses();
      }
    };

    const handleWindowFocus = () => {
      console.log("Window focused, refreshing businesses...");
      fetchBusinesses();
    };

    // Listen for custom platform update events
    window.addEventListener("platformsUpdated", handlePlatformUpdate);

    // Listen for page visibility changes (when user switches tabs/apps)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listen for window focus (when user returns from another page)
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("platformsUpdated", handlePlatformUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [fetchBusinesses]);

  // ADDITIONAL: Refresh when component mounts (important for navigation)
  useEffect(() => {
    console.log(
      "Dashboard component mounted, fetching latest business data..."
    );
    fetchBusinesses();
  }, []); // Only run on mount

  // Banner dismiss functionality useEffect
  useEffect(() => {
    const dismissed = localStorage.getItem("platformSetupBannerDismissed");
    const remindTime = localStorage.getItem("platformSetupRemindTime");

    if (dismissed === "true") {
      // Check if remind time has passed
      if (remindTime && Date.now() >= parseInt(remindTime)) {
        // Reset if remind time expired
        localStorage.removeItem("platformSetupBannerDismissed");
        localStorage.removeItem("platformSetupRemindTime");
        setSetupBannerDismissed(false);
      } else {
        setSetupBannerDismissed(true);
      }
    }
  }, []);

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
        fetchMetrics(); // NEW: Refresh metrics after adding business
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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
        // Use the new direct endpoint that matches frontend data
        await axios.post(
          buildUrl("/api/review-requests/send-direct"), // ← New endpoint
          requestReviewsData, // ← This data structure matches what backend expects
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRequestReviewsData({
          selectedBusiness: "",
          customerEmail: "",
          customerName: "",
          message: "",
        });
        setShowRequestReviews(false);
        alert("Review request sent successfully!");
        fetchMetrics(); // NEW: Refresh metrics after sending request
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

  // Handle reputation modal
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
          buildUrl(`/api/reputation/business/${businessId}/recalculate`),
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Refresh data
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
        fetchMetrics(); // NEW: Refresh metrics after deleting business
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
    // Set reminder for 24 hours from now
    const remindTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("platformSetupRemindTime", remindTime.toString());
    localStorage.setItem("platformSetupBannerDismissed", "true");
  };

  const copyPublicLink = useCallback((businessId) => {
    const link = `${window.location.origin}/business/${businessId}`;
    navigator.clipboard.writeText(link);
    alert("Public link copied to clipboard!");
  }, []);

  // NEW: Period selector component
  const PeriodSelector = () => (
    <div className="flex items-center space-x-2 mb-6">
      <span className="text-sm font-medium text-gray-700">Time Period:</span>
      <select
        value={metricsPeriod}
        onChange={(e) => setMetricsPeriod(parseInt(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value={7}>Last 7 days</option>
        <option value={30}>Last 30 days</option>
        <option value={90}>Last 90 days</option>
      </select>
    </div>
  );

  // NEW: Calculate completion rate for trend
  const getCompletionRateTrend = () => {
    if (!metrics || !metrics.sent) return null;
    const rate = ((metrics.completed / metrics.sent) * 100).toFixed(1);
    return `${rate}%`;
  };

  // Calculate static metrics as fallback
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

  // Enhanced Circular Progress Component
  const CircularProgress = ({ rating, size = 64 }) => {
    const radius = size / 2 - 4;
    const circumference = 2 * Math.PI * radius;
    const progress = (rating / 5) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${progress} ${circumference}`}
            className="text-primary-500 transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-primary-600">{rating}</span>
        </div>
      </div>
    );
  };

  // NEW: Enhanced Metric Card Component with real data
  const MetricCard = ({
    icon,
    title,
    value,
    subtitle,
    trend,
    color = "primary",
    loading = false,
  }) => {
    const colorClasses = {
      primary: "from-blue-500 to-blue-600",
      yellow: "from-yellow-500 to-yellow-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      red: "from-red-500 to-red-600",
    };

    const bgColorClasses = {
      primary: "bg-blue-50",
      yellow: "bg-yellow-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      red: "bg-red-50",
    };

    return (
      <div
        className={`${bgColorClasses[color]} rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <>
                <p
                  className={`text-3xl font-bold group-hover:scale-105 transition-transform text-gray-900`}
                >
                  {value}
                </p>
                <p className="text-sm text-gray-500">{subtitle}</p>
                {trend && (
                  <p
                    className={`text-xs font-medium mt-1 ${
                      trend.startsWith("+")
                        ? "text-green-600"
                        : trend.startsWith("-")
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {trend} from last period
                  </p>
                )}
              </>
            )}
          </div>
          <div
            className={`p-3 bg-gradient-to-r ${colorClasses[color]} rounded-lg shadow-sm group-hover:scale-110 transition-transform`}
          >
            {icon}
          </div>
        </div>
      </div>
    );
  };

  // Create a stable review form component
  const ReviewForm = React.memo(({ businessId }) => {
    const [localRating, setLocalRating] = useState("");
    const [localComment, setLocalComment] = useState("");

    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault();
        if (!localRating || !localComment) {
          alert("Please fill in both rating and comment");
          return;
        }

        try {
          await axios.post(
            buildUrl(API_ENDPOINTS.REVIEWS.MANUAL(businessId)),
            { rating: localRating, comment: localComment },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setLocalRating("");
          setLocalComment("");
          alert("Review added successfully!");
          fetchBusinesses();
          fetchMetrics(); // NEW: Refresh metrics after adding review
        } catch (err) {
          console.error("Error submitting review:", err);
          alert("Failed to add review");
        }
      },
      [
        businessId,
        localRating,
        localComment,
        token,
        fetchBusinesses,
        fetchMetrics,
      ]
    );

    return (
      <div
        id={`review-form-${businessId}`}
        className="bg-gray-50 rounded-lg p-4 mb-4"
      >
        <h5 className="text-sm font-semibold text-gray-900 mb-3">
          Add Manual Review
        </h5>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-4 gap-3">
            <select
              name="rating"
              value={localRating}
              onChange={(e) => setLocalRating(e.target.value)}
              required
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
              <option value="">Rating</option>
              <option value="5">5 ⭐</option>
              <option value="4">4 ⭐</option>
              <option value="3">3 ⭐</option>
              <option value="2">2 ⭐</option>
              <option value="1">1 ⭐</option>
            </select>
            <input
              type="text"
              name="comment"
              placeholder="Review comment..."
              value={localComment}
              onChange={(e) => setLocalComment(e.target.value)}
              required
              className="col-span-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Add Review
            </button>
          </div>
        </form>
      </div>
    );
  });

  // Enhanced Business Card Component
  const BusinessCard = React.memo(({ business }) => {
    const getBadgeColor = (badge) => {
      if (badge === "Top Rated") return "bg-green-100 text-green-800";
      if (badge === "Rising Star") return "bg-yellow-100 text-yellow-800";
      return "bg-gray-100 text-gray-800";
    };

    const summary = reviewSummaries[business.id];
    const reviews = reviewsMap[business.id] || [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {business.name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${getBadgeColor(
                    business.badge
                  )}`}
                >
                  {business.badge}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{business.industry}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{business.phone}</span>
                <span>•</span>
                <span>{business.website}</span>
              </div>
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={() => handleEditBusiness(business)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => copyPublicLink(business.id)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              >
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-4M14 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteBusiness(business.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* CONDITIONAL PLATFORM SETUP REMINDER */}
          {!business.reviewPlatformsConfigured && (
            <div className="bg-white/90 backdrop-blur-xl border-2 border-dashed border-amber-300 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-amber-600"
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
                  <span className="text-sm font-medium text-amber-800">
                    Platform setup needed
                  </span>
                </div>
                <button
                  onClick={() => navigate("/review-platform-setup")}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md font-medium transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Configure
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Metrics Row with Wilson Score */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center mb-2">
                {wilsonBreakdowns[business.id] ? (
                  <WilsonRating
                    rating={wilsonBreakdowns[business.id].reputulRating}
                    totalReviews={wilsonBreakdowns[business.id].totalReviews}
                    size="md"
                    showNumber={true}
                    showConfidence={true}
                  />
                ) : (
                  <CircularProgress
                    rating={
                      summary
                        ? summary.averageRating
                        : business.reputationScore || 0
                    }
                    size={48}
                  />
                )}
              </div>
              <p className="text-sm font-medium text-yellow-700">
                Customer Rating
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl border border-primary-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-primary-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-2xl font-bold text-primary-600">
                  {summary ? summary.totalReviews : business.reviewCount || 0}
                </span>
              </div>
              <p className="text-sm font-medium text-primary-700">
                Total Reviews
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center mb-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {wilsonBreakdowns[business.id]
                      ? Math.round(wilsonBreakdowns[business.id].compositeScore)
                      : business.reputationScore || 0}
                  </div>
                  <div className="text-xs text-purple-500">Score</div>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-700">
                {business.badge || "Unranked"}
              </p>
            </div>
          </div>

          {/* Recent Reviews with enhanced styling */}
          {reviews.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Recent Reviews
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-500">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Manual Review */}
          <ReviewForm businessId={business.id} />

          {/* Enhanced Action Buttons with Reputation Details */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => window.open(`/business/${business.id}`, "_blank")}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 group"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Analytics</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <button
              onClick={() => handleShowReputationBreakdown(business)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
            >
              Reputation
            </button>

            {business.reviewPlatformsConfigured ? (
              <button
                onClick={() => {
                  const reviewForm = document.querySelector(
                    `#review-form-${business.id}`
                  );
                  if (reviewForm) {
                    reviewForm.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                    reviewForm.querySelector("select").focus();
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
              >
                Add Review
              </button>
            ) : (
              <button
                onClick={() => navigate("/review-platform-setup")}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
              >
                Setup First
              </button>
            )}
          </div>
        </div>
      </div>
    );
  });

  const QuickActions = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={() => setShowAddBusiness(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-primary-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
            <svg
              className="w-5 h-5 text-primary-600"
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
          </div>
          <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
            Add New Business
          </span>
        </button>

        {/* Customer Management Link */}
        <Link
          to="/customers"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-indigo-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
            Manage Customers
          </span>
        </Link>

        {/* Contacts CRM Link */}
        <Link
          to="/contacts"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            Contact Database
          </span>
        </Link>

        <button
          onClick={() => setShowRequestReviews(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
            Request Reviews
          </span>
        </button>

        <button
          onClick={() => setShowAnalytics(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-all duration-200 group"
        >
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
            View Analytics
          </span>
        </button>
      </div>
    </div>
  );

  const RecentActivity = () => {
    const allReviews = Object.values(reviewsMap)
      .flat()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    // Mock data for demonstration when no real reviews
    const mockActivity = [
      {
        type: "review",
        user: "John D.",
        business: "Joe's Plumbing",
        rating: 5,
        time: "2 hours ago",
        comment: "Excellent service!",
      },
      {
        type: "response",
        user: "You",
        business: "Elite Auto Repair",
        time: "4 hours ago",
        action: "replied to review",
      },
      {
        type: "review",
        user: "Sarah M.",
        business: "Downtown Hair Salon",
        rating: 4,
        time: "1 day ago",
        comment: "Great experience",
      },
    ];

    const activityData =
      allReviews.length > 0
        ? allReviews.map((review) => {
            const business = businesses.find(
              (b) => b.id === review.business?.id
            );
            return {
              type: "review",
              user: "Customer",
              business: business?.name || "Unknown Business",
              rating: review.rating,
              time: new Date(review.createdAt).toLocaleDateString(),
              comment: review.comment,
            };
          })
        : mockActivity;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">
            Latest updates from your businesses
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activityData.map((activity, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <div
                  className={`p-2 rounded-lg ${
                    activity.type === "review"
                      ? "bg-green-100"
                      : "bg-primary-100"
                  }`}
                >
                  {activity.type === "review" ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.user}</span>
                    {activity.type === "review" ? (
                      <>
                        {" "}
                        left a {activity.rating}-star review for{" "}
                        <span className="font-semibold">
                          {activity.business}
                        </span>
                        {activity.comment && (
                          <span className="block text-gray-600 italic mt-1">
                            "{activity.comment}"
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {" "}
                        {activity.action} for{" "}
                        <span className="font-semibold">
                          {activity.business}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg
                      className="w-3 h-3 mr-1"
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
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View All Activity →
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Loading State
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
      {/* Enhanced Header */}
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
              <svg
                className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
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
              <span className="font-semibold">Add Business</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NEW: Period Selector */}
        <PeriodSelector />

        {/* Enhanced Metrics Cards with Real-time Data */}
        <div className="grid grid-cols-12 gap-6 mb-8">
          {/* Review Requests Sent */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
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
              subtitle={`Last ${metricsPeriod} days`}
              color="primary"
              loading={metricsLoading}
            />
          </div>

          {/* Completion Rate */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
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
              subtitle="Reviews submitted"
              trend={getCompletionRateTrend()}
              color="green"
              loading={metricsLoading}
            />
          </div>

          {/* Average Rating (Period) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
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
              subtitle={`Last ${metricsPeriod} days`}
              color="yellow"
              loading={metricsLoading}
            />
          </div>

          {/* Total Contacts */}
          <div className="col-span-12 md:col-span-6 lg:col-span-3">
            <MetricCard
              icon={
                <svg
                  className="w-6 h-6 text-white"
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
              title="Total Contacts"
              value={staticMetrics.totalContacts}
              subtitle="In your database"
              color="purple"
              loading={false}
            />
          </div>
        </div>

        {/* NEW: Time Series Chart */}
        {metrics?.byDay && metrics.byDay.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity Over Time
            </h3>
            <div className="h-64 flex items-end space-x-2">
              {metrics.byDay.map((day, index) => {
                const maxValue = Math.max(
                  ...metrics.byDay.map((d) =>
                    Math.max(d.requestsSent, d.reviewsReceived)
                  )
                );
                const requestHeight =
                  maxValue > 0 ? (day.requestsSent / maxValue) * 200 : 0;
                const reviewHeight =
                  maxValue > 0 ? (day.reviewsReceived / maxValue) * 200 : 0;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="relative w-full max-w-16 mb-2">
                      <div
                        className="bg-blue-500 rounded-t mx-1"
                        style={{ height: `${requestHeight}px` }}
                        title={`${day.requestsSent} requests sent`}
                      />
                      <div
                        className="bg-green-500 rounded-t mx-1"
                        style={{ height: `${reviewHeight}px` }}
                        title={`${day.reviewsReceived} reviews received`}
                      />
                    </div>
                    <div className="text-xs text-gray-500 transform -rotate-45 origin-center">
                      {new Date(day.date).getMonth() + 1}/
                      {new Date(day.date).getDate()}
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

        {/* Enhanced Review Platform Setup Reminder with Glassmorphism */}
        {!setupBannerDismissed &&
          businesses.some((b) => !b.reviewPlatformsConfigured) && (
            <div className="bg-white/90 backdrop-blur-xl border border-yellow-200 rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mr-4 shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      🚀 Complete Your Setup
                    </h3>
                    <p className="text-gray-700 mb-3">
                      {businesses.filter((b) => !b.reviewPlatformsConfigured)
                        .length === 1
                        ? "1 business needs"
                        : `${
                            businesses.filter(
                              (b) => !b.reviewPlatformsConfigured
                            ).length
                          } businesses need`}{" "}
                      platform configuration. Set up Google/Facebook review URLs
                      to maximize your reputation impact.
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
                <button
                  onClick={handleDismissBanner}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  title="Dismiss permanently"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Businesses
                </h2>
                <p className="text-gray-600">
                  Manage and monitor your business reputation
                </p>
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
              // Enhanced Empty State
              <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl border-2 border-dashed border-primary-200 p-12 text-center">
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-primary-500 to-purple-600 rounded-full w-full h-full flex items-center justify-center shadow-xl">
                    <svg
                      className="w-16 h-16 text-white"
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to boost your reputation?
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  Add your first business and start collecting 5-star reviews
                  that drive more customers to your door.
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
                  .filter(
                    (business) =>
                      selectedFilter === "all" || business.badge === "Top Rated"
                  )
                  .map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />

            {/* Enhanced Performance Insights */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-3 mb-4">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-green-900">💡 Pro Tip</h3>
              </div>
              <p className="text-sm text-green-800 leading-relaxed mb-4">
                Businesses that respond to reviews within 24 hours see a 15%
                increase in customer satisfaction and rank higher in local
                search results.
              </p>
              <button className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex items-center space-x-1 group">
                <span>Learn More</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All modals remain the same - keeping existing functionality */}
      {/* Enhanced Add Business Modal with Glassmorphism */}
      {showAddBusiness && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Business
            </h3>
            <form onSubmit={handleCreateBusiness}>
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={newBusiness.name}
                    onChange={handleBusinessChange}
                    placeholder="Business Name"
                    required
                    className="w-full p-4 pt-6 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all duration-200 peer placeholder-transparent"
                  />
                  <label className="absolute left-4 top-2 text-xs text-primary-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600">
                    Business Name
                  </label>
                </div>

                <input
                  type="text"
                  name="industry"
                  value={newBusiness.industry}
                  onChange={handleBusinessChange}
                  placeholder="Industry (e.g., Plumbing, Auto Repair)"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="text"
                  name="phone"
                  value={newBusiness.phone}
                  onChange={handleBusinessChange}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="url"
                  name="website"
                  value={newBusiness.website}
                  onChange={handleBusinessChange}
                  placeholder="Website URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="text"
                  name="address"
                  value={newBusiness.address}
                  onChange={handleBusinessChange}
                  placeholder="Business Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Create Business
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBusiness(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Edit Business Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Edit Business
            </h3>
            <form onSubmit={handleUpdateBusiness}>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={editBusinessData.name}
                  onChange={handleEditBusinessChange}
                  placeholder="Business Name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="text"
                  name="industry"
                  value={editBusinessData.industry}
                  onChange={handleEditBusinessChange}
                  placeholder="Industry (e.g., Plumbing, Auto Repair)"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="text"
                  name="phone"
                  value={editBusinessData.phone}
                  onChange={handleEditBusinessChange}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="url"
                  name="website"
                  value={editBusinessData.website}
                  onChange={handleEditBusinessChange}
                  placeholder="Website URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <input
                  type="text"
                  name="address"
                  value={editBusinessData.address}
                  onChange={handleEditBusinessChange}
                  placeholder="Business Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Update Business
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBusiness(null);
                    setEditBusinessData({
                      name: "",
                      industry: "",
                      phone: "",
                      website: "",
                      address: "",
                    });
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Request Reviews Modal */}
      {showRequestReviews && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-md w-full p-8 shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Request Reviews
            </h3>
            <form onSubmit={handleRequestReviews}>
              <div className="space-y-4">
                <select
                  name="selectedBusiness"
                  value={requestReviewsData.selectedBusiness}
                  onChange={handleRequestReviewsChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select Business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="customerName"
                  value={requestReviewsData.customerName}
                  onChange={handleRequestReviewsChange}
                  placeholder="Customer Name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
                <input
                  type="email"
                  name="customerEmail"
                  value={requestReviewsData.customerEmail}
                  onChange={handleRequestReviewsChange}
                  placeholder="Customer Email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
                <textarea
                  name="message"
                  value={requestReviewsData.message}
                  onChange={handleRequestReviewsChange}
                  placeholder="Personal message (optional)"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-200"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestReviews(false);
                    setRequestReviewsData({
                      selectedBusiness: "",
                      customerEmail: "",
                      customerName: "",
                      message: "",
                    });
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Analytics Modal with Real Metrics */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Analytics Overview
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-primary-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 font-medium">
                      Requests Sent
                    </p>
                    <p className="text-2xl font-bold text-primary-900">
                      {metrics?.sent || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-200 rounded-lg">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {metrics?.completed || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-200 rounded-lg">
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">
                      Businesses
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {staticMetrics.totalBusinesses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-200 rounded-lg">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">
                      Avg Rating (Period)
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {metrics?.averageRatingInPeriod?.toFixed(1) ||
                        staticMetrics.averageRating}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Business Performance Table */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">
                Business Performance
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                      <th className="pb-3">Business</th>
                      <th className="pb-3">Reviews</th>
                      <th className="pb-3">Rating</th>
                      <th className="pb-3">Badge</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {businesses.map((business) => {
                      const summary = reviewSummaries[business.id];
                      return (
                        <tr
                          key={business.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 font-medium text-gray-900">
                            {business.name}
                          </td>
                          <td className="py-3">
                            {summary
                              ? summary.totalReviews
                              : business.reviewCount || 0}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-500">★</span>
                              <span>
                                {summary
                                  ? summary.averageRating.toFixed(1)
                                  : business.reputationScore || "0.0"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                                business.badge === "Top Rated"
                                  ? "bg-green-100 text-green-800"
                                  : business.badge === "Rising Star"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {business.badge || "Unranked"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reputation Breakdown Modal */}
      {showReputationModal && selectedBusinessForReputation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedBusinessForReputation.name}
                </h3>
                <p className="text-gray-600">Wilson Score Analysis</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    handleRecalculateReputation(
                      selectedBusinessForReputation.id
                    )
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Recalculate
                </button>
                <button
                  onClick={() => {
                    setShowReputationModal(false);
                    setSelectedBusinessForReputation(null);
                    setReputationBreakdownData(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
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
            </div>

            <div className="p-6">
              <ReputationBreakdown
                businessId={selectedBusinessForReputation.id}
                breakdown={reputationBreakdownData}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
