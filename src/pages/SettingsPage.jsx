// src/pages/SettingsPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { 
  Info, 
  ExternalLink, 
  MoreVertical, 
  GripVertical,
  CheckCircle2,
  Clock
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { buildUrl } from "../config/api";
import AddAccountsModal from "../components/settings/AddAccountsModal";
import PlatformIcon from "../components/PlatformIcon";

// Sortable Platform Card Component
const SortablePlatformCard = ({ platform, onDisconnect }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: platform.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Determine status color
  const getStatusColor = () => {
    if (platform.status === 'EXPIRED') return 'text-yellow-600';
    if (platform.status === 'ERROR') return 'text-red-600';
    if (platform.status === 'ACTIVE') return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (platform.status === 'EXPIRED') return '⚠️';
    if (platform.status === 'ERROR') return '❌';
    if (platform.status === 'ACTIVE') return '✓';
    return '○';
  };

  // Get display name for platform
  const getPlatformName = () => {
    const names = {
      'GOOGLE_MY_BUSINESS': 'Google Business Profile',
      'FACEBOOK': 'Facebook',
      'YELP': 'Yelp',
      'TRUSTPILOT': 'Trustpilot',
    };
    return names[platform.platform] || platform.platform;
  };

  // Get description for platform
  const getDescription = () => {
    const descriptions = {
      'GOOGLE_MY_BUSINESS': 'Auto-sync reviews from Google Business Profile',
      'FACEBOOK': 'Ensure the "Reviews" tab is enabled for your Facebook page',
      'YELP': 'Auto-sync reviews from Yelp',
      'TRUSTPILOT': 'Auto-sync reviews from Trustpilot',
    };
    return descriptions[platform.platform] || 'Connected review platform';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>

        {/* Connected Checkmark */}
        <div className="flex-shrink-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            platform.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Platform Icon */}
        <div className="flex-shrink-0">
          <PlatformIcon platform={platform.platform} size="md" />
        </div>

        {/* Platform Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{getPlatformName()}</h4>
          <p className="text-sm text-gray-500">{getDescription()}</p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Last Sync Status */}
          <div className={`flex items-center gap-1 text-xs ${getStatusColor()}`}>
            <span>{getStatusIcon()}</span>
          </div>

          {/* More Menu with Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Options"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDisconnect(platform.id);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Last Sync Time */}
      {platform.lastSyncAt && (
        <div className="mt-2 ml-[52px] flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>Last synced {formatLastSync(platform.lastSyncAt)}</span>
        </div>
      )}

      {/* Connection Method Badge */}
      {platform.connectionMethod && (
        <div className="mt-2 ml-[52px]">
          {platform.connectionMethod === 'OAUTH' ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
              Fast Sync (15 mins)
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
              Standard Sync (2 hours)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to format last sync time
const formatLastSync = (timestamp) => {
  const now = new Date();
  const syncTime = new Date(timestamp);
  const diffMs = now - syncTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

// Main Settings Page Component
const SettingsPage = () => {
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();
  
  const [showAddAccounts, setShowAddAccounts] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);

  // Quick Setup (Manual Links) state
  const [platformData, setPlatformData] = useState({
    googlePlaceId: "",
    googleReviewShortUrl: "",
    facebookPageUrl: "",
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch connected platforms and platform links on mount
  useEffect(() => {
    if (selectedBusiness) {
      fetchConnectedPlatforms();
      fetchPlatformLinks();
    }
  }, [selectedBusiness]);

  const fetchConnectedPlatforms = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    try {
      const response = await axios.get(
        buildUrl(`/api/v1/platforms/business/${selectedBusiness.id}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Sort by display order if available
      const sorted = response.data.sort((a, b) => 
        (a.displayOrder || 0) - (b.displayOrder || 0)
      );
      
      setConnectedPlatforms(sorted);
    } catch (error) {
      console.error("Error fetching connected platforms:", error);
      toast.error("Failed to load connected platforms");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatformLinks = async () => {
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
      console.error("Error fetching platform links:", err);
    }
  };

  const handleSaveLinks = async () => {
    if (!selectedBusiness) return;

    setSavingLinks(true);

    try {
      await axios.put(
        buildUrl(`/api/v1/businesses/${selectedBusiness.id}/review-platforms`),
        platformData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Review platform links saved successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save platform links";
      toast.error(errorMsg);
      console.error("Error saving platform links:", err);
    } finally {
      setSavingLinks(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = connectedPlatforms.findIndex((p) => p.id === active.id);
      const newIndex = connectedPlatforms.findIndex((p) => p.id === over.id);

      const reordered = arrayMove(connectedPlatforms, oldIndex, newIndex);
      setConnectedPlatforms(reordered);

      // Save new order to backend (if you implement this endpoint)
      try {
        await axios.put(
          buildUrl(`/api/v1/platforms/business/${selectedBusiness.id}/reorder`),
          { platformIds: reordered.map(p => p.id) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Platform order updated");
      } catch (error) {
        console.error("Error updating platform order:", error);
        toast.error("Failed to update order");
        // Revert on error
        fetchConnectedPlatforms();
      }
    }
  };

  const handleDisconnect = async (platformId) => {
    if (!window.confirm("Are you sure you want to disconnect this platform?")) {
      return;
    }

    try {
      await axios.delete(
        buildUrl(`/api/v1/platforms/${platformId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Platform disconnected");
      fetchConnectedPlatforms();
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      toast.error("Failed to disconnect platform");
    }
  };

  const handleConnect = () => {
    // Refresh after connecting
    fetchConnectedPlatforms();
  };

  // Extract platform IDs for connectedPlatforms prop
  const connectedPlatformIds = connectedPlatforms.map(p => {
    const typeMap = {
      'GOOGLE_MY_BUSINESS': 'google',
      'FACEBOOK': 'facebook',
      'YELP': 'yelp',
      'TRUSTPILOT': 'trustpilot',
    };
    return typeMap[p.platform] || p.platform.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Manage Review Profiles Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Review Profiles
              </h2>
            </div>
            <button
              onClick={() => setShowAddAccounts(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              ADD ACCOUNTS
            </button>
          </div>

          {/* MY CONNECTED ACCOUNTS */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                My Connected Accounts
              </h3>
              <div className="relative">
                <button
                  onMouseEnter={() => setShowInfoTooltip(true)}
                  onMouseLeave={() => setShowInfoTooltip(false)}
                  className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                >
                  ?
                </button>
                
                {/* Info Tooltip */}
                {showInfoTooltip && (
                  <div className="absolute left-0 top-8 z-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-700">
                      These are the websites where your customers can leave a review. 
                      Drag and move them to rearrange the order in which they appear 
                      in your review request.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Connected Platforms List with Drag & Drop */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-2">Loading platforms...</p>
              </div>
            ) : connectedPlatforms.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-400 text-5xl mb-4">🔌</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Accounts Connected
                </h3>
                <p className="text-gray-600 mb-4">
                  Connect a review platform to start collecting reviews
                </p>
                <button
                  onClick={() => setShowAddAccounts(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Connect Your First Platform
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={connectedPlatforms.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {connectedPlatforms.map((platform) => (
                      <SortablePlatformCard
                        key={platform.id}
                        platform={platform}
                        onDisconnect={handleDisconnect}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>

      {/* Quick Setup - Manual Review Links Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quick Setup - Manual Review Links
            </h2>
            <p className="text-sm text-gray-600">
              Configure direct links to your review profiles for use in review request emails and SMS.
            </p>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Quick Setup vs. Connected Accounts</p>
              <p className="text-blue-700">
                <strong>Connected Accounts (above):</strong> OAuth connections for automatic review syncing. 
                <strong className="ml-1">Quick Setup (below):</strong> Manual links used in your review request templates.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Google */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <PlatformIcon platform="GOOGLE_MY_BUSINESS" size="lg" />
                </div>
                <div className="flex-1 space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Google Business Profile
                  </h3>

                  {/* Place ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Place ID{" "}
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        How to find
                      </a>
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used to generate direct review links
                    </p>
                  </div>

                  {/* Review Short URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Google Review Short URL (Optional)
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find this link in your Google Business Profile under "Get more reviews"
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
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    Facebook
                  </h3>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customers will be directed to your Facebook page to leave a review
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Changes will apply to new review requests
            </p>
            <button
              onClick={handleSaveLinks}
              disabled={savingLinks}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {savingLinks ? "Saving..." : "Save Platform Links"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Accounts Modal */}
      <AddAccountsModal
        isOpen={showAddAccounts}
        onClose={() => {
          setShowAddAccounts(false);
          fetchConnectedPlatforms(); // Refresh after modal closes
        }}
        business={selectedBusiness}
        connectedPlatforms={connectedPlatformIds}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default SettingsPage;