// src/api/waitlistService.js
import { API_ENDPOINTS, buildUrl } from '../config/api';

export const waitlistService = {
  /**
   * Add email to waitlist
   * @param {string} email
   * @returns {Promise<{success: boolean, message: string, duplicate?: boolean, waitlistCount?: number}>}
   */
  async addToWaitlist(email) {
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.WAITLIST.ADD), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          waitlistCount: data.waitlistCount,
        };
      } else {
        // Handle different error cases
        if (response.status === 409) {
          // Conflict - duplicate email
          return {
            success: false,
            message: data.message,
            duplicate: true,
            waitlistCount: data.waitlistCount,
          };
        } else {
          // Other errors
          return {
            success: false,
            message: data.message || 'Something went wrong. Please try again.',
          };
        }
      }
    } catch (error) {
      console.error('Network error adding to waitlist:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
      };
    }
  },

  /**
   * Get current waitlist count
   * @returns {Promise<{count: number}>}
   */
  async getWaitlistCount() {
    try {
      const response = await fetch(buildUrl(API_ENDPOINTS.WAITLIST.COUNT));
      
      if (response.ok) {
        const data = await response.json();
        return { count: data.count };
      } else {
        console.error('Failed to fetch waitlist count');
        return { count: 2847 }; // Fallback to base count
      }
    } catch (error) {
      console.error('Network error fetching waitlist count:', error);
      return { count: 2847 }; // Fallback to base count
    }
  },
};

export default waitlistService;