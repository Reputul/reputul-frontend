import React from 'react';

const SentimentBreakdown = ({ positive, negative }) => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sentiment Breakdown</h2>
      <p className="text-gray-600 mb-8">Distribution of positive and negative reviews</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Positive Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Positive Reviews</p>
                <p className="text-xs text-gray-500">4-5 stars</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-600">{positive.percentage}%</p>
              <p className="text-sm text-gray-500">{positive.count} reviews</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${positive.percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-900">Great Job!</p>
                <p className="text-sm text-green-700 mt-1">
                  {positive.percentage}% of your customers are highly satisfied. Keep up the excellent work!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Negative Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Negative Reviews</p>
                <p className="text-xs text-gray-500">1-3 stars</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-red-600">{negative.percentage}%</p>
              <p className="text-sm text-gray-500">{negative.count} reviews</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${negative.percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-orange-900">Room for Improvement</p>
                <p className="text-sm text-orange-700 mt-1">
                  {negative.percentage > 10 
                    ? "Consider reaching out to unhappy customers to resolve issues and improve their experience."
                    : "You're doing great! Keep monitoring feedback to maintain high satisfaction."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">Total Reviews</p>
            <p className="text-3xl font-bold text-gray-900">{positive.count + negative.count}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">Satisfaction Rate</p>
            <p className="text-3xl font-bold text-green-600">{positive.percentage}%</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 font-medium mb-1">Response Needed</p>
            <p className="text-3xl font-bold text-purple-600">{negative.count}</p>
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

export default SentimentBreakdown;