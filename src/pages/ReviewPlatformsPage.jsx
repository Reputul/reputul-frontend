// src/pages/ReviewPlatformsPage_Simplified.jsx
// Simplified version with only Quick Setup (no Auto-Sync tab)

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { API_ENDPOINTS, buildUrl } from "../config/api";
import PlatformIcon from "../components/PlatformIcon";
import { ExternalLink, Info } from "lucide-react";

const ReviewPlatformsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const successRef = useRef(null);
  const { token } = useAuth();
  const { selectedBusiness } = useBusiness();

  // Platform configuration state
  const [platformData, setPlatformData] = useState({
    googlePlaceId: "",
    googleReviewShortUrl: "",
    facebookPageUrl: "",
  });

  useEffect(() => {
    if (selectedBusiness) {
      fetchPlatformData();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [selectedBusiness]);

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
      setPlatformData({
        googlePlaceId: response.data.googlePlaceId || "",
        googleReviewShortUrl: response.data.googleReviewShortUrl || "",
        facebookPageUrl: response.data.facebookPageUrl || "",
      });
    } catch (err) {
      console.error("Error fetching platform data:", err);
    }
  };

  const handleSave = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedBusiness) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          No Business Selected
        </h2>
        <p className="text-gray-600">
          Please select a business to configure review platforms.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review Platform Links
        </h1>
        <p className="text-gray-600">
          Configure direct links to your review profiles for use in review request emails and SMS.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">Quick Setup vs. Auto-Sync</p>
          <p className="text-blue-700">
            This page is for configuring <strong>manual review links</strong> used in your review request templates.
            For automatic review syncing, visit{" "}
            <Link to="/settings" className="underline font-semibold hover:text-blue-800">
              Settings → Manage Review Profiles
            </Link>.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div
          ref={successRef}
          tabIndex={-1}
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Platform Configuration Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 space-y-6">
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

          {/* Yelp - Coming Soon */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 opacity-60">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                  🔴
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg">Yelp</h3>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded">
                    COMING SOON
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Yelp integration will be available in a future update
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
          <p className="text-sm text-gray-600">
            Changes will apply to new review requests
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving..." : "Save Platform Links"}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>What's the difference between this and Settings?</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Quick Setup (this page):</strong> Manual configuration of review links
              used in your email/SMS templates
            </li>
            <li>
              <strong>Settings → Manage Review Profiles:</strong> OAuth connections for
              automatic review syncing and responding to reviews from your dashboard
            </li>
          </ul>
          <p className="mt-4">
            For most users, connecting platforms via{" "}
            <Link to="/settings" className="text-blue-600 hover:underline font-semibold">
              Settings
            </Link>{" "}
            is recommended as it enables automatic syncing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewPlatformsPage;