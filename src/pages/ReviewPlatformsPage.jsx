import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'sonner'; 
import { useAuth } from "../context/AuthContext";
import { API_ENDPOINTS, buildUrl } from "../config/api";

const ReviewPlatformsPage = () => {
  const [activeTab, setActiveTab] = useState("quick-setup");
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const successRef = useRef(null);
  const { token } = useAuth();

  // Quick Setup state
  const [platformData, setPlatformData] = useState({
    googlePlaceId: "",
    googleReviewShortUrl: "", // NEW: g.page short URL support
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

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (selectedBusiness) {
      fetchPlatformData();
      if (activeTab === "auto-sync") {
        fetchConnectedPlatforms();
      }
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

  const fetchBusinesses = async () => {
    try {
      const response = await axios.get(buildUrl(API_ENDPOINTS.DASHBOARD.LIST), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinesses(response.data);
      if (response.data.length > 0) {
        setSelectedBusiness(response.data[0]);
      }
    } catch (err) {
      setError("Failed to fetch businesses");
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformData = async () => {
    if (!selectedBusiness) return;

    try {
      const response = await axios.get(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlatformData({
        googlePlaceId: response.data.googlePlaceId || "",
        googleReviewShortUrl: response.data.googleReviewShortUrl || "", // NEW
        facebookPageUrl: response.data.facebookPageUrl || "",
        yelpPageUrl: response.data.yelpPageUrl || "",
      });
    } catch (err) {
      console.error("Error fetching platform data:", err);
    }
  };

  const fetchConnectedPlatforms = async () => {
    if (!selectedBusiness) return;

    try {
      const response = await axios.get(
        buildUrl(`/api/v1/platforms/business/${selectedBusiness.id}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectedPlatforms(response.data);
    } catch (error) {
      console.error("Error fetching connected platforms:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPlatformData((prev) => ({ ...prev, [name]: value }));
  };

  const savePlatforms = async () => {
    if (!selectedBusiness) {
      setError("Please select a business first");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        platformData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("✅ Review platforms updated successfully!");
      toast.success("Review platforms updated successfully!"); 
      fetchBusinesses();
    } catch (err) {
      console.error("Error saving platforms:", err);
      const errorMsg = `Failed to save: ${err.response?.data?.message || err.message}`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectPlatform = async (platformType) => {
    if (!selectedBusiness) {
      toast.error("Please select a business first"); 
      return;
    }

    setSyncing(true);
    try {
      console.log(
        "Connecting platform:",
        platformType,
        "for business:",
        selectedBusiness.id
      );

      const response = await axios.get(
        buildUrl(
          `/api/v1/platforms/connect/${platformType}?businessId=${selectedBusiness.id}`
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Connect response:", response.data);

      if (response.data.error) {
        toast.error(response.data.error); 
        return;
      }

      if (response.data.authUrl) {
        console.log("Redirecting to:", response.data.authUrl);
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error("Connect platform error:", error);
      toast.error("Failed to connect platform"); 
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncPlatform = async (credentialId, platformName) => {
    setSyncingPlatforms(prev => ({ ...prev, [credentialId]: true }));
    
    // 🆕 Show loading toast with ID so we can update it
    const toastId = toast.loading(`Syncing ${platformName}...`);

    try {
      console.log('Starting sync for credential:', credentialId);

      const response = await axios.post(
        buildUrl(`/api/v1/platforms/${credentialId}/sync`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Sync response:', response.data);

      if (response.data.success) {
        const { reviewsFetched, newCount, updatedCount } = response.data;
        const message = `Sync complete! ${reviewsFetched || 0} reviews fetched (${newCount || 0} new, ${updatedCount || 0} updated)`;

        // 🆕 Update loading toast to success
        toast.success(message, { id: toastId, duration: 5000 });

        setTimeout(fetchConnectedPlatforms, 1000);
      }
    } catch (error) {
      console.error("Sync error:", error);

      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to sync reviews";

      // 🆕 Update loading toast to error
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSyncingPlatforms(prev => ({ ...prev, [credentialId]: false }));
    }
  };

  const handleDisconnect = async (credentialId) => {
    if (!window.confirm("Are you sure you want to disconnect this platform?")) {
      return;
    }

    try {
      await axios.delete(buildUrl(`/api/v1/platforms/${credentialId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Platform disconnected");
      fetchConnectedPlatforms();
    } catch (error) {
      toast.error("Failed to disconnect"); 
    }
  };

  const isConnected = (platformId) => {
    return connectedPlatforms.some(
      (p) => p.platform === platformId && p.status === "ACTIVE"
    );
  };

  const getConnectedPlatform = (platformId) => {
    return connectedPlatforms.find((p) => p.platform === platformId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading businesses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review Platforms
        </h1>
        <p className="text-gray-600">
          Configure review platforms and manage automated sync
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div
          ref={successRef}
          tabIndex={-1}
          className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {success}
        </div>
      )}

      {/* Business Selector */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Business
        </label>
        <select
          value={selectedBusiness?.id || ""}
          onChange={(e) => {
            const business = businesses.find(
              (b) => b.id === parseInt(e.target.value)
            );
            setSelectedBusiness(business);
          }}
          className="w-full md:w-96 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a business</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name} {business.reviewPlatformsConfigured && "✅"}
            </option>
          ))}
        </select>
      </div>

      {selectedBusiness && (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8 px-6">
                <button
                  onClick={() => setActiveTab("quick-setup")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "quick-setup"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    🔗 Review Request Links
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("auto-sync")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "auto-sync"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    🔄 Automated Sync
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                      Beta
                    </span>
                  </span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* QUICK SETUP TAB */}
              {activeTab === "quick-setup" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Manual Platform Setup
                    </h2>
                    <p className="text-gray-600">
                      Enter your review platform URLs to include them in review
                      request emails
                    </p>
                  </div>

                  {/* Google */}
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">G</span>
                      </div>
                      <h3 className="text-md font-semibold text-gray-900">
                        Google Reviews
                      </h3>
                    </div>

                    {/* Show auto-detection status if available */}
                    {selectedBusiness?.googlePlaceAutoDetected && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              ✅ Google Place ID Auto-Detected
                            </p>
                            <p className="text-xs text-green-700 mt-1">
                              We automatically found your business on Google: {selectedBusiness.googlePlaceName || selectedBusiness.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Place ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="googlePlaceId"
                      value={platformData.googlePlaceId}
                      onChange={handleInputChange}
                      placeholder="e.g., ChIJN1t_tDeuEmsRUsoyG83frY4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to auto-detect from business name and address
                    </p>

                    {/* NEW: g.page Short URL field */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OR paste your Google review link
                      </label>
                      <input
                        type="text"
                        name="googleReviewShortUrl"
                        value={platformData.googleReviewShortUrl}
                        onChange={handleInputChange}
                        placeholder="https://g.page/r/CZfH8POGJQGsEAI/review"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Get this from your Google Business Profile dashboard
                      </p>
                    </div>

                    {!platformData.googlePlaceId && !platformData.googleReviewShortUrl && selectedBusiness && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div>
                            <h4 className="text-sm font-semibold text-blue-800 mb-1">
                              💡 Auto-Detection Active
                            </h4>
                            <p className="text-sm text-blue-700">
                              We'll automatically find your Google Place ID when you save. A smart Google
                              search link will be generated if we can't find your exact business.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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

                  {/* Platform Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SUPPORTED_PLATFORMS.map((platform) => {
                      const connected = isConnected(platform.id);
                      const connectedCred = getConnectedPlatform(platform.id);
                      const isSyncing = syncingPlatforms[connectedCred?.id];

                      return (
                        <div
                          key={platform.id}
                          className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <span className="text-3xl mr-3">
                                {platform.icon}
                              </span>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {platform.name}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {platform.description}
                                </p>
                              </div>
                            </div>
                            {connected && (
                              <span className="text-green-500 text-xl">✓</span>
                            )}
                          </div>

                          {connected ? (
                            <div className="space-y-3">
                              <div className="text-xs text-gray-500">
                                <p className="mb-1">
                                  <span className="font-medium">Status: </span>
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      connectedCred.status === "ACTIVE"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {connectedCred.status}
                                  </span>
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Last synced:{" "}
                                  </span>
                                  {connectedCred.lastSyncAt
                                    ? new Date(
                                        connectedCred.lastSyncAt
                                      ).toLocaleString()
                                    : "Never"}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleSyncPlatform(connectedCred.id, platform.name)
                                  }
                                  disabled={isSyncing}
                                  className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                                    isSyncing
                                      ? "bg-gray-400 cursor-not-allowed text-white"
                                      : "bg-blue-500 text-white hover:bg-blue-600"
                                  }`}
                                >
                                  {isSyncing ? (
                                    <>
                                      <svg
                                        className="animate-spin h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                        ></circle>
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                      </svg>
                                      Syncing...
                                    </>
                                  ) : (
                                    "Sync Now"
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDisconnect(connectedCred.id)
                                  }
                                  disabled={isSyncing}
                                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Disconnect
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConnectPlatform(platform.id)}
                              disabled={syncing}
                              className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            >
                              {syncing
                                ? "Connecting..."
                                : `Connect ${platform.name}`}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewPlatformsPage;