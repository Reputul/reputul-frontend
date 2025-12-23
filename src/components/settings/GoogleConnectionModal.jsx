// src/components/settings/GoogleConnectionModal.jsx
// Modal for connecting Google Business Profile via manual URL input

import React, { useState } from "react";
import { X, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import { buildUrl } from "../../config/api";

const GoogleConnectionModal = ({ isOpen, onClose, business, onSuccess }) => {
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Validate Google Maps URL
  const validateGoogleMapsUrl = (url) => {
    // Check if URL contains google.com/maps or goo.gl
    return (
      url.includes("google.com/maps") ||
      url.includes("goo.gl/maps") ||
      url.includes("maps.app.goo.gl")
    );
  };

  // Handle connection
  const handleConnect = async () => {
    setError(null);

    // Validate URL
    if (!googleMapsUrl.trim()) {
      setError("Please enter your Google Maps URL");
      return;
    }

    if (!validateGoogleMapsUrl(googleMapsUrl)) {
      setError("Invalid Google Maps URL. Please check and try again.");
      return;
    }

    setLoading(true);

    try {
      // FIXED: Use your actual endpoint that exists
      const response = await axios.put(
        buildUrl(`/api/v1/businesses/${business.id}/review-platforms`),
        {
          googlePlaceId: null, // Will be auto-detected by backend if possible
          googleReviewShortUrl: googleMapsUrl.trim(), // Your backend supports this field
          facebookPageUrl: null,
          yelpPageUrl: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Show success
      setSuccess(true);

      // Wait a bit then close
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error("Error connecting Google:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            How would you like to link your Google listing?
          </h2>

          {/* Option 1: OAuth (Disabled - Coming Soon) */}
          <div className="mb-6">
            <button
              disabled
              className="w-full bg-black text-white rounded-full py-4 px-6 flex items-center justify-center gap-3 opacity-40 cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
            <p className="text-sm text-gray-600 text-center mt-2">
              This method will allow you to respond to Google reviews from your dashboard.
            </p>
            <p className="text-xs text-purple-600 text-center mt-1 font-medium">
              Full Google integration coming soon!
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">OR</span>
            </div>
          </div>

          {/* Option 2: Manual URL Input */}
          <div className="space-y-4">
            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-900">
                  <p className="font-medium mb-1">
                    Start collecting reviews now
                  </p>
                  <p className="text-green-700">
                    Paste your Google Maps URL below. We'll use this to create
                    review collection links for your customers.
                  </p>
                </div>
              </div>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps URL
              </label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <input
                  type="text"
                  placeholder="https://maps.app.goo.gl/..."
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* How to find URL */}
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                How to find your Google Maps URL
              </summary>
              <ol className="mt-2 space-y-1 text-gray-600 list-decimal list-inside">
                <li>Search for your business on Google Maps</li>
                <li>Click the "Share" button</li>
                <li>Copy the link</li>
                <li>Paste it above</li>
              </ol>
            </details>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Google account connected successfully!
                </p>
              </div>
            )}

            {/* Connect Button */}
            <button
              onClick={handleConnect}
              disabled={loading || success}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-3 px-6 font-semibold transition-colors"
            >
              {loading ? "Connecting..." : success ? "Connected!" : "Connect Google"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleConnectionModal;