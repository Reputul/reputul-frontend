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

  // Render star rating visually - compact inline version
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
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
      <div className="mb-8">
        {/* Purple container card for skeleton */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-3xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Purple container card */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Decorative elements for depth */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl -ml-48 -mb-48"></div>
        
        {/* Grid container */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Reviews - Hero Metric */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              Total Reviews
            </span>
            <div className="bg-purple-100 p-2 rounded-lg">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-4xl font-bold text-gray-900">
              {data.totalReviews.toLocaleString()}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-purple-600">{data.avgRating.toFixed(1)}</span>
              {renderStars(data.avgRating)}
            </div>
          </div>
        </div>

        {/* New Reviews - Growth Indicator */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              New Reviews
            </span>
            <div className="bg-green-50 p-2 rounded-lg">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <p className="text-4xl font-bold text-gray-900">
                {data.newReviews}
              </p>
              <span className="text-sm text-gray-400 font-medium">last 30d</span>
            </div>
            {data.newReviews > 0 && (
              <div className="inline-flex items-center space-x-1 bg-green-50 px-2.5 py-1 rounded-full">
                <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-xs text-green-700 font-semibold">+{data.newReviews} this month</span>
              </div>
            )}
          </div>
        </div>

        {/* Engagement Rate - Progress Circle Style */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Engagement
            </span>
            <div className="bg-blue-50 p-2 rounded-lg">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-4xl font-bold text-gray-900">
              {data.engagementRate}%
            </p>
            {/* Modern progress bar */}
            <div className="relative">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${data.engagementRate}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">Response rate</span>
            </div>
          </div>
        </div>

        {/* Positive Experience - Success Metric */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Satisfaction
            </span>
            <div className="bg-emerald-50 p-2 rounded-lg">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <p className="text-4xl font-bold text-gray-900">
                {Math.round((data.totalReviews > 0 ? (data.avgRating / 5) * 100 : 0))}%
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {data.totalReviews} total reviews
            </p>
          </div>
        </div>

        {/* Negative Experience - Alert/Improvement Metric */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              To Improve
            </span>
            <div className="bg-amber-50 p-2 rounded-lg">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <p className="text-4xl font-bold text-gray-900">
                {Math.round((data.totalReviews > 0 ? ((5 - data.avgRating) / 5) * 100 : 0))}%
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Growth opportunity
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsGrid;