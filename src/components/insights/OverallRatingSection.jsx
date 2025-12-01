import React from 'react';

const OverallRatingSection = ({ overallRating, totalReviews, distribution }) => {
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

  // Render stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-8 h-8 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Rating & Distribution</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Overall Rating
          </p>
          <div className="text-7xl font-bold text-gray-900 mb-2">
            {overallRating.toFixed(1)}
          </div>
          {renderStars(overallRating)}
          <p className="text-gray-600 mt-4 text-lg">
            Based on <span className="font-bold text-gray-900">{totalReviews}</span> reviews
          </p>
        </div>

        {/* Review Distribution */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Review Distribution by Platform
          </p>
          
          {distribution && distribution.length > 0 ? (
            distribution.map((item, index) => {
              const platformColor = getPlatformColor(item.platform);
              
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={platformColor}>
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.platform}</p>
                      <p className="text-sm text-gray-500">{item.count} reviews</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {item.avgRating}
                    </span>
                    <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              No review distribution data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverallRatingSection;