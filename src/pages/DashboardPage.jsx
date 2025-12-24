import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { buildUrl, API_ENDPOINTS } from "../config/api";

// Component imports
import BusinessHeader from "../components/dashboard/BusinessHeader";
import KeyMetricsGrid from "../components/dashboard/KeyMetricsGrid";
import LatestReviewsList from "../components/dashboard/LatestReviewsList";

// Modal imports
import AddBusinessModal from "../components/dashboard/modals/AddBusinessModal";
import EditBusinessModal from "../components/dashboard/modals/EditBusinessModal";
import RequestReviewsModal from "../components/dashboard/modals/RequestReviewsModal";

// Helper function to get best available Google review URL
const getBestGoogleReviewUrl = (business) => {
  // Priority: direct review URL > short URL > search URL
  if (business?.googleReviewUrl) {
    return business.googleReviewUrl;
  }
  if (business?.googleReviewShortUrl) {
    return business.googleReviewShortUrl;
  }
  if (business?.googleSearchUrl) {
    return business.googleSearchUrl;
  }
  return null;
};

const DashboardPage = () => {
  const { token } = useAuth();
  const { selectedBusiness, businesses, refreshBusinesses } = useBusiness();

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Modal state
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showRequestReviews, setShowRequestReviews] = useState(false);

  // Business form state (for add modal)
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });

  // Edit business state
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [editBusinessData, setEditBusinessData] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });

  // Request reviews state
  const [requestReviewsData, setRequestReviewsData] = useState({
    selectedBusiness: "",
    customerEmail: "",
    customerName: "",
    message: "",
  });

  // Fetch dashboard data for selected business
  const fetchDashboardData = useCallback(async () => {
    if (!token || !selectedBusiness) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch business metrics
      const metricsResponse = await axios.get(
        buildUrl(`${API_ENDPOINTS.DASHBOARD.METRICS}?days=30`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch review summary
      const summaryResponse = await axios.get(
        buildUrl(API_ENDPOINTS.BUSINESS.REVIEW_SUMMARY(selectedBusiness.id)),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Combine data
      const sent = metricsResponse.data.sent || 0;
      const completed = metricsResponse.data.completed || 0;
      const engagementRate =
        sent > 0 ? Math.round((completed / sent) * 100) : 0;

      setDashboardData({
        metrics: {
          totalReviews: summaryResponse.data.totalReviews || 0,
          newReviews: metricsResponse.data.totalReviewsInPeriod || 0,
          avgRating: summaryResponse.data.averageRating || 0,
          engagementRate: engagementRate,
        },
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      // Set default values on error
      setDashboardData({
        metrics: {
          totalReviews: 0,
          newReviews: 0,
          avgRating: 0,
          engagementRate: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [token, selectedBusiness]);

  // Fetch reviews for selected business
  const fetchReviews = useCallback(async () => {
    if (!token || !selectedBusiness) return;

    try {
      setReviewsLoading(true);
      const response = await axios.get(
        buildUrl(API_ENDPOINTS.REVIEWS.BY_BUSINESS(selectedBusiness.id)),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(response.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [token, selectedBusiness]);

  // Fetch data when selected business changes
  useEffect(() => {
    if (selectedBusiness) {
      fetchDashboardData();
      fetchReviews();
    }
  }, [selectedBusiness, fetchDashboardData, fetchReviews]);

  // ============================================================
  // Business CRUD handlers
  // ============================================================

  // Add business handlers
  const handleBusinessChange = useCallback((e) => {
    setNewBusiness((prev) => ({
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
        refreshBusinesses();
      } catch (err) {
        console.error("Error creating business:", err);
        alert("Failed to create business");
      }
    },
    [newBusiness, token, refreshBusinesses]
  );

  // Edit business handlers
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

  const handleEditBusinessChange = useCallback((e) => {
    setEditBusinessData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        refreshBusinesses();
        fetchDashboardData();
      } catch (err) {
        console.error("Error updating business:", err);
        alert("Failed to update business");
      }
    },
    [
      editingBusiness,
      editBusinessData,
      token,
      refreshBusinesses,
      fetchDashboardData,
    ]
  );

  // Request reviews handlers
  const handleRequestReviewsChange = useCallback((e) => {
    setRequestReviewsData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

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
        fetchDashboardData();
      } catch (err) {
        console.error("Error sending review request:", err);
        alert("Failed to send review request");
      }
    },
    [requestReviewsData, token, fetchDashboardData]
  );

  // ============================================================
  // Render: Empty state when no businesses exist
  // ============================================================
  if (!selectedBusiness && businesses.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-white"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Reputul!
            </h2>
            <p className="text-gray-600 mb-6">
              Get started by adding your first business to begin managing
              reviews and reputation.
            </p>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Add Your First Business
            </button>
          </div>
        </div>

        {/* Modal must be included here for empty state to work */}
        <AddBusinessModal
          showAddBusiness={showAddBusiness}
          setShowAddBusiness={setShowAddBusiness}
          newBusiness={newBusiness}
          handleBusinessChange={handleBusinessChange}
          handleCreateBusiness={handleCreateBusiness}
          businesses={businesses}
          fetchBusinesses={refreshBusinesses}
        />
      </>
    );
  }

  // ============================================================
  // Render: Loading state when business is being selected
  // ============================================================
  if (!selectedBusiness && businesses.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // Render: Main dashboard with selected business
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Header with Edit and Request Reviews actions */}
        <BusinessHeader
          business={selectedBusiness}
          onEdit={() => handleEditBusiness(selectedBusiness)}
          onRequestReviews={() => {
            setRequestReviewsData((prev) => ({
              ...prev,
              selectedBusiness: selectedBusiness?.id?.toString() || "",
            }));
            setShowRequestReviews(true);
          }}
          onAddBusiness={() => setShowAddBusiness(true)}
        />

        {/* Key Metrics Grid - CHANGED: Removed onViewBreakdown prop, will add it to KeyMetricsGrid component later if needed */}
        <KeyMetricsGrid metrics={dashboardData?.metrics} loading={loading} />

        {/* Google Review URL Card */}
        {selectedBusiness && getBestGoogleReviewUrl(selectedBusiness) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Google Review Link
                  </h3>
                  {selectedBusiness.googlePlaceAutoDetected && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Auto-detected
                    </span>
                  )}
                </div>
                <a
                  href={getBestGoogleReviewUrl(selectedBusiness)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                >
                  {getBestGoogleReviewUrl(selectedBusiness)}
                </a>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    getBestGoogleReviewUrl(selectedBusiness)
                  );
                  alert("✅ Google review link copied to clipboard!");
                }}
                className="ml-4 flex-shrink-0 px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
                title="Copy review link"
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy
              </button>
            </div>
          </div>
        )}
        
        {/* Latest Reviews List */}
        <LatestReviewsList
          reviews={reviews}
          loading={reviewsLoading}
          businessId={selectedBusiness?.id}
          businessName={selectedBusiness?.name}
          business={selectedBusiness} 
        />
      </div>

      {/* ============================================================ */}
      {/* All Modals */}
      {/* ============================================================ */}

      {/* Add Business Modal */}
      <AddBusinessModal
        showAddBusiness={showAddBusiness}
        setShowAddBusiness={setShowAddBusiness}
        newBusiness={newBusiness}
        handleBusinessChange={handleBusinessChange}
        handleCreateBusiness={handleCreateBusiness}
        businesses={businesses}
        fetchBusinesses={refreshBusinesses}
      />

      {/* Edit Business Modal */}
      <EditBusinessModal
        editingBusiness={editingBusiness}
        setEditingBusiness={setEditingBusiness}
        editBusinessData={editBusinessData}
        handleEditBusinessChange={handleEditBusinessChange}
        handleUpdateBusiness={handleUpdateBusiness}
        businesses={businesses}
        fetchBusinesses={refreshBusinesses}
      />

      {/* Request Reviews Modal */}
      <RequestReviewsModal
        showRequestReviews={showRequestReviews}
        setShowRequestReviews={setShowRequestReviews}
        requestReviewsData={requestReviewsData}
        handleRequestReviewsChange={handleRequestReviewsChange}
        handleRequestReviews={handleRequestReviews}
        businesses={businesses}
      />
    </div>
  );
};

export default DashboardPage;