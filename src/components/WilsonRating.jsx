import React from 'react';

/**
 * Wilson Score Rating Component
 * Displays star rating with confidence-based visual indicators
 */
const WilsonRating = ({ 
  rating, 
  totalReviews = 0, 
  size = 'md', 
  showNumber = true,
  showConfidence = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  };

  // Confidence indicator based on review count
  const getConfidenceLevel = () => {
    if (totalReviews === 0) return 'no-data';
    if (totalReviews < 5) return 'low';
    if (totalReviews < 15) return 'medium';
    return 'high';
  };

  const confidenceLevel = getConfidenceLevel();
  
  const confidenceColors = {
    'no-data': 'text-gray-400',
    'low': 'text-orange-400',
    'medium': 'text-yellow-400', 
    'high': 'text-green-500'
  };

  // Generate star display
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasPartialStar = rating % 1 !== 0;
  const partialWidth = ((rating % 1) * 100).toFixed(0);

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      // Full star
      stars.push(
        <svg
          key={i}
          className={`${sizeClasses[size]} text-yellow-400 fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (i === fullStars && hasPartialStar) {
      // Partial star
      stars.push(
        <div key={i} className={`${sizeClasses[size]} relative`}>
          <svg
            className={`${sizeClasses[size]} text-gray-300 fill-current absolute`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div
            className="overflow-hidden absolute top-0 left-0"
            style={{ width: `${partialWidth}%` }}
          >
            <svg
              className={`${sizeClasses[size]} text-yellow-400 fill-current`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <svg
          key={i}
          className={`${sizeClasses[size]} text-gray-300 fill-current`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {stars}
      </div>
      
      {showNumber && (
        <span className={`font-medium text-gray-700 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      
      {showConfidence && totalReviews > 0 && (
        <div className="flex items-center space-x-1">
          <div 
            className={`w-2 h-2 rounded-full ${confidenceColors[confidenceLevel]}`}
            title={`Confidence: ${confidenceLevel} (${totalReviews} reviews)`}
          />
          <span className="text-xs text-gray-500">
            ({totalReviews})
          </span>
        </div>
      )}

      {totalReviews === 0 && showNumber && (
        <span className="text-xs text-gray-500">No reviews</span>
      )}
    </div>
  );
};

export default WilsonRating;