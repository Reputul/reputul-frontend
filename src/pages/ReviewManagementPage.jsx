import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useBusiness } from "../context/BusinessContext";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { buildUrl, API_ENDPOINTS } from "../config/api";

const ReviewManagementPage = () => {
  const { token } = useAuth();
  const { selectedBusiness, businesses, loading: businessesLoading } = useBusiness();
  const navigate = useNavigate();

  // State
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    source: "all", // all, GOOGLE, FACEBOOK, YELP, manual
    rating: "all", // all, 1, 2, 3, 4, 5
    sortBy: "createdAt", // createdAt, rating
    sortOrder: "desc" // desc, asc
  });

  // Fetch reviews when business or filters change
  useEffect(() => {
    if (selectedBusiness) {
      fetchReviews();
    } else {
      setReviews([]);
    }
  }, [selectedBusiness, filters]);

  const fetchReviews = useCallback(async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        sortBy: filters.sortBy,
        sortDir: filters.sortOrder
      });

      const response = await axios.get(
        buildUrl(`/api/v1/reviews/business/${selectedBusiness.id}?${params}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let reviewsData = response.data || [];

      // Apply client-side filters
      if (filters.source !== "all") {
        reviewsData = reviewsData.filter(review => review.source === filters.source);
      }

      if (filters.rating !== "all") {
        reviewsData = reviewsData.filter(review => review.rating === parseInt(filters.rating));
      }

      setReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, filters, token]);

  const handleDeleteReview = async (reviewId) => {
    if (!selectedBusiness) return;

    try {
      await axios.delete(
        buildUrl(`/api/v1/reviews/${reviewId}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Review deleted successfully");
      setReviews(reviews.filter(r => r.id !== reviewId));
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to delete review");
    }
  };

  const confirmDeleteReview = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  // Components
  const StarRating = ({ rating, showCount = false }) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
        {showCount && <span className="text-sm text-gray-500">({rating})</span>}
      </div>
    );
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "GOOGLE": return "🔍";
      case "FACEBOOK": return "📘";
      case "YELP": return "🔴";
      case "manual": return "✏️";
      default: return "⭐";
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case "GOOGLE": return "Google";
      case "FACEBOOK": return "Facebook";
      case "YELP": return "Yelp";
      case "manual": return "Manual";
      default: return "Review";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
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

  // No business selected
  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Business</h3>
            <p className="text-gray-600 mb-6">
              Please select a business from the sidebar to manage its reviews.
            </p>
            {businesses.length === 0 ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
              >
                Create Your First Business
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Use the business selector in the sidebar to choose which business to manage.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Business Context Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedBusiness.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
                  <p className="text-gray-600">
                    Manage reviews for <span className="font-semibold">{selectedBusiness.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/review-requests')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Request Reviews</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Sources</option>
                <option value="GOOGLE">Google</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="YELP">Yelp</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">Date</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {loading ? "Loading..." : `${reviews.length} Review${reviews.length !== 1 ? 's' : ''}`}
              </h2>
            </div>
          </div>

          {/* Reviews */}
          <div>
            {loading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-6 border-b border-gray-100 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : reviews.length === 0 ? (
              // Empty state
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Found</h3>
                <p className="text-gray-500 mb-6">
                  {filters.source !== "all" || filters.rating !== "all" 
                    ? "Try adjusting your filters to see more reviews."
                    : "Start collecting reviews to build your reputation."
                  }
                </p>
                <button
                  onClick={() => navigate('/review-requests')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Request Reviews</span>
                </button>
              </div>
            ) : (
              // Reviews list
              reviews.map((review) => (
                <div key={review.id} className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <StarRating rating={review.rating} showCount />
                        <span className="text-sm text-gray-500 flex items-center space-x-1">
                          <span>{getSourceIcon(review.source)}</span>
                          <span>{getSourceLabel(review.source)}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {review.customerName || "Anonymous Customer"}
                        </h4>
                        {review.customerEmail && (
                          <p className="text-sm text-gray-500">{review.customerEmail}</p>
                        )}
                      </div>

                      {review.comment && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">
                            "{review.comment}"
                          </p>
                        </div>
                      )}

                      {review.source !== "manual" && review.sourceReviewUrl && (
                        <div className="mt-3">
                          <a
                            href={review.sourceReviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View Original Review →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-start space-x-2">
                      <button
                        onClick={() => confirmDeleteReview(review)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && reviewToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review from{" "}
              <span className="font-semibold">{reviewToDelete.customerName || "Anonymous Customer"}</span>?
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReviewToDelete(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteReview(reviewToDelete.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagementPage;