import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'sonner'; 
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { API_ENDPOINTS, buildUrl } from "../config/api";
import PlatformIcon from "../components/PlatformIcon";
import ReconnectPlatformModal from "../components/ReconnectPlatformModal"; // ← ADDED

const ReviewPlatformsPage = () => {
  const [activeTab, setActiveTab] = useState("quick-setup");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const successRef = useRef(null);
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();

  // Quick Setup state
  const [platformData, setPlatformData] = useState({
    googlePlaceId: "",
    googleReviewShortUrl: "",
    facebookPageUrl: "",
  });

  // Auto Sync state
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncingPlatforms, setSyncingPlatforms] = useState({});

  // ← ADDED: Reconnection modal state
  const [reconnectModal, setReconnectModal] = useState({
    isOpen: false,
    platformType: null,
    platformName: null,
    credentialId: null,
    pendingSyncCredentialId: null, // Store which credential to sync after reconnect
  });

  const SUPPORTED_PLATFORMS = [
    {
      id: "GOOGLE_MY_BUSINESS",
      name: "Google My Business",
      icon: <PlatformIcon platform="GOOGLE_MY_BUSINESS" size="md" />,
      color: "blue",
      description: "Auto-sync reviews from Google",
    },
    {
      id: "FACEBOOK",
      name: "Facebook",
      icon: <PlatformIcon platform="FACEBOOK" size="md" />,
      color: "indigo",
      description: "Auto-sync reviews from Facebook",
    },
  ];

  useEffect(() => {
    if (selectedBusiness) {
      fetchPlatformData();
      if (activeTab === "auto-sync") {
        fetchConnectedPlatforms();
      }
      setLoading(false);
    } else {
      setLoading(false);
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

  // ← ADDED: Check URL for OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthSuccess = urlParams.get('oauth_success');
    const platform = urlParams.get('platform');

    if (oauthSuccess === 'true' && platform) {
      toast.success(`${platform} reconnected successfully!`);
      
      // Check if there's a pending sync to retry
      const pendingSyncId = sessionStorage.getItem('pendingSyncCredentialId');
      if (pendingSyncId) {
        const platformName = sessionStorage.getItem('pendingSyncPlatformName');
        sessionStorage.removeItem('pendingSyncCredentialId');
        sessionStorage.removeItem('pendingSyncPlatformName');
        
        // Auto-retry the sync that failed
        setTimeout(() => {
          handleSyncPlatform(pendingSyncId, platformName || platform);
        }, 1000);
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Refresh connected platforms
      fetchConnectedPlatforms();
    }
  }, []);

  const fetchPlatformData = async () => {
    if (!selectedBusiness) return;

    try {
      const response = await axios.get(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlatformData({
        googlePlaceId: response.data.googlePlaceId || "",
        googleReviewShortUrl: response.data.googleReviewShortUrl || "",
        facebookPageUrl: response.data.facebookPageUrl || "",
      });
    } catch (err) {
      console.error("Error fetching platform data:", err);
    }
  };

  const fetchConnectedPlatforms = async () => {
    if (!selectedBusiness) return;

    setSyncing(true);
    try {
      const response = await axios.get(
        buildUrl(`/api/v1/platforms/business/${selectedBusiness.id}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConnectedPlatforms(response.data);
    } catch (error) {
      console.error("Error fetching connected platforms:", error);
    } finally {
      setSyncing(false);
    }
  };

  const handleQuickSetupSave = async () => {
    if (!selectedBusiness) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        platformData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Review platform links saved successfully!");
      setSuccess("Review platform links saved successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to save platform links";
      toast.error(errorMsg);
      setError(errorMsg);
      console.error("Error saving platform data:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectPlatform = async (platformId) => {
    if (!selectedBusiness) return;

    try {
      const response = await axios.post(
        buildUrl("/api/v1/platforms/oauth/initiate"),
        {
          platform: platformId,
          businessId: selectedBusiness.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      toast.error("Failed to connect platform");
      console.error("Connection error:", error);
    }
  };

  const handleManualSync = async () => {
    if (!selectedBusiness) return;

    setSyncing(true);
    toast.loading("Syncing all platforms...");

    try {
      const syncPromises = connectedPlatforms
        .filter((p) => p.status === "ACTIVE")
        .map((p) =>
          axios.post(
            buildUrl(`/api/v1/platforms/${p.id}/sync`),
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

      await Promise.all(syncPromises);

      toast.success("All platforms synced successfully");
      fetchConnectedPlatforms();
    } catch (error) {
      toast.error("Failed to sync platforms");
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  // ← UPDATED: Enhanced sync handler with token expiration handling
  const handleSyncPlatform = async (credentialId, platformName) => {
    setSyncingPlatforms(prev => ({ ...prev, [credentialId]: true }));
    
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

        toast.success(message, { id: toastId, duration: 5000 });

        setTimeout(fetchConnectedPlatforms, 1000);
      }
    } catch (error) {
      console.error("Sync error:", error);

      // ← ADDED: Check for token expiration error
      if (error.response?.data?.error === 'TOKEN_EXPIRED') {
        const { platformType, credentialId: expiredCredId, message } = error.response.data;
        
        toast.error(message, { id: toastId });
        
        // Store pending sync info for auto-retry after reconnect
        sessionStorage.setItem('pendingSyncCredentialId', credentialId);
        sessionStorage.setItem('pendingSyncPlatformName', platformName);
        
        // Show reconnection modal
        setReconnectModal({
          isOpen: true,
          platformType,
          platformName,
          credentialId: expiredCredId,
          pendingSyncCredentialId: credentialId,
        });
      } else {
        // Generic error
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to sync reviews";

        toast.error(errorMsg, { id: toastId });
      }
    } finally {
      setSyncingPlatforms(prev => ({ ...prev, [credentialId]: false }));
    }
  };

  // ← ADDED: Handle platform reconnection
  const handleReconnectPlatform = async () => {
    if (!reconnectModal.platformType) return;

    try {
      const response = await axios.post(
        buildUrl("/api/v1/platforms/oauth/initiate"),
        {
          platform: reconnectModal.platformType,
          businessId: selectedBusiness.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.authUrl) {
        // Redirect to OAuth
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      toast.error("Failed to initiate reconnection");
      console.error("Reconnection error:", error);
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

  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto"
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
            No Business Selected
          </h2>
          <p className="text-gray-600 mb-6">
            Please select a business from the sidebar to manage review platforms.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ← ADDED: Reconnection Modal */}
      <ReconnectPlatformModal
        isOpen={reconnectModal.isOpen}
        onClose={() => setReconnectModal({ ...reconnectModal, isOpen: false })}
        platformType={reconnectModal.platformType}
        platformName={reconnectModal.platformName}
        onReconnect={handleReconnectPlatform}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review Platforms
        </h1>
        <p className="text-gray-600">
          Configure review platforms for <span className="font-semibold text-gray-900">{selectedBusiness.name}</span>
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
                🔄 Auto Sync
              </span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "quick-setup" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quick Setup
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add direct review links for each platform. These will be used
                  when sending review requests to your customers.
                </p>
              </div>

              {/* Google Places */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <PlatformIcon platform="GOOGLE_MY_BUSINESS" size="lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Google My Business
                    </h4>

                    {/* Google Place ID */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Place ID
                        <span className="text-gray-500 font-normal ml-2">
                          (We'll auto-generate your review link)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={platformData.googlePlaceId}
                        onChange={(e) =>
                          setPlatformData({
                            ...platformData,
                            googlePlaceId: e.target.value,
                          })
                        }
                        placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Find your Place ID at{" "}
                        <a
                          href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Google Place ID Finder
                        </a>
                      </p>
                    </div>

                    {/* OR divider */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-blue-50 text-gray-500">
                          OR
                        </span>
                      </div>
                    </div>

                    {/* Google Short URL */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Review Short URL
                        <span className="text-gray-500 font-normal ml-2">
                          (g.page link)
                        </span>
                      </label>
                      <input
                        type="url"
                        value={platformData.googleReviewShortUrl}
                        onChange={(e) =>
                          setPlatformData({
                            ...platformData,
                            googleReviewShortUrl: e.target.value,
                          })
                        }
                        placeholder="https://g.page/r/YOUR-SHORT-URL/review"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Find this link in your Google Business Profile under
                        "Get more reviews"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facebook */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <PlatformIcon platform="FACEBOOK" size="lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Facebook
                    </h4>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Page URL
                    </label>
                    <input
                      type="url"
                      value={platformData.facebookPageUrl}
                      onChange={(e) =>
                        setPlatformData({
                          ...platformData,
                          facebookPageUrl: e.target.value,
                        })
                      }
                      placeholder="https://www.facebook.com/YourBusinessPage"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={handleQuickSetupSave}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving..." : "Save Platform Links"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "auto-sync" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Connected Platforms
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automatically sync reviews from connected platforms
                  </p>
                </div>
                <button
                  onClick={handleManualSync}
                  disabled={syncing || connectedPlatforms.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {syncing ? "Syncing..." : "Sync All Now"}
                </button>
              </div>

              {/* Platform Connection Cards */}
              <div className="grid gap-4">
                {SUPPORTED_PLATFORMS.map((platform) => {
                  const connected = isConnected(platform.id);
                  const connectedPlatform = getConnectedPlatform(platform.id);
                  const isSyncing = syncingPlatforms[connectedPlatform?.id];
                  
                  // ← ADDED: Check if platform is expired
                  const isExpired = connectedPlatform?.status === 'EXPIRED';

                  return (
                    <div
                      key={platform.id}
                      className={`border rounded-lg p-6 ${
                        isExpired 
                          ? "border-yellow-300 bg-yellow-50"
                          : connected
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">{platform.icon}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {platform.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {platform.description}
                            </p>
                            {connected && connectedPlatform && (
                              <div className="space-y-1 text-sm">
                                <p className="text-gray-700">
                                  <span className="font-medium">Status:</span>{" "}
                                  {isExpired ? (
                                    <span className="text-yellow-600 font-semibold">
                                      Expired - Reconnect Required ⚠️
                                    </span>
                                  ) : (
                                    <span className="text-green-600 font-semibold">
                                      Connected ✓
                                    </span>
                                  )}
                                </p>
                                {connectedPlatform.lastSyncAt && (
                                  <p className="text-gray-600">
                                    Last synced:{" "}
                                    {new Date(
                                      connectedPlatform.lastSyncAt
                                    ).toLocaleString()}
                                  </p>
                                )}
                                {isExpired && connectedPlatform.syncErrorMessage && (
                                  <p className="text-yellow-700 text-xs mt-2">
                                    {connectedPlatform.syncErrorMessage}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {connected ? (
                            <>
                              {isExpired ? (
                                <button
                                  onClick={() => handleConnectPlatform(platform.id)}
                                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors"
                                >
                                  Reconnect
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleSyncPlatform(
                                      connectedPlatform.id,
                                      platform.name
                                    )
                                  }
                                  disabled={isSyncing}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isSyncing ? "Syncing..." : "Sync Now"}
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDisconnect(connectedPlatform.id)
                                }
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                              >
                                Disconnect
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                handleConnectPlatform(platform.id)
                              }
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {connectedPlatforms.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-gray-400 text-5xl mb-4">🔌</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Platforms Connected
                  </h3>
                  <p className="text-gray-600">
                    Connect a platform above to start auto-syncing reviews
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPlatformsPage;