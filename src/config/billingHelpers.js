// Billing helper functions that work with your existing api.js

import axios from 'axios';
import API_CONFIG, { buildUrl, getAuthHeaders, handleApiError } from './api';

/**
 * Get pricing information and current subscription
 * Maps new API response to match your existing page structure
 */
export const getSubscriptionInfo = async () => {
  try {
    const response = await axios.get(
      buildUrl(API_CONFIG.ENDPOINTS.BILLING.PRICING),
      { headers: getAuthHeaders() }
    );

    const data = response.data;
    
    // Transform to match your existing page structure
    return {
      subscription: {
        hasSubscription: data.hasActiveSubscription,
        plan: data.currentSubscription?.plan || null,
        status: data.currentSubscription?.status || 'INACTIVE',
        currentPeriodEnd: data.currentSubscription?.currentPeriodEnd || null,
        amount: data.plans?.find(p => p.currentPlan)?.monthlyPrice || 0,
        
        // NEW: Beta tester fields
        isBetaTester: data.currentSubscription?.isBetaTester || false,
        betaExpiresAt: data.currentSubscription?.betaExpiresAt || null,
      },
      usage: {
        hasBusiness: data.currentSubscription?.usage?.businessesUsed > 0,
        
        // SMS usage
        smsMessages: data.currentSubscription?.usage?.smsUsed || 0,
        smsLimit: data.currentSubscription?.usage?.smsLimit || 100,
        
        // Review request usage
        reviewRequests: data.currentSubscription?.usage?.reviewRequestsUsed || 0,
        reviewRequestsLimit: data.currentSubscription?.usage?.reviewRequestsLimit || 100,
        
        // Business usage
        businesses: data.currentSubscription?.usage?.businessesUsed || 0,
        businessesLimit: data.currentSubscription?.usage?.businessesLimit || 1,
        
        // User usage
        users: data.currentSubscription?.usage?.usersUsed || 0,
        usersLimit: data.currentSubscription?.usage?.usersLimit || 1,
      },
      // Optional: Add usage history if your backend provides it
      usageHistory: []
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create Stripe Checkout session
 */
export const createCheckoutSession = async (planId, promoCode = null) => {
  try {
    const response = await axios.post(
      buildUrl(API_CONFIG.ENDPOINTS.BILLING.PRICING_CHECKOUT),
      { plan: planId },
      { headers: getAuthHeaders() }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.url;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create Stripe Billing Portal session
 */
export const createBillingPortalSession = async () => {
  try {
    const response = await axios.post(
      buildUrl(API_CONFIG.ENDPOINTS.BILLING.PRICING_PORTAL),
      {},
      { headers: getAuthHeaders() }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.url;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get current usage stats
 */
export const getCurrentUsage = async () => {
  try {
    const response = await axios.get(
      buildUrl(API_CONFIG.ENDPOINTS.BILLING.PRICING_USAGE),
      { headers: getAuthHeaders() }
    );

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

// Export as billingApi for backward compatibility
export const billingApi = {
  getSubscriptionInfo,
  createCheckoutSession,
  createBillingPortalSession,
  getCurrentUsage,
};

// Also export handleBillingError for your pages
export const handleBillingError = handleApiError;

export default billingApi;