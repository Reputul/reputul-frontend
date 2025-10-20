import React from 'react';

const KeyMetricsGrid = ({ metrics, loading }) => {
  // Default values
  const defaultMetrics = {
    totalReviews: 0,
    newReviews: 0,
    avgRating: 0.0,
    engagementRate: 0
  };

  const data = loading ? defaultMetrics : (metrics || defaultMetrics);

  // Render star rating visually
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-8 h-8 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-white/30'}`}
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
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl shadow-2xl p-8 mb-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 bg-white/20 rounded w-24"></div>
              <div className="h-12 bg-white/20 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden">
      {/* Decorative gradient circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -ml-48 -mb-48"></div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Total Reviews & Rating */}
        <div className="lg:col-span-1">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-3">
            Total Reviews
          </p>
          <div className="space-y-3">
            <p className="text-6xl font-bold text-white">
              {data.totalReviews.toLocaleString()}
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="text-4xl font-bold text-white">{data.avgRating.toFixed(1)}</span>
            </div>
            <div className="pt-1">
              {renderStars(data.avgRating)}
            </div>
          </div>
        </div>

        {/* New Reviews */}
        <div className="lg:col-span-1">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-3">
            New Reviews
          </p>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <p className="text-6xl font-bold text-white">
                {data.newReviews}
              </p>
              <span className="text-white/60 text-lg">(30 days)</span>
            </div>
            {data.newReviews > 0 && (
              <div className="flex items-center space-x-1 pt-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-green-300 font-semibold">+{data.newReviews} this month</span>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="lg:col-span-1">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-3">
            Engagement Rate
          </p>
          <div className="space-y-2">
            <p className="text-6xl font-bold text-white">
              {data.engagementRate}%
            </p>
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${data.engagementRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Positive Experience */}
        <div className="lg:col-span-1">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-3">
            Positive Experience
          </p>
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <p className="text-6xl font-bold text-white">
              {Math.round((data.totalReviews > 0 ? (data.avgRating / 5) * 100 : 0))}%
            </p>
          </div>
          <p className="text-white/60 text-sm mt-2">
            Based on {data.totalReviews} reviews
          </p>
        </div>

        {/* Negative Experience */}
        <div className="lg:col-span-1">
          <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-3">
            Negative Experience
          </p>
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <p className="text-6xl font-bold text-white">
              {Math.round((data.totalReviews > 0 ? ((5 - data.avgRating) / 5) * 100 : 0))}%
            </p>
          </div>
          <p className="text-white/60 text-sm mt-2">
            Room for improvement
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsGrid;