import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

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

  const fetchBusinesses = useCallback(async () => {
    console.log('🔄 fetchBusinesses called');
    try {
      const res = await axios.get("http://localhost:8080/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('📥 Raw API response:', res.data);
      setBusinesses(res.data);

      // Fetch review summaries
      const summaries = {};
      await Promise.all(
        res.data.map(async (biz) => {
          try {
            const summaryRes = await axios.get(
              `http://localhost:8080/api/businesses/${biz.id}/review-summary`,
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
              `http://localhost:8080/api/reviews/business/${biz.id}`,
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

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Listen for platform updates and page visibility changes
  useEffect(() => {
    const handlePlatformUpdate = () => {
      console.log('Platform configuration updated, refreshing businesses...');
      fetchBusinesses();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, refreshing businesses...');
        fetchBusinesses();
      }
    };

    const handleWindowFocus = () => {
      console.log('Window focused, refreshing businesses...');
      fetchBusinesses();
    };

    // Listen for custom platform update events
    window.addEventListener('platformsUpdated', handlePlatformUpdate);
    
    // Listen for page visibility changes (when user switches tabs/apps)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for window focus (when user returns from another page)
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('platformsUpdated', handlePlatformUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchBusinesses]);

  // ADDITIONAL: Refresh when component mounts (important for navigation)
  useEffect(() => {
    console.log('Dashboard component mounted, fetching latest business data...');
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
        await axios.post("http://localhost:8080/api/businesses", newBusiness, {
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
      } catch (err) {
        console.error("Error creating business:", err);
        alert("Failed to create business");
      }
    },
    [newBusiness, token, fetchBusinesses]
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
          `http://localhost:8080/api/businesses/${editingBusiness}`,
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
        await axios.post(
          "http://localhost:8080/api/reviews/request",
          requestReviewsData,
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
      } catch (err) {
        console.error("Error sending review request:", err);
        alert("Failed to send review request");
      }
    },
    [requestReviewsData, token]
  );

  const handleRequestReviewsChange = useCallback((e) => {
    setRequestReviewsData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleDeleteBusiness = useCallback(
    async (businessId) => {
      if (!window.confirm("Are you sure you want to delete this business?"))
        return;
      try {
        await axios.delete(
          `http://localhost:8080/api/businesses/${businessId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Business deleted successfully!");
        fetchBusinesses();
      } catch (err) {
        console.error("Error deleting business:", err);
        alert("Failed to delete business");
      }
    },
    [token, fetchBusinesses]
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

  // Calculate metrics
  const metrics = {
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
  };

  const MetricCard = ({
    icon,
    title,
    value,
    subtitle,
    trend,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "text-blue-600 bg-blue-50",
      yellow: "text-yellow-600 bg-yellow-50",
      green: "text-green-600 bg-green-50",
      purple: "text-purple-600 bg-purple-50",
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p
              className={`text-3xl font-bold ${
                color === "yellow"
                  ? "text-yellow-500"
                  : color === "green"
                  ? "text-green-600"
                  : color === "purple"
                  ? "text-purple-600"
                  : "text-blue-600"
              }`}
            >
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 font-medium">
                  ↗ {trend}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
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
            `http://localhost:8080/api/reviews/manual/${businessId}`,
            { rating: localRating, comment: localComment },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setLocalRating("");
          setLocalComment("");
          alert("Review added successfully!");
          fetchBusinesses();
        } catch (err) {
          console.error("Error submitting review:", err);
          alert("Failed to add review");
        }
      },
      [businessId, localRating, localComment, token, fetchBusinesses]
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
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="col-span-2 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Add Review
            </button>
          </div>
        </form>
      </div>
    );
  });

  const BusinessCard = React.memo(({ business }) => {
    const getBadgeColor = (badge) => {
      if (badge === "Top Rated") return "bg-green-100 text-green-800";
      if (badge === "Rising Star") return "bg-yellow-100 text-yellow-800";
      return "bg-gray-100 text-gray-800";
    };

    const summary = reviewSummaries[business.id];
    const reviews = reviewsMap[business.id] || [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 group">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {business.name}
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getBadgeColor(
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
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditBusiness(business)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-amber-600 mr-2"
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
                  <span className="text-sm font-medium text-amber-800">
                    Platform setup needed
                  </span>
                </div>
                <button
                  onClick={() => navigate("/review-platform-setup")}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md font-medium transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-yellow-500 fill-current mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-2xl font-bold text-yellow-600">
                  {summary
                    ? summary.averageRating.toFixed(1)
                    : business.reputationScore || "0.0"}
                </span>
              </div>
              <p className="text-sm font-medium text-yellow-700">
                Average Rating
              </p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-blue-500 mr-2"
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
                <span className="text-2xl font-bold text-blue-600">
                  {summary ? summary.totalReviews : business.reviewCount || 0}
                </span>
              </div>
              <p className="text-sm font-medium text-blue-700">Total Reviews</p>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-purple-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-purple-700">
                {business.badge || "Unranked"}
              </p>
            </div>
          </div>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Recent Reviews
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
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

          {/* CONDITIONAL ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.open(`/business/${business.id}`, "_blank")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
            >
              View Analytics
            </button>

            {/* CONDITIONAL BUTTON - Only show "Add Review" if platforms are configured, otherwise "Setup First" */}
            {business.reviewPlatformsConfigured ? (
              <button
                onClick={() => {
                  // Scroll to the manual review form in this business card
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
                className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm"
              >
                Add Review
              </button>
            ) : (
              <button
                onClick={() => navigate("/review-platform-setup")}
                className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-sm"
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <button
          onClick={() => setShowAddBusiness(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
        >
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <span className="font-medium text-gray-900">Add New Business</span>
        </button>

        {/* NEW: Customer Management Link */}
        <Link
          to="/customers"
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
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
          <span className="font-medium text-gray-900">Manage Customers</span>
        </Link>

        <button
          onClick={() => setShowRequestReviews(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-lg transition-colors group"
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
          <span className="font-medium text-gray-900">Request Reviews</span>
        </button>

        <button
          onClick={() => setShowAnalytics(true)}
          className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
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
          <span className="font-medium text-gray-900">View Analytics</span>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div
                  className={`p-2 rounded-lg ${
                    activity.type === "review" ? "bg-green-100" : "bg-blue-100"
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
                      className="w-4 h-4 text-blue-600"
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
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activity →
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reputul Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your business reputation with confidence
              </p>
            </div>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
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
              <span className="font-semibold">Add Business</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            title="Average Rating"
            value={metrics.averageRating}
            subtitle="Across all businesses"
            trend="+0.3"
            color="yellow"
          />
          <MetricCard
            icon={
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            }
            title="Total Reviews"
            value={metrics.totalReviews}
            subtitle="This month"
            trend="+23"
            color="blue"
          />
          <MetricCard
            icon={
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            }
            title="Businesses"
            value={metrics.totalBusinesses}
            subtitle="Active listings"
            trend="+1"
            color="green"
          />
          <MetricCard
            icon={
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            title="Response Time"
            value={`${metrics.responseTime}h`}
            subtitle="Average response"
            trend="-6h"
            color="purple"
          />
        </div>

        {/* Review Platform Setup Reminder */}
        {!setupBannerDismissed &&
          businesses.some((b) => !b.reviewPlatformsConfigured) && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full mr-4">
                    <svg
                      className="w-6 h-6 text-yellow-600"
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
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Configure Review Platforms
                      </button>
                      <button
                        onClick={handleRemindLater}
                        className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Remind me in 24 hours
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDismissBanner}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                  onClick={() => setSelectedFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === "top-rated"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                  onClick={() => setSelectedFilter("top-rated")}
                >
                  Top Rated
                </button>
              </div>
            </div>

            {businesses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-blue-600"
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No businesses yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Get started by adding your first business to manage its
                  reputation and start collecting reviews.
                </p>
                <button
                  onClick={() => setShowAddBusiness(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
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

            {/* Performance Insights */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
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
              <p className="text-sm text-green-800 leading-relaxed">
                Businesses that respond to reviews within 24 hours see a 15%
                increase in customer satisfaction and rank higher in local
                search results.
              </p>
              <button className="mt-4 text-sm font-semibold text-green-700 hover:text-green-800">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Business Modal */}
      {showAddBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add New Business
            </h3>
            <form onSubmit={handleCreateBusiness}>
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={newBusiness.name}
                  onChange={handleBusinessChange}
                  placeholder="Business Name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="industry"
                  value={newBusiness.industry}
                  onChange={handleBusinessChange}
                  placeholder="Industry (e.g., Plumbing, Auto Repair)"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="phone"
                  value={newBusiness.phone}
                  onChange={handleBusinessChange}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="url"
                  name="website"
                  value={newBusiness.website}
                  onChange={handleBusinessChange}
                  placeholder="Website URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="address"
                  value={newBusiness.address}
                  onChange={handleBusinessChange}
                  placeholder="Business Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Create Business
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBusiness(false)}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Business Modal */}
      {editingBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="industry"
                  value={editBusinessData.industry}
                  onChange={handleEditBusinessChange}
                  placeholder="Industry (e.g., Plumbing, Auto Repair)"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="phone"
                  value={editBusinessData.phone}
                  onChange={handleEditBusinessChange}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="url"
                  name="website"
                  value={editBusinessData.website}
                  onChange={handleEditBusinessChange}
                  placeholder="Website URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  name="address"
                  value={editBusinessData.address}
                  onChange={handleEditBusinessChange}
                  placeholder="Business Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Reviews Modal */}
      {showRequestReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="email"
                  name="customerEmail"
                  value={requestReviewsData.customerEmail}
                  onChange={handleRequestReviewsChange}
                  placeholder="Customer Email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <textarea
                  name="message"
                  value={requestReviewsData.message}
                  onChange={handleRequestReviewsChange}
                  placeholder="Personal message (optional)"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
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
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Analytics Overview
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">
                      Total Reviews
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {metrics.totalReviews}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
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
                      Avg Rating
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {metrics.averageRating}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
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
                      {metrics.totalBusinesses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
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
                      Response Time
                    </p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {metrics.responseTime}h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Performance Table */}
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
                          className="border-b border-gray-100"
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
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
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
    </div>
  );
};

export default DashboardPage;
