// src/config/api.js - Updated with billing endpoints and dashboard metrics
// Centralized API configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://api.reputul.com'),
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register'
    },
    
    // User endpoints
    USERS: {
      PROFILE: '/api/users/profile'
    },
    
    // Business endpoints
    BUSINESS: {
      DASHBOARD: '/api/dashboard',
      DASHBOARD_METRICS: '/api/dashboard/metrics', // NEW: Dashboard metrics endpoint
      LIST: '/api/businesses',
      BY_ID: (id) => `/api/businesses/${id}`,
      REVIEW_SUMMARY: (id) => `/api/businesses/${id}/review-summary`
    },
    
    // Review endpoints
    REVIEWS: {
      BY_BUSINESS: (id) => `/api/reviews/business/${id}`,
      REQUEST: '/api/review-requests',
      MANUAL: (id) => `/api/reviews/manual/${id}`
    },
    
    // Customer endpoints
    CUSTOMERS: {
      LIST: '/api/customers',
      BY_ID: (id) => `/api/customers/${id}`,
      FEEDBACK_INFO: (id) => `/api/customers/${id}/feedback-info`
    },
    
    // Email template endpoints
    EMAIL_TEMPLATES: {
      LIST: '/api/email-templates',
      BY_ID: (id) => `/api/email-templates/${id}`,
      TYPES: '/api/email-templates/types',
      PREVIEW: (id) => `/api/email-templates/${id}/preview`
    },
    
    // Waitlist endpoints
    WAITLIST: {
      ADD: '/api/waitlist/add',
      COUNT: '/api/waitlist/count'
    },

    // Billing endpoints (matching BillingController exactly)
    BILLING: {
      CHECKOUT_SESSION: '/api/billing/checkout-session',
      PORTAL_SESSION: '/api/billing/portal-session',
      SUBSCRIPTION: '/api/billing/subscription',
      PLANS: '/api/billing/plans',
      CHECK_ENTITLEMENT: '/api/billing/check-entitlement',
      BUSINESS_STATUS: (businessId) => `/api/billing/business/${businessId}/status`,
      WEBHOOK: '/api/billing/webhook'
    },

    // Contacts endpoints
    CONTACTS: {
      LIST: '/api/contacts',
      BY_ID: (id) => `/api/contacts/${id}`,
      STATS: '/api/contacts/stats',
      EXPORT_CSV: '/api/contacts/export.csv',
      BULK_IMPORT_PREPARE: '/api/contacts/bulk/import/prepare',
      BULK_IMPORT_COMMIT: '/api/contacts/bulk/import/commit'
    }
  }
};

// Helper function to build full URLs
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function to get auth headers for multipart/form-data
export const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('token');
  return {
    // Don't set Content-Type for FormData - let browser set it with boundary
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Basic token validation - check if it's expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    console.warn('Invalid token format:', error);
    return false;
  }
};

// Helper function to get current user ID from token
export const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || null;
  } catch (error) {
    console.warn('Could not extract user ID from token:', error);
    return null;
  }
};

// Helper function for handling API errors consistently
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.status === 401) {
    return 'Authentication required. Please log in.';
  }
  if (error.response?.status === 403) {
    return 'Access denied.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  if (error.response?.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An unexpected error occurred.';
};

// Export endpoints for easy access
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
export const API_BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;