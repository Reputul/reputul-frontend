// src/services/feedbackGateService.js
import axios from 'axios';
import { API_ENDPOINTS, buildUrl } from '../config/api';

/**
 * Service for handling feedback gate operations
 * Provides Google-compliant rating collection and routing
 */
class FeedbackGateService {
  
  /**
   * Get customer information for feedback gate
   * @param {number} customerId - Customer ID
   * @returns {Promise} Customer and business data for feedback gate
   */
  async getCustomerGateInfo(customerId) {
    try {
      const response = await axios.get(buildUrl(`/api/v1/customers/${customerId}/gate-info`));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching customer gate info:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to load customer information',
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Submit rating through feedback gate
   * @param {number} customerId - Customer ID
   * @param {Object} ratingData - Rating submission data
   * @param {number} ratingData.rating - Rating value (1-5)
   * @param {string} ratingData.source - Source identifier (e.g., 'feedback_gate')
   * @returns {Promise} Routing decision and review URLs
   */
  async submitRating(customerId, ratingData) {
    try {
      const response = await axios.post(buildUrl(`/api/v1/customers/${customerId}/rate`), {
        rating: ratingData.rating,
        source: ratingData.source || 'feedback_gate',
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error submitting rating:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to process rating',
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Check if customer has already used the feedback gate
   * @param {number} customerId - Customer ID
   * @returns {Promise} Gate usage status
   */
  async checkGateStatus(customerId) {
    try {
      const response = await axios.get(buildUrl(`/api/v1/customers/${customerId}/gate-status`));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error checking gate status:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to check gate status',
        hasUsedGate: false, // Default to allowing gate usage on error
      };
    }
  }

  /**
   * Generate feedback gate URL for a customer
   * @param {number} customerId - Customer ID
   * @param {Object} options - Additional URL options
   * @param {string} options.baseUrl - Custom base URL (defaults to current origin)
   * @param {Object} options.params - Additional query parameters
   * @returns {string} Complete feedback gate URL
   */
  generateFeedbackGateUrl(customerId, options = {}) {
    const { baseUrl = window.location.origin, params = {} } = options;
    
    const url = new URL(`/feedback-gate/${customerId}`, baseUrl);
    
    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value.toString());
      }
    });
    
    return url.toString();
  }

  /**
   * Generate private feedback URL with optional parameters
   * @param {number} customerId - Customer ID
   * @param {Object} options - URL options
   * @param {string} options.baseUrl - Custom base URL
   * @param {string} options.from - Source reference (e.g., 'gate')
   * @param {number} options.rating - Pre-fill rating value
   * @returns {string} Complete private feedback URL
   */
  generatePrivateFeedbackUrl(customerId, options = {}) {
    const { baseUrl = window.location.origin, from, rating } = options;
    
    const url = new URL(`/feedback/${customerId}`, baseUrl);
    
    if (from) {
      url.searchParams.set('from', from);
    }
    
    if (rating) {
      url.searchParams.set('rating', rating.toString());
    }
    
    return url.toString();
  }

  /**
   * Validate rating value
   * @param {number} rating - Rating to validate
   * @returns {Object} Validation result
   */
  validateRating(rating) {
    const numRating = Number(rating);
    
    if (isNaN(numRating)) {
      return {
        valid: false,
        error: 'Rating must be a number',
      };
    }
    
    if (numRating < 1 || numRating > 5) {
      return {
        valid: false,
        error: 'Rating must be between 1 and 5',
      };
    }
    
    if (!Number.isInteger(numRating)) {
      return {
        valid: false,
        error: 'Rating must be a whole number',
      };
    }
    
    return {
      valid: true,
      rating: numRating,
    };
  }

  /**
   * Get routing decision based on rating
   * This mirrors the backend logic for frontend validation
   * @param {number} rating - Rating value
   * @returns {Object} Routing decision information
   */
  getRoutingDecision(rating) {
    const numRating = Number(rating);
    
    if (numRating >= 4) {
      return {
        decision: 'public_reviews',
        description: 'High rating - route to public review platforms',
        encouragePublic: true,
        suggestedMessage: 'Fantastic! Would you mind sharing your experience publicly?',
      };
    } else {
      return {
        decision: 'private_feedback',
        description: 'Low rating - route to private feedback',
        encouragePublic: false,
        suggestedMessage: "We'd love to hear more about your experience",
      };
    }
  }

  /**
   * Format rating for display
   * @param {number} rating - Rating value
   * @returns {Object} Formatted rating information
   */
  formatRating(rating) {
    const descriptions = {
      1: { text: 'Poor', color: 'red', emoji: '😞' },
      2: { text: 'Fair', color: 'orange', emoji: '😕' },
      3: { text: 'Good', color: 'yellow', emoji: '😐' },
      4: { text: 'Very Good', color: 'blue', emoji: '😊' },
      5: { text: 'Excellent', color: 'green', emoji: '🤩' },
    };
    
    const info = descriptions[rating] || descriptions[3];
    
    return {
      rating: Number(rating),
      text: info.text,
      color: info.color,
      emoji: info.emoji,
      stars: '⭐'.repeat(rating) + '☆'.repeat(5 - rating),
    };
  }

  /**
   * Get analytics data for feedback gate usage
   * @param {Object} filters - Filter options
   * @returns {Promise} Analytics data
   */
  async getFeedbackGateAnalytics(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, value.toString());
        }
      });
      
      const response = await axios.get(buildUrl(`/api/v1/feedback-gate/analytics?${params}`));
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching feedback gate analytics:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch analytics',
      };
    }
  }

  /**
   * Batch operations for feedback gate URLs
   * @param {Array} customerIds - Array of customer IDs
   * @param {Object} options - URL generation options
   * @returns {Array} Array of URL objects
   */
  generateBatchUrls(customerIds, options = {}) {
    return customerIds.map(customerId => ({
      customerId,
      feedbackGateUrl: this.generateFeedbackGateUrl(customerId, options),
      privateFeedbackUrl: this.generatePrivateFeedbackUrl(customerId, options),
    }));
  }

  /**
   * Copy URL to clipboard with error handling
   * @param {string} url - URL to copy
   * @returns {Promise} Copy operation result
   */
  async copyUrlToClipboard(url) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        return {
          success: true,
          message: 'URL copied to clipboard',
        };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return {
          success: true,
          message: 'URL copied to clipboard',
        };
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return {
        success: false,
        error: 'Failed to copy URL to clipboard',
      };
    }
  }
}

// Create singleton instance
const feedbackGateService = new FeedbackGateService();

export default feedbackGateService;