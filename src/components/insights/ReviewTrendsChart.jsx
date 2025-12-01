import React from 'react';

const ReviewTrendsChart = ({ timeSeriesData, averagePerMonth, totalSinceJoining, memberSince }) => {
  if (!timeSeriesData || timeSeriesData.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Trends</h2>
        <div className="text-center py-12 text-gray-500">
          Not enough data to display trends. Start collecting reviews!
        </div>
      </div>
    );
  }

  // Find max value for scaling
  const maxCount = Math.max(...timeSeriesData.map(d => d.count));
  const chartHeight = 200;

  // Format date
  const formatMonth = (dateStr) => {
    const [year, month] = dateStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  // Format member since date
  const formatMemberSince = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Trends</h2>
      <p className="text-gray-600 mb-8">Review volume over time</p>

      {/* Line Chart */}
      <div className="mb-8">
        <div className="relative" style={{ height: chartHeight + 60 }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-gray-500 font-medium">
            <span>{maxCount}</span>
            <span>{Math.round(maxCount / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full">
            <svg width="100%" height={chartHeight + 40} className="overflow-visible">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = (chartHeight / 4) * i;
                return (
                  <line
                    key={i}
                    x1="0"
                    y1={y}
                    x2="100%"
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Line path */}
              <path
                d={timeSeriesData.map((point, index) => {
                  const x = (index / (timeSeriesData.length - 1)) * 100;
                  const y = chartHeight - (point.count / maxCount) * chartHeight;
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}`;
                }).join(' ')}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area fill */}
              <path
                d={
                  timeSeriesData.map((point, index) => {
                    const x = (index / (timeSeriesData.length - 1)) * 100;
                    const y = chartHeight - (point.count / maxCount) * chartHeight;
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}`;
                  }).join(' ') +
                  ` L 100% ${chartHeight} L 0 ${chartHeight} Z`
                }
                fill="url(#areaGradient)"
                opacity="0.2"
              />

              {/* Data points */}
              {timeSeriesData.map((point, index) => {
                const x = (index / (timeSeriesData.length - 1)) * 100;
                const y = chartHeight - (point.count / maxCount) * chartHeight;
                return (
                  <g key={index}>
                    <circle
                      cx={`${x}%`}
                      cy={y}
                      r="5"
                      fill="white"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                    />
                    {/* Hover tooltip */}
                    <title>{`${formatMonth(point.date)}: ${point.count} reviews (${point.avgRating}★)`}</title>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
              {timeSeriesData.map((point, index) => {
                // Show every other label on mobile, all on desktop
                if (timeSeriesData.length > 6 && index % 2 !== 0) {
                  return <span key={index} className="md:hidden"></span>;
                }
                return (
                  <span key={index} className="text-center">
                    {formatMonth(point.date)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-semibold mb-2">Average Per Month</p>
          <p className="text-4xl font-bold text-gray-900">{averagePerMonth}</p>
          <p className="text-xs text-gray-500 mt-1">reviews/month</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-semibold mb-2">Total on Reputul</p>
          <p className="text-4xl font-bold text-gray-900">{totalSinceJoining}</p>
          <p className="text-xs text-gray-500 mt-1">all-time reviews</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-semibold mb-2">Member Since</p>
          <p className="text-lg font-bold text-gray-900">{formatMemberSince(memberSince)}</p>
          <p className="text-xs text-gray-500 mt-1">joined Reputul</p>
        </div>
      </div>

      {/* Growth Insight */}
      {timeSeriesData.length >= 2 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-purple-900">Growth Insight</p>
              <p className="text-sm text-purple-700 mt-1">
                {(() => {
                  const recent = timeSeriesData[timeSeriesData.length - 1].count;
                  const previous = timeSeriesData[timeSeriesData.length - 2].count;
                  const growth = ((recent - previous) / previous * 100).toFixed(0);
                  
                  if (growth > 0) {
                    return `Your reviews are growing! You received ${Math.abs(growth)}% more reviews last month compared to the previous month.`;
                  } else if (growth < 0) {
                    return `Review volume decreased by ${Math.abs(growth)}% last month. Consider sending more review requests to your customers.`;
                  } else {
                    return `Review volume remained steady last month. Keep up the consistent work!`;
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewTrendsChart;