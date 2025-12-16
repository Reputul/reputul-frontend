import React from 'react';
import { Link } from 'react-router-dom';
import PlatformIcon from '../PlatformIcon'; // ← ADDED: Platform icon component

const LatestReviewsList = ({ reviews, loading, businessId }) => {
  // Get platform info with modern colors
  const getPlatformInfo = (source) => {
    const platforms = {
      'GOOGLE': { 
        name: 'Google', 
        id: 'GOOGLE_MY_BUSINESS',
        color: 'text-blue-600', 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600' 
      },
      'GOOGLE_MY_BUSINESS': { 
        name: 'Google', 
        id: 'GOOGLE_MY_BUSINESS',
        color: 'text-blue-600', 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600' 
      },
      'FACEBOOK': { 
        name: 'Facebook', 
        id: 'FACEBOOK',
        color: 'text-blue-700', 
        bg: 'bg-gradient-to-r from-blue-600 to-blue-700' 
      },
      'REPUTUL': { 
        name: 'Reputul', 
        id: 'REPUTUL',
        color: 'text-purple-600', 
        bg: 'bg-gradient-to-r from-purple-500 to-pink-500' 
      },
      'DIRECT': { 
        name: 'Direct', 
        id: 'REPUTUL',  // Use Reputul logo for direct reviews too
        color: 'text-green-600', 
        bg: 'bg-gradient-to-r from-green-500 to-emerald-500' 
      },
    };
    return platforms[source?.toUpperCase()] || { 
      name: source || 'Unknown',
      id: 'REPUTUL',  // Default to Reputul logo for unknown sources
      color: 'text-gray-600', 
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600' 
    };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Render stars with gradient
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Skeleton loader
  const ReviewSkeleton = () => (
    <div className="p-6 border-b border-gray-100 last:border-b-0 animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
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
            to="/reviews"
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
          // Empty state
          <EmptyState />
        ) : (
          // Actual reviews
          reviews.slice(0, 5).map((review, index) => {
            const platformInfo = getPlatformInfo(review.source);
            
            return (
              <div key={review.id} className={`p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 ${index !== reviews.length - 1 && index !== 4 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-start space-x-4">
                  {/* Reviewer Avatar with initials (REVERTED) */}
                  <div className={`w-12 h-12 ${platformInfo.bg} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-white font-bold text-lg">
                      {review.reviewerName?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header: Name, Rating, Date */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-lg">
                          {review.reviewerName || 'Facebook User'}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          {renderStars(review.rating)}
                          {/* UPDATED: Platform logo badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                            <PlatformIcon platform={platformInfo.id || 'REPUTUL'} size="sm" className="flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-700">
                              {platformInfo.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-400 ml-4 flex-shrink-0 font-medium">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Review Title (if exists) */}
                    {review.title && (
                      <p className="font-semibold text-gray-900 text-base mt-3">
                        {review.title}
                      </p>
                    )}

                    {/* Review Comment */}
                    {review.comment && (
                      <p className="text-gray-600 mt-2 leading-relaxed line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LatestReviewsList;