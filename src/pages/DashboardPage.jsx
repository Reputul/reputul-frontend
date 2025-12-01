import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext"; // NEW: Import BusinessContext
import { useNavigate } from "react-router-dom";
import { buildUrl, API_ENDPOINTS } from "../config/api";

// NEW: Import new dashboard components
import BusinessHeader from "../components/dashboard/BusinessHeader";
import KeyMetricsGrid from "../components/dashboard/KeyMetricsGrid";
import ReputationScoreCard from "../components/dashboard/ReputationScoreCard";
import LatestReviewsList from "../components/dashboard/LatestReviewsList";

// Keep existing modal imports
import AddBusinessModal from "../components/dashboard/modals/AddBusinessModal";
import EditBusinessModal from "../components/dashboard/modals/EditBusinessModal";
import RequestReviewsModal from "../components/dashboard/modals/RequestReviewsModal";
import ReputationModal from "../components/dashboard/modals/ReputationModal";

const DashboardPage = () => {
  const { token } = useAuth();
  const { selectedBusiness, businesses, refreshBusinesses } = useBusiness(); // NEW: Use business context
  const navigate = useNavigate();

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Modal state
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showRequestReviews, setShowRequestReviews] = useState(false);
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [reputationBreakdownData, setReputationBreakdownData] = useState(null);

  // Business form state (for modals)
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
  const [requestReviewsData, setRequestReviewsData] = useState({
    selectedBusiness: "",
    customerEmail: "",
    customerName: "",
    message: "",
  });

  // NEW: Fetch dashboard data for selected business
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

      // Fetch reputation data
      const reputationResponse = await axios.get(
        buildUrl(
          `/api/v1/reputation/business/${selectedBusiness.id}/breakdown`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch review summary
      const summaryResponse = await axios.get(
        buildUrl(API_ENDPOINTS.BUSINESS.REVIEW_SUMMARY(selectedBusiness.id)),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Combine data
      setDashboardData({
        metrics: {
          totalReviews: summaryResponse.data.totalReviews || 0,
          newReviews: metricsResponse.data.totalReviewsInPeriod || 0,
          avgRating: summaryResponse.data.averageRating || 0,
          engagementRate: metricsResponse.data.completed
            ? Math.round(
                (metricsResponse.data.completed / metricsResponse.data.sent) *
                  100
              )
            : 0,
        },
        reputation: {
          score: Math.round(reputationResponse.data.reputulRating * 10) || 0,
          badge: selectedBusiness.badge || "Unranked",
          trend: 0, // TODO: Calculate trend from historical data
          totalReviews: summaryResponse.data.totalReviews || 0,
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
        reputation: {
          score: 0,
          badge: "Unranked",
          trend: 0,
          totalReviews: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [token, selectedBusiness]);

  // NEW: Fetch reviews for selected business
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

  // NEW: Fetch reputation breakdown for modal
  const fetchReputationBreakdown = useCallback(async () => {
    if (!token || !selectedBusiness) return;

    try {
      const response = await axios.get(
        buildUrl(
          `/api/v1/reputation/business/${selectedBusiness.id}/breakdown`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReputationBreakdownData(response.data);
    } catch (err) {
      console.error("Error fetching reputation breakdown:", err);
    }
  }, [token, selectedBusiness]);

  // Fetch data when selected business changes
  useEffect(() => {
    if (selectedBusiness) {
      fetchDashboardData();
      fetchReviews();
    }
  }, [selectedBusiness, fetchDashboardData, fetchReviews]);

  // Business CRUD handlers (keep existing logic)
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
        refreshBusinesses(); // Refresh business list
      } catch (err) {
        console.error("Error creating business:", err);
        alert("Failed to create business");
      }
    },
    [newBusiness, token, refreshBusinesses]
  );

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
      } catch (err) {
        console.error("Error updating business:", err);
        alert("Failed to update business");
      }
    },
    [editingBusiness, editBusinessData, token, refreshBusinesses]
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
        fetchDashboardData(); // Refresh metrics
      } catch (err) {
        console.error("Error sending review request:", err);
        alert("Failed to send review request");
      }
    },
    [requestReviewsData, token, fetchDashboardData]
  );

  const handleRequestReviewsChange = useCallback((e) => {
    setRequestReviewsData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleShowReputationBreakdown = useCallback(() => {
    setShowReputationModal(true);
    fetchReputationBreakdown();
  }, [fetchReputationBreakdown]);

  const handleRecalculateReputation = useCallback(
    async (businessId) => {
      try {
        await axios.post(
          buildUrl(`/api/v1/reputation/business/${businessId}/recalculate`),
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await fetchReputationBreakdown();
        await fetchDashboardData();
        alert("Reputation score recalculated successfully!");
      } catch (err) {
        console.error("Error recalculating reputation:", err);
        alert("Failed to recalculate reputation");
      }
    },
    [token, fetchReputationBreakdown, fetchDashboardData]
  );

  // Empty state when no business selected
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

  // NEW: Loading state when selecting business
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NEW: Business Header */}
        <BusinessHeader business={selectedBusiness} />

        {/* NEW: Key Metrics Grid */}
        <KeyMetricsGrid metrics={dashboardData?.metrics} loading={loading} />

        {/* NEW: Reputation Score Card */}
        <ReputationScoreCard
          reputation={dashboardData?.reputation}
          loading={loading}
          onViewBreakdown={handleShowReputationBreakdown}
        />

        {/* NEW: Latest Reviews List */}
        <LatestReviewsList
          reviews={reviews}
          loading={reviewsLoading}
          businessId={selectedBusiness?.id}
        />
      </div>

      {/* Keep all existing modals */}
      <AddBusinessModal
        showAddBusiness={showAddBusiness}
        setShowAddBusiness={setShowAddBusiness}
        newBusiness={newBusiness}
        handleBusinessChange={handleBusinessChange}
        handleCreateBusiness={handleCreateBusiness}
        businesses={businesses}
        fetchBusinesses={refreshBusinesses}
      />

      <EditBusinessModal
        editingBusiness={editingBusiness}
        setEditingBusiness={setEditingBusiness}
        editBusinessData={editBusinessData}
        handleEditBusinessChange={handleEditBusinessChange}
        handleUpdateBusiness={handleUpdateBusiness}
        businesses={businesses}
        fetchBusinesses={refreshBusinesses}
      />

      <RequestReviewsModal
        showRequestReviews={showRequestReviews}
        setShowRequestReviews={setShowRequestReviews}
        requestReviewsData={requestReviewsData}
        handleRequestReviewsChange={handleRequestReviewsChange}
        handleRequestReviews={handleRequestReviews}
        businesses={businesses}
      />

      <ReputationModal
        showReputationModal={showReputationModal}
        setShowReputationModal={setShowReputationModal}
        selectedBusinessForReputation={selectedBusiness}
        setSelectedBusinessForReputation={() => {}} // Not needed anymore
        reputationBreakdownData={reputationBreakdownData}
        setReputationBreakdownData={setReputationBreakdownData}
        handleRecalculateReputation={handleRecalculateReputation}
      />
    </div>
  );
};

export default DashboardPage;
