import React from 'react';

const ReputationScoreCard = ({ reputation, loading, onViewBreakdown }) => {
  // Default values
  const defaultReputation = {
    score: 0,
    badge: 'Unranked',
    trend: 0,
    totalReviews: 0
  };

  const data = loading ? defaultReputation : (reputation || defaultReputation);

  // Determine score color based on value
  const getScoreColor = (score) => {
    if (score >= 76) return { 
      gradient: 'from-green-500 to-emerald-500', 
      text: 'text-green-600', 
      ring: 'stroke-green-500',
      glow: 'shadow-green-500/50'
    };
    if (score >= 46) return { 
      gradient: 'from-yellow-500 to-amber-500', 
      text: 'text-yellow-600', 
      ring: 'stroke-yellow-500',
      glow: 'shadow-yellow-500/50'
    };
    return { 
      gradient: 'from-red-500 to-rose-500', 
      text: 'text-red-600', 
      ring: 'stroke-red-500',
      glow: 'shadow-red-500/50'
    };
  };

  // Get badge styling
  const getBadgeStyle = (badge) => {
    const styles = {
      'Neighborhood Favorite': 'from-purple-500 to-pink-500',
      'Top Rated': 'from-green-500 to-emerald-500',
      'Rising Star': 'from-blue-500 to-cyan-500',
      'Unranked': 'from-gray-400 to-gray-500'
    };
    return styles[badge] || styles['Unranked'];
  };

  const scoreColor = getScoreColor(data.score);
  const badgeGradient = getBadgeStyle(data.badge);

  // Calculate circle dasharray for progress ring
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (data.score / 100) * circumference;

  // Skeleton loader
  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="flex items-center gap-8">
          <div className="w-48 h-48 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Reputation Score</h2>
        {onViewBreakdown && (
          <button
            onClick={onViewBreakdown}
            className="px-4 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
          >
            View Breakdown →
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Visual Gauge/Score Circle */}
        <div className="flex-shrink-0 relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="16"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              className={scoreColor.ring}
              strokeWidth="16"
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
            />
          </svg>
          
          {/* Score Text in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold ${scoreColor.text}`}>
              {data.score}
            </span>
            <span className="text-gray-400 font-semibold text-lg">/ 100</span>
          </div>

          {/* Trend indicator */}
          {data.trend !== 0 && (
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-white font-bold text-sm ${data.trend > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              {data.trend > 0 ? '↑' : '↓'} {Math.abs(data.trend)} pts
            </div>
          )}
        </div>

        {/* Reputation Details */}
        <div className="flex-1 space-y-6">
          {/* Badge Display */}
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Current Badge
            </p>
            <div className={`inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r ${badgeGradient} text-white font-bold text-xl shadow-lg ${scoreColor.glow}`}>
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {data.badge}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-medium mb-1">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalReviews}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-medium mb-1">This Month</p>
              <p className={`text-3xl font-bold ${data.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.trend >= 0 ? '+' : ''}{data.trend}
              </p>
            </div>
          </div>

          {/* Score Range Explanation */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Score Ranges
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span className="text-sm font-medium text-gray-700">Excellent</span>
                </div>
                <span className="text-sm text-gray-500">76-100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500"></div>
                  <span className="text-sm font-medium text-gray-700">Good</span>
                </div>
                <span className="text-sm text-gray-500">46-75</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-500 to-rose-500"></div>
                  <span className="text-sm font-medium text-gray-700">Needs Work</span>
                </div>
                <span className="text-sm text-gray-500">0-45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReputationScoreCard;