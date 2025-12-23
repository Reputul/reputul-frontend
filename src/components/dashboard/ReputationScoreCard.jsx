import React from 'react';

const ReputationScoreCard = ({ reputation, loading, onViewBreakdown }) => {
  // Default values
  const defaultReputation = {
    publicRating: 0,
    healthScore: 0,
    badge: 'Unranked',
    trend: 0,
    totalReviews: 0
  };

  const data = loading ? defaultReputation : (reputation || defaultReputation);

  // Determine health score color based on value
  const getHealthScoreColor = (score) => {
    if (score >= 76) return { 
      gradient: 'from-green-500 to-emerald-500', 
      text: 'text-green-600',
      label: 'Excellent',
      ring: 'ring-green-100',
      bg: 'bg-green-50'
    };
    if (score >= 46) return { 
      gradient: 'from-yellow-500 to-amber-500', 
      text: 'text-yellow-600',
      label: 'Good',
      ring: 'ring-yellow-100',
      bg: 'bg-yellow-50'
    };
    return { 
      gradient: 'from-red-500 to-rose-500', 
      text: 'text-red-600',
      label: 'Needs Work',
      ring: 'ring-red-100',
      bg: 'bg-red-50'
    };
  };

  // Get badge styling
  const getBadgeStyle = (badge) => {
    const styles = {
      'New Starter': { gradient: 'from-blue-400 to-blue-500', icon: '🌱' },
      'Rising Star': { gradient: 'from-yellow-500 to-orange-500', icon: '⭐' },
      'Trusted Pro': { gradient: 'from-green-500 to-emerald-600', icon: '🏅' },
      'Top Rated': { gradient: 'from-blue-600 to-cyan-500', icon: '💎' },
      'Neighborhood Favorite': { gradient: 'from-purple-500 to-pink-500', icon: '👑' },
      'Building Reputation': { gradient: 'from-gray-400 to-gray-500', icon: '📈' },
      'Unranked': { gradient: 'from-gray-400 to-gray-500', icon: '⭐' }
    };
    return styles[badge] || styles['Unranked'];
  };

  const healthColor = getHealthScoreColor(data.healthScore);
  const badgeStyle = getBadgeStyle(data.badge);

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="w-7 h-7 text-yellow-400 fill-current drop-shadow-sm" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="w-7 h-7 text-yellow-400 drop-shadow-sm" viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#FBBF24" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill={`url(#half-${i})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="w-7 h-7 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
    }
    return stars;
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-20 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-20 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-200 mb-6 overflow-hidden">
      {/* Header with subtle gradient */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reputation Score</h2>
            <p className="text-sm text-gray-600 mt-1">Your public rating and business health metrics</p>
          </div>
          <button
            onClick={onViewBreakdown}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-purple-600 font-semibold rounded-xl border border-purple-200 shadow-sm transition-all duration-200 hover:shadow-md flex items-center space-x-2"
          >
            <span>View Breakdown</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Public Rating */}
          <div className="space-y-6">
            {/* Star Rating Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Public Rating</h3>
                <div className="flex items-center space-x-1 px-3 py-1 bg-white rounded-full shadow-sm">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">Customer View</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-3">
                  {renderStars(data.publicRating)}
                </div>
                <div className="flex items-baseline justify-center space-x-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {data.publicRating.toFixed(1)}
                  </span>
                  <span className="text-3xl text-gray-400 font-medium">/5.0</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Based on {data.totalReviews} {data.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Current Badge Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Current Badge</h3>
              <div className="flex items-center justify-center">
                <div className={`inline-flex items-center space-x-3 px-6 py-4 bg-gradient-to-r ${badgeStyle.gradient} text-white rounded-2xl font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}>
                  <span className="text-2xl">{badgeStyle.icon}</span>
                  <span>{data.badge}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Health Score */}
          <div className="space-y-6">
            {/* Health Score Card */}
            <div className={`bg-gradient-to-br ${healthColor.bg} to-white rounded-2xl p-6 border ${healthColor.ring} ring-2 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Health Score</h3>
                <div className={`px-3 py-1 ${healthColor.bg} rounded-full border ${healthColor.ring} ring-1`}>
                  <span className={`text-xs font-bold ${healthColor.text}`}>{healthColor.label}</span>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center space-x-2 mb-3">
                  <span className={`text-6xl font-bold bg-gradient-to-r ${healthColor.gradient} bg-clip-text text-transparent`}>
                    {data.healthScore}
                  </span>
                  <span className="text-3xl text-gray-400 font-medium">/100</span>
                </div>
                
                {/* Circular Progress Ring */}
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="transform -rotate-90 w-32 h-32">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    {/* Progress circle with gradient */}
                    <defs>
                      <linearGradient id="healthScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        {data.healthScore >= 76 ? (
                          <>
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#059669" />
                          </>
                        ) : data.healthScore >= 46 ? (
                          <>
                            <stop offset="0%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </>
                        ) : (
                          <>
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#f43f5e" />
                          </>
                        )}
                      </linearGradient>
                    </defs>
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="url(#healthScoreGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(data.healthScore / 100) * 351.86} 351.86`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">{data.healthScore}%</span>
                  </div>
                </div>
              </div>

              {/* Score Explanation */}
              <div className="text-center">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Composite of Quality (60%), Velocity (25%), and Responsiveness (15%)
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{data.totalReviews}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-1">This Month</p>
                <p className={`text-3xl font-bold ${data.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.trend >= 0 ? '+' : ''}{data.trend || 0}
                </p>
              </div>
            </div>

            {/* Score Ranges - Compact */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Score Ranges</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Excellent</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">76-100</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Good</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">46-75</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-500 shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Needs Work</span>
                  </div>
                  <span className="text-sm text-gray-500 font-medium">0-45</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReputationScoreCard;