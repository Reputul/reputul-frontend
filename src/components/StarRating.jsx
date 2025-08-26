import React from 'react';

/**
 * Reusable Star Rating Component
 * Supports both display and interactive modes
 */
const StarRating = ({
  rating = 0,
  maxRating = 5,
  onRate = null,
  interactive = false,
  size = 'medium',
  showLabels = false,
  showValue = false,
  className = '',
  starClassName = '',
  emptyStarClassName = '',
  filledStarClassName = '',
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12',
  };

  const containerClasses = {
    small: 'gap-1',
    medium: 'gap-1',
    large: 'gap-2',
    xlarge: 'gap-2',
  };

  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good', 
    4: 'Very Good',
    5: 'Excellent',
  };

  const handleStarClick = (starValue) => {
    if (interactive && onRate) {
      onRate(starValue);
    }
  };

  const handleKeyDown = (event, starValue) => {
    if (interactive && onRate && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onRate(starValue);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Star Rating Display */}
      <div className={`flex ${containerClasses[size]}`}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= rating;
          
          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => handleStarClick(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              className={`
                ${sizeClasses[size]}
                ${interactive ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded' : 'cursor-default'}
                transition-all duration-200
                ${starClassName}
              `}
              tabIndex={interactive ? 0 : -1}
              aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
              title={interactive ? `Rate ${starValue} star${starValue !== 1 ? 's' : ''}` : `Rating: ${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              <svg 
                className={`
                  w-full h-full transition-colors duration-200
                  ${isActive 
                    ? `text-yellow-400 fill-current ${filledStarClassName}` 
                    : `text-gray-300 ${emptyStarClassName}`
                  }
                `}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          );
        })}
      </div>

      {/* Show Rating Value */}
      {showValue && (
        <div className="mt-2 text-sm text-gray-600">
          {rating > 0 ? (
            <span>{rating} out of {maxRating} stars</span>
          ) : (
            <span>No rating</span>
          )}
        </div>
      )}

      {/* Show Rating Label */}
      {showLabels && rating > 0 && labels[rating] && (
        <div className="mt-1 text-sm font-medium text-gray-700">
          {labels[rating]}
        </div>
      )}
    </div>
  );
};

/**
 * Star Rating Display - Non-interactive variant
 */
export const StarRatingDisplay = ({ rating, maxRating = 5, size = 'medium', showValue = false, className = '' }) => {
  return (
    <StarRating
      rating={rating}
      maxRating={maxRating}
      interactive={false}
      size={size}
      showValue={showValue}
      className={className}
    />
  );
};

/**
 * Star Rating Input - Interactive variant
 */
export const StarRatingInput = ({ 
  rating, 
  onRate, 
  maxRating = 5, 
  size = 'medium', 
  showLabels = true, 
  className = '',
  required = false,
  error = false
}) => {
  return (
    <div className={className}>
      <StarRating
        rating={rating}
        maxRating={maxRating}
        onRate={onRate}
        interactive={true}
        size={size}
        showLabels={showLabels}
        starClassName={error ? 'focus:ring-red-400' : ''}
      />
      {required && rating === 0 && error && (
        <p className="mt-1 text-sm text-red-600">Please select a rating</p>
      )}
    </div>
  );
};

/**
 * Compact Star Rating - For tables and lists
 */
export const CompactStarRating = ({ rating, maxRating = 5, showValue = true }) => {
  return (
    <div className="flex items-center space-x-2">
      <StarRatingDisplay 
        rating={rating} 
        maxRating={maxRating} 
        size="small"
      />
      {showValue && (
        <span className="text-xs text-gray-600">
          ({rating}/{maxRating})
        </span>
      )}
    </div>
  );
};

/**
 * Large Interactive Star Rating - For feedback forms
 */
export const LargeStarRating = ({ 
  rating, 
  onRate, 
  maxRating = 5, 
  showLabels = true, 
  showDescription = true,
  className = ''
}) => {
  const descriptions = {
    1: "Poor - We need to improve",
    2: "Fair - Below expectations", 
    3: "Good - Meets expectations",
    4: "Very Good - Exceeds expectations",
    5: "Excellent - Outstanding service"
  };

  return (
    <div className={`text-center ${className}`}>
      <StarRating
        rating={rating}
        maxRating={maxRating}
        onRate={onRate}
        interactive={true}
        size="xlarge"
        showLabels={showLabels}
      />
      
      {showDescription && rating > 0 && descriptions[rating] && (
        <div className="mt-4">
          <p className="text-lg font-semibold text-gray-800">
            {descriptions[rating]}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            You selected {rating} star{rating !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Star Rating with Hover Effects - Enhanced interactive version
 */
export const HoverStarRating = ({ 
  rating, 
  onRate, 
  maxRating = 5, 
  size = 'large',
  className = ''
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleMouseEnter = (starValue) => {
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= displayRating;
        const isHovering = starValue <= hoverRating;
        
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onRate(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            className={`
              ${size === 'small' ? 'w-6 h-6' : size === 'medium' ? 'w-8 h-8' : 'w-12 h-12'}
              cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded
              transition-all duration-200 transform
            `}
          >
            <svg 
              className={`
                w-full h-full transition-all duration-200
                ${isActive 
                  ? isHovering 
                    ? 'text-yellow-500 fill-current drop-shadow-lg' 
                    : 'text-yellow-400 fill-current'
                  : 'text-gray-300'
                }
              `}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;