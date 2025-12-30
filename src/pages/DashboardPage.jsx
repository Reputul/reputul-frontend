import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";
import { buildUrl, API_ENDPOINTS } from "../config/api";
import {
  Plus,
  Settings,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Send,
} from "lucide-react";

// Components
import BusinessHeader from "../components/dashboard/BusinessHeader";
import KeyMetricsGrid from "../components/dashboard/KeyMetricsGrid";
import LatestReviewsList from "../components/dashboard/LatestReviewsList";

// Modals
import AddBusinessModal from "../components/dashboard/modals/AddBusinessModal";
import EditBusinessModal from "../components/dashboard/modals/EditBusinessModal";
import RequestReviewsModal from "../components/dashboard/modals/RequestReviewsModal";

// Helper function
const getBestGoogleReviewUrl = (business) => {
  if (business?.googleReviewUrl) return business.googleReviewUrl;
  if (business?.googleReviewShortUrl) return business.googleReviewShortUrl;
  if (business?.googleSearchUrl) return business.googleSearchUrl;
  return null;
};

const DashboardPage = () => {
  const { token } = useAuth();
  const { selectedBusiness, businesses, refreshBusinesses } = useBusiness();
  const navigate = useNavigate();

  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Modals
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const [showRequestReviews, setShowRequestReviews] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  // Form States
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    industry: "",
    phone: "",
    website: "",
    address: "",
  });
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

  // --- DATA FETCHING ---
  const fetchDashboardData = useCallback(async () => {
    if (!token || !selectedBusiness) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [metricsRes, summaryRes] = await Promise.all([
        axios.get(buildUrl(`${API_ENDPOINTS.DASHBOARD.METRICS}?days=30`), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(
          buildUrl(API_ENDPOINTS.BUSINESS.REVIEW_SUMMARY(selectedBusiness.id)),
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const sent = metricsRes.data.sent || 0;
      const completed = metricsRes.data.completed || 0;

      setDashboardData({
        metrics: {
          totalReviews: summaryRes.data.totalReviews || 0,
          newReviews: metricsRes.data.totalReviewsInPeriod || 0,
          avgRating: summaryRes.data.averageRating || 0,
          engagementRate: sent > 0 ? Math.round((completed / sent) * 100) : 0,
        },
      });
    } catch (err) {
      console.error("Data fetch error", err);
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
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [token, selectedBusiness]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchDashboardData();
      fetchReviews();
    }
  }, [selectedBusiness, fetchDashboardData, fetchReviews]);

  // --- HANDLERS (Business CRUD & Requests) ---
  // (Keeping logic identical to your original code, just shortened for brevity in this display)
  const handleBusinessChange = (e) =>
    setNewBusiness((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateBusiness = async (e) => {
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
      refreshBusinesses();
    } catch (err) {
      alert("Failed to create business");
    }
  };

  const handleEditBusiness = (business) => {
    setEditingBusiness(business.id);
    setEditBusinessData({ ...business });
  };

  const handleUpdateBusiness = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        buildUrl(API_ENDPOINTS.BUSINESS.BY_ID(editingBusiness)),
        editBusinessData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingBusiness(null);
      refreshBusinesses();
      fetchDashboardData();
    } catch (err) {
      alert("Failed to update");
    }
  };

  const handleRequestReviews = async (e) => {
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
      alert("Request sent!");
      fetchDashboardData();
    } catch (err) {
      alert("Failed to send");
    }
  };

  // --- RENDER ---

  // 1. Loading State
  if (!selectedBusiness && businesses.length > 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7d2ae8]"></div>
      </div>
    );
  }

  // 2. Empty State
  if (!selectedBusiness && businesses.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#7d2ae8]">
              <Plus size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to Reputul
            </h2>
            <p className="text-slate-500 mb-8">
              Add your first business to start managing your reputation.
            </p>
            <button
              onClick={() => setShowAddBusiness(true)}
              className="w-full py-3 bg-[#7d2ae8] hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-200"
            >
              Add Business
            </button>
          </div>
        </div>
        <AddBusinessModal
          showAddBusiness={showAddBusiness}
          setShowAddBusiness={setShowAddBusiness}
          newBusiness={newBusiness}
          handleBusinessChange={handleBusinessChange}
          handleCreateBusiness={handleCreateBusiness}
        />
      </>
    );
  }

  // 3. Main Dashboard
  const googleLink = getBestGoogleReviewUrl(selectedBusiness);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {selectedBusiness.name}
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  googleLink ? "bg-green-500" : "bg-orange-500"
                }`}
              ></span>
              {googleLink ? "Reputation engine active" : "Setup incomplete"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddBusiness(true)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Add Business
            </button>
            <button
              onClick={() => {
                setRequestReviewsData((prev) => ({
                  ...prev,
                  selectedBusiness: selectedBusiness?.id?.toString() || "",
                }));
                setShowRequestReviews(true);
              }}
              className="px-4 py-2 bg-[#7d2ae8] hover:bg-purple-700 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 flex items-center gap-2"
            >
              <Send size={16} />
              Request Reviews
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <KeyMetricsGrid metrics={dashboardData?.metrics} loading={loading} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Reviews (Wider) */}
          <div className="lg:col-span-2">
            <LatestReviewsList
              reviews={reviews}
              loading={reviewsLoading}
              businessId={selectedBusiness?.id}
              businessName={selectedBusiness?.name}
              business={selectedBusiness}
            />
          </div>

          {/* Right Column: Quick Actions (Sidebar) */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Settings size={18} className="text-slate-400" />
                Quick Actions
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => navigate("/business/settings")}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between group transition-colors"
                >
                  <span>Edit Business Details</span>
                  <Settings
                    size={16}
                    className="text-slate-400 group-hover:text-[#7d2ae8]"
                  />
                </button>
                <button
                  onClick={() => {
                    setRequestReviewsData((prev) => ({
                      ...prev,
                      selectedBusiness: selectedBusiness?.id?.toString() || "",
                    }));
                    setShowRequestReviews(true);
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-between group transition-colors"
                >
                  <span>Send Review Request</span>
                  <Send
                    size={16}
                    className="text-slate-400 group-hover:text-[#7d2ae8]"
                  />
                </button>
              </div>
            </div>

            {/* Google Link Card */}
            {googleLink && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600">
                    <Share2 size={16} />
                  </div>
                  <h3 className="font-bold text-blue-900 text-sm">
                    Review Link
                  </h3>
                </div>

                <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                  Send this link directly to customers to get reviews on Google.
                </p>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={googleLink}
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(googleLink);
                      alert("Copied!");
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Copy Link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}
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
        fetchBusinesses={refreshBusinesses}
      />
      <EditBusinessModal
        editingBusiness={editingBusiness}
        setEditingBusiness={setEditingBusiness}
        editBusinessData={editBusinessData}
        handleEditBusinessChange={(e) =>
          setEditBusinessData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        handleUpdateBusiness={handleUpdateBusiness}
      />
      <RequestReviewsModal
        showRequestReviews={showRequestReviews}
        setShowRequestReviews={setShowRequestReviews}
        requestReviewsData={requestReviewsData}
        handleRequestReviewsChange={(e) =>
          setRequestReviewsData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
          }))
        }
        handleRequestReviews={handleRequestReviews}
        businesses={businesses}
      />
    </div>
  );
};

export default DashboardPage;
