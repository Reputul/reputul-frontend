import React from 'react';

/**
 * Reusable platform icon component
 * @param {string} platform - Platform identifier (GOOGLE_MY_BUSINESS, FACEBOOK)
 * @param {string} size - Size variant (sm, md, lg, xl)
 * @param {string} className - Additional CSS classes
 */
const PlatformIcon = ({ platform, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const sizeClass = sizes[size] || sizes.md;

  const icons = {
    GOOGLE_MY_BUSINESS: '/assets/logos/google-logo.svg',
    GOOGLE: '/assets/logos/google-logo.svg',
    FACEBOOK: '/assets/logos/facebook-logo.svg',
    REPUTUL: '/assets/logos/reputul-logo.svg', 
    DIRECT: '/assets/logos/reputul-logo.svg',   // ← ADDED: Use same for direct reviews
  };

  const iconSrc = icons[platform];

  if (!iconSrc) {
    // Fallback for unknown platforms
    return (
      <div className={`${sizeClass} ${className} bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold`}>
        ?
      </div>
    );
  }

  return (
    <img 
      src={iconSrc} 
      alt={`${platform} logo`} 
      className={`${sizeClass} ${className}`}
    />
  );
};

export default PlatformIcon;