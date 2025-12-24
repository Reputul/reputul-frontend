import React from 'react';

const ReputationScoreCard = ({ 
  reputation, 
  overallRating, 
  totalReviews, 
  distribution,
  reputationMetrics,
  ratingGoals,
  loading 
}) => {
  // Default values
  const defaultReputation = {
    publicRating: 0,
    healthScore: 0,
    badge: 'Unranked',
    trend: 0,
    totalReviews: 0
  };

  const defaultMetrics = {
    score: 0,
    badge: 'Unranked',
    wilsonScore: 0
  };

  const defaultGoals = [
    { target: 4.8, reviewsNeeded: 0, progress: 0 },
    { target: 4.9, reviewsNeeded: 0, progress: 0 },
    { target: 5.0, reviewsNeeded: 0, progress: 0 }
  ];

  const data = loading ? defaultReputation : (reputation || defaultReputation);
  const metrics = loading ? defaultMetrics : (reputationMetrics || defaultMetrics);
  const goals = loading ? defaultGoals : (ratingGoals || defaultGoals);
  const currentRating = overallRating || data.publicRating;

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
      'Neighborhood Favorite': { gradient: 'from-purple-500 to-pink-500', icon: '🏆' },
      'Building Reputation': { gradient: 'from-gray-400 to-gray-500', icon: '📈' },
      'Unranked': { gradient: 'from-gray-400 to-gray-500', icon: '⭐' }
    };
    return styles[badge] || styles['Unranked'];
  };

  // Get badge gradient
  const getBadgeGradient = (badge) => {
    const gradients = {
      'Neighborhood Favorite': 'from-purple-500 to-pink-500',
      'Top Rated': 'from-green-500 to-emerald-500',
      'Rising Star': 'from-blue-500 to-cyan-500',
      'Unranked': 'from-gray-400 to-gray-500',
    };
    return gradients[badge] || gradients['Unranked'];
  };

  // Get color based on progress
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-purple-500 to-blue-500';
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const icons = {
      'Google': (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
      'Facebook': (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      'Reputul': (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      'Direct': (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    };
    return icons[platform] || icons['Direct'];
  };

  // Get platform color
  const getPlatformColor = (platform) => {
    const colors = {
      'Google': 'text-blue-600',
      'Facebook': 'text-blue-700',
      'Reputul': 'text-purple-600',
      'Direct': 'text-green-600'
    };
    return colors[platform] || 'text-gray-600';
  };

  const healthColor = getHealthScoreColor(data.healthScore);
  const badgeStyle = getBadgeStyle(data.badge || metrics.badge);

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-2xl"></div>
              <div className="h-20 bg-gray-200 rounded-2xl"></div>
            </div>
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
            <h2 className="text-2xl font-bold text-gray-900">Reputation Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Your complete reputation metrics and goals</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Public Rating & Distribution */}
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
                  {renderStars(currentRating)}
                </div>
                <div className="flex items-baseline justify-center space-x-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {currentRating.toFixed(1)}
                  </span>
                  <span className="text-3xl text-gray-400 font-medium">/5.0</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Based on {totalReviews || data.totalReviews} {(totalReviews || data.totalReviews) === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>

            {/* Platform Distribution */}
            {distribution && distribution.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Platform Distribution</h3>
                <div className="space-y-3">
                  {distribution.map((item, index) => {
                    const platformColor = getPlatformColor(item.platform);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={platformColor}>
                            {getPlatformIcon(item.platform)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.platform}</p>
                            <p className="text-xs text-gray-500">{item.count} reviews</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg font-bold text-gray-900">{item.avgRating}</span>
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Health Score & Metrics */}
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
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-200" />
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
                      cx="64" cy="64" r="56"
                      stroke="url(#healthScoreGradient)"
                      strokeWidth="8" fill="none"
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

              <div className="text-center">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Composite of Quality (60%), Velocity (25%), and Responsiveness (15%)
                </p>
              </div>
            </div>

            {/* Current Badge & Additional Metrics */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Current Badge</h3>
              <div className="flex items-center justify-center mb-4">
                <div className={`inline-flex items-center space-x-3 px-6 py-4 bg-gradient-to-r ${badgeStyle.gradient} text-white rounded-2xl font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-200`}>
                  <span className="text-2xl">{badgeStyle.icon}</span>
                  <span>{data.badge || metrics.badge}</span>
                </div>
              </div>

              {/* Additional Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">Reputul Score</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.score}/100</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">Wilson Score</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.wilsonScore.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Rating Goals */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-2">🎯 Rating Goals</h3>
              <p className="text-xs text-gray-500 mb-6">5-star reviews needed to reach higher ratings</p>

              <div className="space-y-5">
                {goals.map((goal, index) => {
                  const progressColor = getProgressColor(goal.progress);
                  const isAchieved = currentRating >= goal.target;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-base font-bold text-gray-900">
                            {goal.target.toFixed(1)}⭐
                          </span>
                          {isAchieved && (
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-600">
                          {isAchieved ? (
                            <span className="text-green-600">✓ Done!</span>
                          ) : (
                            `+${goal.reviewsNeeded.toLocaleString()}`
                          )}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500 relative`}
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent reputul-shimmer"></div>
                          </div>
                        </div>
                        <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-700">
                          {Math.round(goal.progress)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{totalReviews || data.totalReviews}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-1">This Month</p>
                <p className={`text-3xl font-bold ${data.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.trend >= 0 ? '+' : ''}{data.trend || 0}
                </p>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Pro Tip</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Focus on requesting reviews from satisfied customers to reach your rating goals faster!
                  </p>
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