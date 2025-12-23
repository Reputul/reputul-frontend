// src/components/settings/AddAccountsModal.jsx
// Modal for connecting review platforms (Google, Facebook, etc.)

import React, { useState } from "react";
import { X, Search, ExternalLink } from "lucide-react";
import axios from "axios";
import { buildUrl } from "../../config/api";
import GoogleConnectionModal from "./GoogleConnectionModal";

const AddAccountsModal = ({ isOpen, onClose, business, connectedPlatforms = [], onConnect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  // Platform definitions
  const platforms = [
    {
      id: "reputul",
      name: "Reputul Business Profile",
      description: "Let customers leave a review on Reputul.",
      logo: "💬", // Replace with your logo
      color: "#6366F1",
      available: true,
      helpLink: "/help/reputul-reviews",
      helpText: "See my profile",
    },
    {
      id: "google",
      name: "Google Business Profile",
      description: "Use the email associated with your Google Business Profile.",
      logo: "https://www.google.com/favicon.ico", // Google logo
      color: "#4285F4",
      available: true,
      helpLink: "/help/google-connection",
      helpText: "How to connect Google Business Profile",
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Ensure the 'Reviews' tab is enabled for your Facebook page.",
      logo: "https://www.facebook.com/favicon.ico", // Facebook logo
      color: "#1877F2",
      available: true,
      helpLink: "/help/facebook-connection",
      helpText: "How to connect Facebook",
    },
    {
      id: "yelp",
      name: "Yelp",
      description: "Connect your Yelp business page to sync reviews.",
      logo: "https://www.yelp.com/favicon.ico",
      color: "#D32323",
      available: false, // Coming soon
      helpLink: "/help/yelp-connection",
      helpText: "Coming soon",
    },
  ];

  // Filter platforms by search query
  const filteredPlatforms = platforms.filter((platform) =>
    platform.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if platform is connected
  const isPlatformConnected = (platformId) => {
    return connectedPlatforms.includes(platformId);
  };

  // Handle connect button click
  const handleConnect = async (platform) => {
    if (platform.id === "google") {
      // Open Google connection sub-modal (manual URL method)
      setConnectingPlatform("google");
    } else if (platform.id === "facebook") {
      // FIXED: Trigger OAuth flow for Facebook
      try {
        const response = await axios.get(
          buildUrl(`/api/v1/platforms/connect/facebook?businessId=${business.id}`),
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}` 
            } 
          }
        );
        
        if (response.data.authUrl) {
          // Redirect to Facebook OAuth
          window.location.href = response.data.authUrl;
        } else {
          console.error("No auth URL returned");
          alert("Failed to connect Facebook. Please try again.");
        }
      } catch (error) {
        console.error("Error connecting Facebook:", error);
        alert(
          error.response?.data?.error || 
          "Failed to connect Facebook. Please try again."
        );
      }
    } else {
      // For other platforms, just call onConnect
      onConnect?.(platform.id);
    }
  };

  // Handle disconnect
  const handleDisconnect = async (platformId) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platformId}?`)) {
      return;
    }

    try {
      // TODO: Call API to disconnect platform
      // You'll need to find the credential ID from connectedPlatforms
      // await axios.delete(buildUrl(`/api/v1/platforms/${credentialId}`), ...)
      
      onClose();
      onConnect?.(platformId); // Refresh the list
    } catch (error) {
      console.error("Error disconnecting platform:", error);
      alert("Failed to disconnect platform. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-purple-700">Add Accounts</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for review websites"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Platform List */}
          <div className="p-6 space-y-4 overflow-y-auto max-h-96">
            {filteredPlatforms.map((platform) => {
              const isConnected = isPlatformConnected(platform.id);

              return (
                <div
                  key={platform.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  {/* Platform Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      {typeof platform.logo === "string" &&
                      platform.logo.startsWith("http") ? (
                        <img
                          src={platform.logo}
                          alt={platform.name}
                          className="w-12 h-12 rounded-lg"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${platform.color}20` }}
                        >
                          {platform.logo}
                        </div>
                      )}
                    </div>

                    {/* Name & Description */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {platform.description}
                      </p>
                      <a
                        href={platform.helpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-1"
                      >
                        {platform.helpText}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Integration Active Indicator */}
                    {isConnected && (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                      </div>
                    )}

                    {/* Connect/Disconnect Button */}
                    {!platform.available ? (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-semibold">
                        Coming Soon
                      </span>
                    ) : isConnected ? (
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        DISCONNECT
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(platform)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        CONNECT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredPlatforms.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No platforms found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Google Connection Sub-Modal */}
      {connectingPlatform === "google" && (
        <GoogleConnectionModal
          isOpen={true}
          onClose={() => setConnectingPlatform(null)}
          business={business}
          onSuccess={() => {
            setConnectingPlatform(null);
            onClose();
          }}
        />
      )}

      {/* Facebook Connection Sub-Modal - Not needed, uses OAuth redirect */}
    </>
  );
};

export default AddAccountsModal;