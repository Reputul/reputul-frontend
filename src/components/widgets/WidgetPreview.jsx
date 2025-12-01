// src/components/widgets/WidgetPreview.jsx
// Live preview of widget with mock data

import React from "react";

const WidgetPreview = ({ widgetType, config, business }) => {
  // Mock review data for preview
  const mockReviews = [
    {
      id: 1,
      rating: 5,
      comment: "Absolutely fantastic service! The team was professional and completed the work ahead of schedule. Highly recommend!",
      reviewerName: "Sarah Johnson",
      reviewerInitials: "SJ",
      platform: "google",
      relativeTime: "2 days ago",
    },
    {
      id: 2,
      rating: 5,
      comment: "Best experience I've had with any contractor. Fair pricing, great communication, and quality work.",
      reviewerName: "Michael Chen",
      reviewerInitials: "MC",
      platform: "facebook",
      relativeTime: "1 week ago",
    },
    {
      id: 3,
      rating: 4,
      comment: "Very satisfied with the results. Would definitely use again for future projects.",
      reviewerName: "Emily Davis",
      reviewerInitials: "ED",
      platform: "google",
      relativeTime: "2 weeks ago",
    },
  ];

  const mockBusiness = business || {
    name: "Demo Business",
    rating: 4.8,
    totalReviews: 127,
    badge: "Top Rated",
  };

  const isDark = config.theme === "dark";
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const mutedColor = isDark ? "text-gray-400" : "text-gray-600";

  // Render star rating
  const renderStars = (rating, size = "w-4 h-4") => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${size} ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  // Badge component
  const renderBadge = () => (
    <span
      className="px-2 py-1 text-xs font-semibold rounded-full"
      style={{
        background: `linear-gradient(135deg, ${config.primaryColor}, ${config.accentColor})`,
        color: "white",
      }}
    >
      {mockBusiness.badge}
    </span>
  );

  // Platform icon
  const getPlatformIcon = (platform) => {
    if (platform === "google") {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  };

  // POPUP Preview
  if (widgetType === "POPUP") {
    const positionClasses = {
      "bottom-right": "bottom-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
    };

    return (
      <div className="relative bg-gray-100 rounded-xl p-4 min-h-[400px] overflow-hidden">
        <div className="text-center text-gray-400 text-sm mb-4">Website Preview</div>
        <div className="bg-white rounded-lg h-48 border border-gray-200 mb-4 flex items-center justify-center text-gray-300">
          Your Website Content
        </div>

        {/* Popup Widget */}
        <div className={`absolute ${positionClasses[config.position] || "bottom-4 right-4"}`}>
          <div
            className={`${bgColor} rounded-lg shadow-xl p-4 max-w-xs border border-gray-200`}
            style={{ borderRadius: `${config.borderRadius}px` }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: config.primaryColor }}
              >
                {mockReviews[0].reviewerInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {config.showReviewerName && (
                    <span className={`font-semibold text-sm ${textColor}`}>
                      {mockReviews[0].reviewerName}
                    </span>
                  )}
                  {config.showPlatformSource && getPlatformIcon(mockReviews[0].platform)}
                </div>
                {config.showRating && renderStars(mockReviews[0].rating, "w-3 h-3")}
                <p className={`text-xs ${mutedColor} mt-1 line-clamp-2`}>
                  {mockReviews[0].comment}
                </p>
                {config.showReviewDate && (
                  <p className={`text-xs ${mutedColor} mt-1`}>
                    {mockReviews[0].relativeTime}
                  </p>
                )}
              </div>
            </div>
            {config.showReputulBranding && (
              <div className={`text-xs ${mutedColor} mt-3 text-center`}>
                Verified by Reputul
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // BADGE Preview
  if (widgetType === "BADGE") {
    const sizeClasses = {
      small: "p-2 gap-2",
      medium: "p-3 gap-3",
      large: "p-4 gap-4",
    };

    return (
      <div className="bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[300px]">
        <div
          className={`${bgColor} rounded-lg shadow-lg inline-flex items-center ${sizeClasses[config.badgeSize] || "p-3 gap-3"}`}
          style={{ borderRadius: `${config.borderRadius}px` }}
        >
          {config.badgeStyle !== "minimal" && (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: config.primaryColor }}
            >
              {mockBusiness.rating}
            </div>
          )}
          
          <div>
            {config.showBusinessName && config.badgeStyle === "full" && (
              <p className={`font-semibold ${textColor} text-sm`}>
                {mockBusiness.name}
              </p>
            )}
            {config.showRating && renderStars(Math.round(mockBusiness.rating))}
            <div className="flex items-center gap-2 mt-1">
              {config.showReviewCount && (
                <span className={`text-sm ${mutedColor}`}>
                  {mockBusiness.totalReviews} reviews
                </span>
              )}
              {config.showBadge && renderBadge()}
            </div>
          </div>
          
          {config.showReputulBranding && (
            <div className={`text-xs ${mutedColor} border-l border-gray-200 pl-3 ml-2`}>
              Reputul<br/>Verified
            </div>
          )}
        </div>
      </div>
    );
  }

  // CAROUSEL Preview
  if (widgetType === "CAROUSEL") {
    return (
      <div className="bg-gray-100 rounded-xl p-4 min-h-[400px]">
        <div className="text-center text-gray-400 text-sm mb-4">Carousel Preview</div>
        
        <div className={`${bgColor} rounded-xl p-6`} style={{ borderRadius: `${config.borderRadius}px` }}>
          {config.showBusinessName && (
            <div className="text-center mb-4">
              <h3 className={`font-bold text-lg ${textColor}`}>What Our Customers Say</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                {config.showRating && renderStars(Math.round(mockBusiness.rating))}
                {config.showReviewCount && (
                  <span className={mutedColor}>({mockBusiness.totalReviews} reviews)</span>
                )}
              </div>
            </div>
          )}
          
          <div className="relative">
            {/* Single review card */}
            <div
              className={`${isDark ? "bg-gray-800" : "bg-gray-50"} rounded-lg p-4 ${config.cardShadow ? "shadow-md" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {mockReviews[0].reviewerInitials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {config.showReviewerName && (
                      <span className={`font-semibold ${textColor}`}>
                        {mockReviews[0].reviewerName}
                      </span>
                    )}
                    {config.showPlatformSource && getPlatformIcon(mockReviews[0].platform)}
                  </div>
                  {config.showRating && (
                    <div className="mt-1">{renderStars(mockReviews[0].rating)}</div>
                  )}
                  <p className={`${mutedColor} mt-2 text-sm`}>{mockReviews[0].comment}</p>
                  {config.showReviewDate && (
                    <p className={`text-xs ${mutedColor} mt-2`}>{mockReviews[0].relativeTime}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            {config.showNavigationArrows && (
              <>
                <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Dots */}
          {config.showPaginationDots && (
            <div className="flex justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === 0 ? "" : "opacity-30"}`}
                  style={{ backgroundColor: config.primaryColor }}
                />
              ))}
            </div>
          )}
          
          {config.showReputulBranding && (
            <div className={`text-center text-xs ${mutedColor} mt-4`}>
              Powered by Reputul
            </div>
          )}
        </div>
      </div>
    );
  }

  // GRID Preview
  if (widgetType === "GRID") {
    return (
      <div className="bg-gray-100 rounded-xl p-4 min-h-[400px]">
        <div className="text-center text-gray-400 text-sm mb-4">Grid Preview</div>
        
        <div className={`${bgColor} rounded-xl p-6`} style={{ borderRadius: `${config.borderRadius}px` }}>
          {config.showBusinessName && (
            <div className="text-center mb-6">
              <h3 className={`font-bold text-xl ${textColor}`}>Customer Reviews</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                {config.showRating && renderStars(Math.round(mockBusiness.rating), "w-5 h-5")}
                {config.showBadge && <span className="ml-2">{renderBadge()}</span>}
              </div>
              {config.showReviewCount && (
                <p className={`${mutedColor} mt-1`}>Based on {mockBusiness.totalReviews} reviews</p>
              )}
            </div>
          )}
          
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(config.columns, 2)}, 1fr)` }}>
            {mockReviews.slice(0, config.columns).map((review) => (
              <div
                key={review.id}
                className={`${isDark ? "bg-gray-800" : "bg-gray-50"} rounded-lg p-4 ${config.cardShadow ? "shadow-md" : ""}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    {review.reviewerInitials}
                  </div>
                  <div>
                    {config.showReviewerName && (
                      <p className={`font-semibold text-sm ${textColor}`}>{review.reviewerName}</p>
                    )}
                    {config.showRating && renderStars(review.rating, "w-3 h-3")}
                  </div>
                  {config.showPlatformSource && (
                    <div className="ml-auto">{getPlatformIcon(review.platform)}</div>
                  )}
                </div>
                <p className={`text-sm ${mutedColor} line-clamp-3`}>{review.comment}</p>
                {config.showReviewDate && (
                  <p className={`text-xs ${mutedColor} mt-2`}>{review.relativeTime}</p>
                )}
              </div>
            ))}
          </div>
          
          {config.showReputulBranding && (
            <div className={`text-center text-xs ${mutedColor} mt-6`}>
              Powered by Reputul
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default WidgetPreview;