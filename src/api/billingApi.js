import axios from 'axios';
import { buildUrl } from '../config/api';

/**
 * Billing API service for handling Stripe integration
 * Matches the backend BillingController endpoints exactly
 */
export class BillingApi {
  constructor() {
    this.api = axios.create({
      timeout: 30000,
    });

    // Add auth interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response error interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Billing API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a checkout session for a subscription plan
   * @param {string} plan - Plan type: SOLO, PRO, or GROWTH
   * @param {string} promoCode - Optional promo code
   * @returns {Promise<string>} Checkout URL
   */
  async createCheckoutSession(plan, promoCode = null) {
    try {
      const response = await this.api.post(buildUrl('/api/billing/checkout-session'), {
        plan: plan.toUpperCase(),
        promoCode: promoCode ? promoCode.trim() : null
      });

      return response.data.url;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a billing portal session for subscription management
   * @returns {Promise<string>} Billing portal URL
   */
  async createBillingPortalSession() {
    try {
      const response = await this.api.post(buildUrl('/api/billing/portal-session'));
      return response.data.url;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to create billing portal session');
    }
  }

  /**
   * Get comprehensive subscription information
   * @returns {Promise<Object>} Subscription details, usage, and plan status
   */
  async getSubscriptionInfo() {
    try {
      const response = await this.api.get(buildUrl('/api/billing/subscription'));
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to load subscription information');
    }
  }

  /**
   * Get billing status for a specific business
   * @param {number} businessId - Business ID
   * @returns {Promise<Object>} Business billing status
   */
  async getBusinessBillingStatus(businessId) {
    try {
      const response = await this.api.get(buildUrl(`/api/billing/business/${businessId}/status`));
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to load business billing status');
    }
  }

  /**
   * Check if user can perform a specific action (plan enforcement)
   * @param {number} businessId - Business ID
   * @param {string} action - Action to check (CREATE_CUSTOMER, SEND_SMS, etc.)
   * @returns {Promise<Object>} Entitlement check result
   */
  async checkEntitlement(businessId, action) {
    try {
      const response = await this.api.post(buildUrl('/api/billing/check-entitlement'), {
        businessId,
        action: action.toUpperCase()
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to check entitlement');
    }
  }

  /**
   * Get available plans with pricing information
   * @returns {Promise<Object>} Available plans
   */
  async getPlans() {
    try {
      const response = await this.api.get(buildUrl('/api/billing/plans'));
      return response.data;
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Failed to load plans');
    }
  }
}

// Export singleton instance
export const billingApi = new BillingApi();

// Export error handling utility
export const handleBillingError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.status === 401) {
    return 'Please log in to access billing features.';
  }
  if (error.response?.status === 403) {
    return 'Access denied.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  return error.message || 'An unexpected error occurred.';
};