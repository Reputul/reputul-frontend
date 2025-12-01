import React from 'react';

const PlatformPerformanceChart = ({ platforms }) => {
  if (!platforms || platforms.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Performance</h2>
        <div className="text-center py-12 text-gray-500">
          No platform data available
        </div>
      </div>
    );
  }

  // Find max rating for scaling
  const maxRating = 5;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Performance</h2>
      <p className="text-gray-600 mb-8">Ratings across connected review platforms</p>

      <div className="space-y-6">
        {platforms.map((platform, index) => {
          const percentage = (platform.rating / maxRating) * 100;
          
          return (
            <div key={index} className="space-y-2">
              {/* Platform Name & Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-gray-900 text-lg min-w-[100px]">
                    {platform.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({platform.count} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {platform.rating.toFixed(1)}
                  </span>
                  <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: platform.color
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>
                
                {/* Rating scale markers */}
                <div className="flex justify-between mt-1 px-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num} className="text-xs text-gray-400 font-medium">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Platform Colors
        </p>
        <div className="flex flex-wrap gap-4">
          {platforms.map((platform, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: platform.color }}
              ></div>
              <span className="text-sm text-gray-600 font-medium">{platform.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformPerformanceChart;