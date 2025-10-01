// src/utils/reviewLinkUtils.js

/**
 * Utility functions for generating review links and URLs
 * Supports Google-compliant feedback gate integration
 */

/**
 * Generate Google review URL
 * @param {Object} business - Business information
 * @returns {string} Google review URL
 */
export const generateGoogleReviewUrl = (business) => {
  if (!business) return null;

  // Priority 1: Use Google Place ID for direct write review link
  if (business.googlePlaceId && business.googlePlaceId.trim()) {
    return `https://search.google.com/local/writereview?placeid=${business.googlePlaceId.trim()}`;
  }

  // Priority 2: Use business name + address for Maps search
  if (business.name && business.address) {
    const query = encodeURIComponent(`${business.name.trim()} ${business.address.trim()}`);
    return `https://www.google.com/maps/search/${query}`;
  }

  // Priority 3: Use business name for general search
  if (business.name) {
    const query = encodeURIComponent(`${business.name.trim()} reviews`);
    return `https://www.google.com/search?q=${query}`;
  }

  // Fallback: Google Business profile
  return 'https://www.google.com/business/';
};

/**
 * Generate Facebook review URL
 * @param {Object} business - Business information
 * @returns {string} Facebook review URL
 */
export const generateFacebookReviewUrl = (business) => {
  if (!business) return null;

  if (business.facebookPageUrl && business.facebookPageUrl.trim()) {
    const baseUrl = business.facebookPageUrl.trim();
    return baseUrl.endsWith('/') ? `${baseUrl}reviews` : `${baseUrl}/reviews`;
  }

  // Fallback to Facebook search
  if (business.name) {
    const query = encodeURIComponent(business.name.trim());
    return `https://www.facebook.com/search/top?q=${query}`;
  }

  return 'https://facebook.com';
};

/**
 * Generate Yelp review URL
 * @param {Object} business - Business information
 * @returns {string} Yelp review URL
 */
export const generateYelpReviewUrl = (business) => {
  if (!business) return null;

  if (business.yelpPageUrl && business.yelpPageUrl.trim()) {
    return business.yelpPageUrl.trim();
  }

  // Fallback to Yelp search
  if (business.name && business.address) {
    const query = encodeURIComponent(`${business.name} ${business.address}`);
    return `https://www.yelp.com/search?find_desc=${query}`;
  }

  return 'https://yelp.com';
};

/**
 * Generate feedback gate URL
 * @param {number} customerId - Customer ID
 * @param {Object} options - URL options
 * @param {string} options.baseUrl - Base URL (defaults to current origin)
 * @param {Object} options.params - Additional query parameters
 * @returns {string} Feedback gate URL
 */
export const generateFeedbackGateUrl = (customerId, options = {}) => {
  const { baseUrl = window.location.origin, params = {} } = options;
  
  const url = new URL(`/feedback-gate/${customerId}`, baseUrl);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value.toString());
    }
  });
  
  return url.toString();
};

/**
 * Generate private feedback URL
 * @param {number} customerId - Customer ID
 * @param {Object} options - URL options
 * @returns {string} Private feedback URL
 */
export const generatePrivateFeedbackUrl = (customerId, options = {}) => {
  const { baseUrl = window.location.origin, from, rating } = options;
  
  const url = new URL(`/feedback/${customerId}`, baseUrl);
  
  if (from) {
    url.searchParams.set('from', from);
  }
  
  if (rating) {
    url.searchParams.set('rating', rating.toString());
  }
  
  return url.toString();
};

/**
 * Generate all review URLs for a business
 * @param {Object} business - Business information
 * @param {number} customerId - Customer ID (for private feedback)
 * @returns {Object} Object containing all review URLs
 */
export const generateAllReviewUrls = (business, customerId) => {
  return {
    google: generateGoogleReviewUrl(business),
    facebook: generateFacebookReviewUrl(business),
    yelp: generateYelpReviewUrl(business),
    privateFeedback: generatePrivateFeedbackUrl(customerId),
    feedbackGate: generateFeedbackGateUrl(customerId),
  };
};

/**
 * Get the best available public review URL
 * Priority: Google > Facebook > Yelp
 * @param {Object} business - Business information
 * @returns {string|null} Best available public review URL
 */
export const getBestPublicReviewUrl = (business) => {
  const googleUrl = generateGoogleReviewUrl(business);
  if (googleUrl && !googleUrl.includes('google.com/business/')) {
    return googleUrl;
  }

  const facebookUrl = generateFacebookReviewUrl(business);
  if (facebookUrl && facebookUrl.includes(business?.facebookPageUrl)) {
    return facebookUrl;
  }

  const yelpUrl = generateYelpReviewUrl(business);
  if (yelpUrl && yelpUrl.includes('yelp.com/biz/')) {
    return yelpUrl;
  }

  return googleUrl; // Return Google fallback
};

/**
 * Validate and sanitize URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);
    
    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS' };
    }

    return { 
      valid: true, 
      url: urlObj.toString(),
      domain: urlObj.hostname 
    };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Shorten URL for SMS (placeholder for URL shortening service)
 * @param {string} url - URL to shorten
 * @returns {Promise<string>} Shortened URL
 */
export const shortenUrlForSms = async (url) => {
  // In production, integrate with a URL shortening service like Bitly
  // For now, return the original URL
  return url;
};

/**
 * Generate email template variables with review URLs
 * @param {Object} customer - Customer information
 * @param {Object} business - Business information
 * @returns {Object} Template variables object
 */
export const generateTemplateVariables = (customer, business) => {
  const reviewUrls = generateAllReviewUrls(business, customer.id);
  
  return {
    // Customer variables
    customerName: customer.name || 'Valued Customer',
    customerEmail: customer.email || '',
    customerPhone: customer.phone || '',
    
    // Business variables
    businessName: business.name || 'Our Business',
    businessPhone: business.phone || '',
    businessWebsite: business.website || '',
    businessAddress: business.address || '',
    
    // Service variables
    serviceType: customer.serviceType || 'service',
    serviceDate: customer.serviceDate ? new Date(customer.serviceDate).toLocaleDateString() : 'recently',
    
    // Review URLs - Google compliant (all platforms available)
    googleReviewUrl: reviewUrls.google,
    facebookReviewUrl: reviewUrls.facebook,
    yelpReviewUrl: reviewUrls.yelp,
    privateFeedbackUrl: reviewUrls.privateFeedback,
    feedbackGateUrl: reviewUrls.feedbackGate,
    
    // Utility URLs
    unsubscribeUrl: `${window.location.origin}/unsubscribe/${customer.id}`,
    
    // Legacy support
    reviewLink: reviewUrls.feedbackGate, // Points to feedback gate for compliance
  };
};

/**
 * Get platform-specific review instructions
 * @param {string} platform - Platform name (google, facebook, yelp)
 * @returns {Object} Platform instructions and information
 */
export const getPlatformInstructions = (platform) => {
  const instructions = {
    google: {
      name: 'Google',
      icon: '⭐',
      color: '#4285F4',
      instructions: 'Click to leave a review on Google Maps or Google Business',
      benefits: 'Appears in Google search results and Maps',
    },
    facebook: {
      name: 'Facebook',
      icon: '👍',
      color: '#1877F2',
      instructions: 'Click to review on our Facebook business page',
      benefits: 'Visible to Facebook users and shared in social feeds',
    },
    yelp: {
      name: 'Yelp',
      icon: '⭐',
      color: '#D32323',
      instructions: 'Click to review on Yelp business listing',
      benefits: 'Helps customers discover local businesses',
    },
    private: {
      name: 'Private Feedback',
      icon: '💬',
      color: '#6B7280',
      instructions: 'Share confidential feedback directly with us',
      benefits: 'Helps us improve without public visibility',
    },
  };

  return instructions[platform] || instructions.private;
};

/**
 * Generate QR code URL for review link (for print materials)
 * @param {string} reviewUrl - Review URL to encode
 * @param {Object} options - QR code options
 * @returns {string} QR code image URL
 */
export const generateQrCodeUrl = (reviewUrl, options = {}) => {
  const { size = 200, errorCorrection = 'M' } = options;
  
  // Using Google Charts API for QR code generation
  const encodedUrl = encodeURIComponent(reviewUrl);
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedUrl}&choe=UTF-8&chld=${errorCorrection}`;
};

/**
 * Track link click for analytics
 * @param {string} linkType - Type of link clicked
 * @param {number} customerId - Customer ID
 * @param {Object} metadata - Additional tracking data
 */
export const trackLinkClick = async (linkType, customerId, metadata = {}) => {
  try {
    const trackingData = {
      linkType,
      customerId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      ...metadata,
    };

    // Send to analytics endpoint
    await fetch('/api/v1/analytics/link-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    });
  } catch (error) {
    console.warn('Failed to track link click:', error);
  }
};

/**
 * Copy URL to clipboard with user feedback
 * @param {string} url - URL to copy
 * @param {string} label - Label for user feedback
 * @returns {Promise<Object>} Copy operation result
 */
export const copyUrlToClipboard = async (url, label = 'URL') => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return {
        success: true,
        message: `${label} copied to clipboard!`,
      };
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return {
        success: true,
        message: `${label} copied to clipboard!`,
      };
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return {
      success: false,
      message: 'Failed to copy to clipboard',
    };
  }
};

/**
 * Batch generate review URLs for multiple customers
 * @param {Array} customers - Array of customer objects
 * @param {Object} business - Business information
 * @returns {Array} Array of customer objects with review URLs
 */
export const batchGenerateReviewUrls = (customers, business) => {
  return customers.map(customer => ({
    ...customer,
    reviewUrls: generateAllReviewUrls(business, customer.id),
  }));
};

export default {
  generateGoogleReviewUrl,
  generateFacebookReviewUrl,
  generateYelpReviewUrl,
  generateFeedbackGateUrl,
  generatePrivateFeedbackUrl,
  generateAllReviewUrls,
  getBestPublicReviewUrl,
  validateUrl,
  shortenUrlForSms,
  generateTemplateVariables,
  getPlatformInstructions,
  generateQrCodeUrl,
  trackLinkClick,
  copyUrlToClipboard,
  batchGenerateReviewUrls,
};