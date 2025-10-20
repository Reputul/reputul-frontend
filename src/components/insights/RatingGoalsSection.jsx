import React from 'react';

const RatingGoalsSection = ({ currentRating, reputationMetrics, goals }) => {
  // Get color based on progress
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-purple-500 to-blue-500';
  };

  // Get badge gradient
  const getBadgeGradient = (badge) => {
    const gradients = {
      'Neighborhood Favorite': 'from-purple-500 to-pink-500',
      'Top Rated': 'from-green-500 to-emerald-500',
      'Rising Star': 'from-blue-500 to-cyan-500',
      'Unranked': 'from-gray-400 to-gray-500'
    };
    return gradients[badge] || gradients['Unranked'];
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Rating Analysis & Goals</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reputation Metrics */}
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Current Reputation Metrics
            </p>
            
            <div className="space-y-4">
              {/* Reputul Score */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Reputul Score</span>
                  <span className="text-3xl font-bold text-gray-900">{reputationMetrics.score}/100</span>
                </div>
              </div>

              {/* Badge */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Current Badge</span>
                  <div className={`px-4 py-2 rounded-lg bg-gradient-to-r ${getBadgeGradient(reputationMetrics.badge)} text-white font-bold`}>
                    {reputationMetrics.badge}
                  </div>
                </div>
              </div>

              {/* Wilson Score */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Wilson Score</span>
                  <span className="text-3xl font-bold text-gray-900">{reputationMetrics.wilsonScore.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Goals */}
        <div>
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            🎯 Rating Goals
          </p>
          <p className="text-sm text-gray-500 mb-6">
            How many 5-star reviews you need to reach higher ratings
          </p>

          <div className="space-y-6">
            {goals.map((goal, index) => {
              const progressColor = getProgressColor(goal.progress);
              const isAchieved = currentRating >= goal.target;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        To reach {goal.target.toFixed(1)}★
                      </span>
                      {isAchieved && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {isAchieved ? (
                        <span className="text-green-600">✓ Achieved!</span>
                      ) : (
                        `Need ${goal.reviewsNeeded} more 5★ reviews`
                      )}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${progressColor} rounded-full transition-all duration-500 relative`}
                        style={{ width: `${Math.min(goal.progress, 100)}%` }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-700">
                      {Math.round(goal.progress)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
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

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default RatingGoalsSection;