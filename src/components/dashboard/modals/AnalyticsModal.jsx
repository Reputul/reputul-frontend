import React from 'react';

const AnalyticsModal = ({ 
  showAnalytics, 
  setShowAnalytics, 
  metrics, 
  staticMetrics, 
  businesses, 
  reviewSummaries 
}) => {
  if (!showAnalytics) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Analytics Overview</h3>
          <button
            onClick={() => setShowAnalytics(false)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-200 rounded-lg">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-primary-600 font-medium">Requests Sent</p>
                <p className="text-2xl font-bold text-primary-900">{metrics?.sent || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{metrics?.completed || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Businesses</p>
                <p className="text-2xl font-bold text-purple-900">{staticMetrics.totalBusinesses}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl hover:shadow-md transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-200 rounded-lg">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Avg Rating (Period)</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {metrics?.averageRatingInPeriod?.toFixed(1) || staticMetrics.averageRating}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Business Performance</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-600 border-b border-gray-200">
                  <th className="pb-3">Business</th>
                  <th className="pb-3">Reviews</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Badge</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {businesses.map((business) => {
                  const summary = reviewSummaries[business.id];
                  return (
                    <tr key={business.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 font-medium text-gray-900">{business.name}</td>
                      <td className="py-3">
                        {summary ? summary.totalReviews : business.reviewCount || 0}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">★</span>
                          <span>
                            {summary
                              ? summary.averageRating.toFixed(1)
                              : business.reputationScore || "0.0"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                            business.badge === "Top Rated"
                              ? "bg-green-100 text-green-800"
                              : business.badge === "Rising Star"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {business.badge || "Unranked"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;