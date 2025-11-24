import React from "react";
import { Link } from "react-router-dom";

const LatestReviewsList = ({ reviews, loading, onSelectReview }) => {
  // Star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  // Review item component
  const ReviewItem = ({ review }) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const getSourceIcon = (source) => {
      switch (source) {
        case "GOOGLE":
          return "🔍";
        case "FACEBOOK":
          return "📘";
        case "YELP":
          return "🔴";
        case "manual":
          return "✏️";
        default:
          return "⭐";
      }
    };

    const getSourceLabel = (source) => {
      switch (source) {
        case "GOOGLE":
          return "Google";
        case "FACEBOOK":
          return "Facebook";
        case "YELP":
          return "Yelp";
        case "manual":
          return "Manual";
        default:
          return "Review";
      }
    };

    return (
      <div
        className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
        onClick={() => onSelectReview && onSelectReview(review)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-500">
                {getSourceIcon(review.source)} {getSourceLabel(review.source)}
              </span>
              <span className="text-sm text-gray-400">
                {formatDate(review.createdAt)}
              </span>
            </div>
            <div className="mb-2">
              <h4 className="font-semibold text-gray-900">
                {review.customerName || "Anonymous Customer"}
              </h4>
            </div>
            {review.comment && (
              <p className="text-gray-700 text-sm leading-relaxed">
                {review.comment.length > 150
                  ? `${review.comment.substring(0, 150)}...`
                  : review.comment}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading skeleton
  const ReviewSkeleton = () => (
    <div className="p-6 border-b border-gray-100 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
      <p className="text-gray-500 mb-6">Start collecting reviews to build your reputation</p>
      <Link
        to="/review-requests"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Request Reviews</span>
      </Link>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between p-8 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Latest Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">Most recent customer feedback</p>
        </div>
        {reviews && reviews.length > 0 && (
          <Link
            to="/review-management"
            className="px-4 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
          >
            View All →
          </Link>
        )}
      </div>

      {/* Reviews List */}
      <div>
        {loading ? (
          // Loading skeletons
          <>
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
          </>
        ) : !reviews || reviews.length === 0 ? (
          <EmptyState />
        ) : (
          // Display reviews
          reviews.slice(0, 5).map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        )}
      </div>
    </div>
  );
};

export default LatestReviewsList;