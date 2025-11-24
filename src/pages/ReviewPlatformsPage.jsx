import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'sonner'; 
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext"; // NEW: Add business context
import { useNavigate } from "react-router-dom"; // NEW: Add navigation
import { API_ENDPOINTS, buildUrl } from "../config/api";

const ReviewPlatformsPage = () => {
  const [activeTab, setActiveTab] = useState("quick-setup");
  const [loading, setLoading] = useState(false); // Changed from businesses loading
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const successRef = useRef(null);
  const { token } = useAuth();
  const { selectedBusiness, businesses, loading: businessesLoading } = useBusiness(); // NEW: Use business context
  const navigate = useNavigate(); // NEW: Add navigation

  // Quick Setup state
  const [platformData, setPlatformData] = useState({
    googlePlaceId: "",
    facebookPageUrl: "",
    yelpPageUrl: "",
  });

  // Auto Sync state
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncingPlatforms, setSyncingPlatforms] = useState({});

  const SUPPORTED_PLATFORMS = [
    {
      id: "GOOGLE_MY_BUSINESS",
      name: "Google My Business",
      icon: "🔍",
      color: "blue",
      description: "Auto-sync reviews from Google",
    },
    {
      id: "FACEBOOK",
      name: "Facebook",
      icon: "📘",
      color: "indigo",
      description: "Auto-sync reviews from Facebook",
    },
  ];

  // NEW: Handle business context changes
  useEffect(() => {
    if (selectedBusiness) {
      fetchPlatformData();
      if (activeTab === "auto-sync") {
        fetchConnectedPlatforms();
      }
    } else {
      // Reset state when no business is selected
      setPlatformData({
        googlePlaceId: "",
        facebookPageUrl: "",
        yelpPageUrl: "",
      });
      setConnectedPlatforms([]);
    }
  }, [selectedBusiness, activeTab]);

  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      successRef.current.focus();
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchPlatformData = async () => {
    if (!selectedBusiness) return;

    try {
      const response = await axios.get(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlatformData(response.data || {
        googlePlaceId: "",
        facebookPageUrl: "",
        yelpPageUrl: "",
      });
    } catch (err) {
      console.error("Error fetching platform data:", err);
      // Don't show error for empty state - it's expected for new businesses
    }
  };

  const fetchConnectedPlatforms = async () => {
    if (!selectedBusiness) return;

    try {
      const response = await axios.get(
        buildUrl(`/api/v1/platforms/business/${selectedBusiness.id}/connected`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectedPlatforms(response.data || []);
    } catch (err) {
      console.error("Error fetching connected platforms:", err);
      setConnectedPlatforms([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const savePlatforms = async () => {
    if (!selectedBusiness) {
      setError("No business selected");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        platformData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(
        `✅ Platform configuration saved successfully for ${selectedBusiness.name}!`
      );
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save platform configuration. Please try again."
      );
      setSuccess("");
    } finally {
      setSaving(false);
    }
  };

  const connectPlatform = async (platformId) => {
    if (!selectedBusiness) {
      toast.error("No business selected");
      return;
    }

    try {
      const response = await axios.post(
        buildUrl("/api/v1/platforms/connect"),
        {
          platformType: platformId,
          businessId: selectedBusiness.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.authUrl) {
        window.open(response.data.authUrl, "_blank", "width=600,height=700");
      }
    } catch (err) {
      console.error("Error connecting platform:", err);
      toast.error("Failed to connect platform");
    }
  };

  const triggerSync = async (credentialId, platformName) => {
    if (!selectedBusiness) {
      toast.error("No business selected");
      return;
    }

    setSyncingPlatforms((prev) => ({ ...prev, [credentialId]: true }));

    try {
      await axios.post(
        buildUrl(`/api/v1/platforms/${credentialId}/sync`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${platformName} sync completed successfully!`);
      fetchConnectedPlatforms();
    } catch (err) {
      console.error("Error syncing platform:", err);
      toast.error(`Failed to sync ${platformName}`);
    } finally {
      setSyncingPlatforms((prev) => ({ ...prev, [credentialId]: false }));
    }
  };

  const disconnectPlatform = async (credentialId, platformName) => {
    if (!selectedBusiness) {
      toast.error("No business selected");
      return;
    }

    if (!confirm(`Disconnect ${platformName}? This will stop automatic review syncing.`)) {
      return;
    }

    try {
      await axios.delete(
        buildUrl(`/api/v1/platforms/${credentialId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${platformName} disconnected successfully`);
      fetchConnectedPlatforms();
    } catch (err) {
      console.error("Error disconnecting platform:", err);
      toast.error(`Failed to disconnect ${platformName}`);
    }
  };

  // NEW: No business selected state
  if (businessesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-content">
              <svg className="w-8 h-8 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Business</h3>
            <p className="text-gray-600 mb-6">
              Please select a business from the sidebar to configure review platforms.
            </p>
            {businesses.length === 0 ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
              >
                Create Your First Business
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Use the business selector in the sidebar to choose which business to configure.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* NEW: Business Context Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {selectedBusiness.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Platforms</h1>
                <p className="text-gray-600">
                  Configure review platforms for <span className="font-semibold">{selectedBusiness.name}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("quick-setup")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "quick-setup"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Quick Setup
              </button>
              <button
                onClick={() => setActiveTab("auto-sync")}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "auto-sync"
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Auto Sync
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                ref={successRef}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                tabIndex={-1}
              >
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* QUICK SETUP TAB */}
            {activeTab === "quick-setup" && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Quick Platform Setup
                  </h3>
                  <p className="text-gray-600">
                    Add your platform URLs to enable review collection buttons in your email campaigns.
                  </p>
                </div>

                {/* Google */}
                <div className="mb-8">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-red-600 font-bold">G</span>
                    </div>
                    <h3 className="text-md font-semibold text-gray-900">
                      Google My Business
                    </h3>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Place ID (Optional but Recommended)
                  </label>
                  <input
                    type="text"
                    name="googlePlaceId"
                    value={platformData.googlePlaceId}
                    onChange={handleInputChange}
                    placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Smart Fallback Notice */}
                  <div className="mt-3">
                    {!platformData.googlePlaceId && (
                      <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-900 mb-1">
                            Google Reviews Will Still Work
                          </h4>
                          <p className="text-sm text-green-700">
                            Without a Place ID, we'll create a smart Google
                            search using your business info.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Facebook */}
                <div className="mb-8">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">f</span>
                    </div>
                    <h3 className="text-md font-semibold text-gray-900">
                      Facebook Page
                    </h3>
                  </div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    name="facebookPageUrl"
                    value={platformData.facebookPageUrl}
                    onChange={handleInputChange}
                    placeholder="https://www.facebook.com/yourbusinesspage"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Save Button */}
                <div className="flex gap-3">
                  <button
                    onClick={savePlatforms}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>💾 Save Configuration</>
                    )}
                  </button>
                </div>

                {/* Info box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">
                    💡 How It Works:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • <strong>Google Reviews:</strong> Works with or without
                      Place ID (smart fallback included)
                    </li>
                    <li>
                      • <strong>Facebook Reviews:</strong> Enter your page URL
                      to enable Facebook review buttons
                    </li>
                    <li>
                      • <strong>Yelp Reviews:</strong> Optional - add if you
                      have a Yelp business page
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* AUTO SYNC TAB */}
            {activeTab === "auto-sync" && (
              <div>
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🚧</span>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">
                        OAuth Integration In Development
                      </h3>
                      <p className="text-sm text-yellow-800">
                        We're building automated review sync. Click "Connect"
                        below to test the OAuth flow!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connected Platforms */}
                {connectedPlatforms.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Connected Platforms for {selectedBusiness.name}
                    </h3>
                    <div className="space-y-4">
                      {connectedPlatforms.map((platform) => (
                        <div
                          key={platform.id}
                          className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <span className="text-green-600 font-bold">
                                {platform.platform === "FACEBOOK" ? "📘" : "🔍"}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {platform.platform === "FACEBOOK"
                                  ? "Facebook"
                                  : "Google My Business"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Status: {platform.status} | Last sync:{" "}
                                {platform.lastSyncAt
                                  ? new Date(platform.lastSyncAt).toLocaleDateString()
                                  : "Never"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                triggerSync(platform.id, platform.platform)
                              }
                              disabled={syncingPlatforms[platform.id]}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                            >
                              {syncingPlatforms[platform.id] ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Syncing...</span>
                                </div>
                              ) : (
                                "Sync Now"
                              )}
                            </button>
                            <button
                              onClick={() =>
                                disconnectPlatform(platform.id, platform.platform)
                              }
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Platforms */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Connect New Platforms
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {SUPPORTED_PLATFORMS.map((platform) => {
                      const isConnected = connectedPlatforms.some(
                        (cp) => cp.platform === platform.id
                      );
                      return (
                        <div
                          key={platform.id}
                          className={`p-6 border rounded-lg transition-all ${
                            isConnected
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl">{platform.icon}</span>
                            <h4 className="font-medium text-gray-900">
                              {platform.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">
                            {platform.description}
                          </p>
                          <button
                            onClick={() => connectPlatform(platform.id)}
                            disabled={isConnected}
                            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isConnected
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isConnected ? "Connected" : "Connect"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPlatformsPage;