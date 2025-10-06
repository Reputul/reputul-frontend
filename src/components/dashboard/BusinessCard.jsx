import React from "react";
import { useNavigate } from "react-router-dom";
import WilsonRating from "../WilsonRating";
import CircularProgress from "./CircularProgress";
import ReviewForm from "./ReviewForm";

const BusinessCard = React.memo(
  ({
    business,
    reviewSummaries,
    reviewsMap,
    wilsonBreakdowns,
    token,
    handleEditBusiness,
    copyPublicLink,
    handleDeleteBusiness,
    handleShowReputationBreakdown,
    fetchBusinesses,
    fetchMetrics,
  }) => {
    const navigate = useNavigate();

    const getBadgeColor = (badge) => {
      if (badge === "Top Rated") return "bg-green-100 text-green-800";
      if (badge === "Rising Star") return "bg-yellow-100 text-yellow-800";
      return "bg-gray-100 text-gray-800";
    };

    const summary = reviewSummaries[business.id];
    const reviews = reviewsMap[business.id] || [];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <div className="flex-1 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full min-w-0">
              {business.logoUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={business.logoUrl}
                    alt={`${business.name} logo`}
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white p-2"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors break-words">
                    {business.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 self-start ${getBadgeColor(
                      business.badge
                    )}`}
                  >
                    {business.badge}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 break-words">
                  {business.industry}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-500">
                  <span className="truncate">{business.phone}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="truncate">{business.website}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 self-end sm:self-start">
              <button
                onClick={() => handleEditBusiness(business)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => copyPublicLink(business.id)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-4M14 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDeleteBusiness(business.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {!business.reviewPlatformsConfigured && (
            <div className="bg-white/90 backdrop-blur-xl border-2 border-dashed border-amber-300 rounded-xl p-3 sm:p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-full mr-3 flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-amber-800">
                    Platform setup needed
                  </span>
                </div>
                <button
                  onClick={() => navigate("/review-platform-setup")}
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-md font-medium transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Configure
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="flex items-center justify-center mb-2 min-w-0 max-w-full">
                {wilsonBreakdowns[business.id] ? (
                  <div className="scale-75 sm:scale-100 origin-center">
                    <WilsonRating
                      rating={wilsonBreakdowns[business.id].reputulRating}
                      totalReviews={wilsonBreakdowns[business.id].totalReviews}
                      size="md"
                      showNumber={true}
                      showConfidence={true}
                    />
                  </div>
                ) : (
                  <CircularProgress
                    rating={
                      summary
                        ? summary.averageRating
                        : business.reputationScore || 0
                    }
                    size={48}
                  />
                )}
              </div>
              <p className="text-xs sm:text-sm font-medium text-yellow-700 px-1">
                Customer Rating
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl border border-primary-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center mb-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-xl sm:text-2xl font-bold text-primary-600">
                  {summary ? summary.totalReviews : business.reviewCount || 0}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-primary-700">
                Total Reviews
              </p>
            </div>

            <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-center mb-2">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {wilsonBreakdowns[business.id]
                      ? Math.round(wilsonBreakdowns[business.id].compositeScore)
                      : business.reputationScore || 0}
                  </div>
                  <div className="text-xs text-purple-500">Score</div>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 truncate">
                {business.badge || "Unranked"}
              </p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Recent Reviews
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="text-yellow-500 text-sm">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1 break-words">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ReviewForm
            businessId={business.id}
            token={token}
            fetchBusinesses={fetchBusinesses}
            fetchMetrics={fetchMetrics}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => window.open(`/business/${business.id}`, "_blank")}
              className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 group text-sm sm:text-base"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Analytics</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path
                    d="M9 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <button
              onClick={() => handleShowReputationBreakdown(business)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
            >
              Reputation
            </button>

            {business.reviewPlatformsConfigured ? (
              <button
                onClick={() => {
                  const reviewForm = document.querySelector(
                    `#review-form-${business.id}`
                  );
                  if (reviewForm) {
                    reviewForm.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                    reviewForm.querySelector("select").focus();
                  }
                }}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
              >
                Add Review
              </button>
            ) : (
              <button
                onClick={() => navigate("/review-platform-setup")}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-2.5 sm:py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 text-sm sm:text-base"
              >
                Setup First
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default BusinessCard;
