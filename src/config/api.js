// src/config/api.js - Complete API configuration
// Centralized API configuration for all backend endpoints
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://api.reputul.com'),
  ENDPOINTS: {
    // ==========================================
    // AUTH ENDPOINTS (unversioned)
    // ==========================================
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      REFRESH: '/api/auth/refresh'
    },
    
    // ==========================================
    // HEALTH & STATUS (unversioned)
    // ==========================================
    HEALTH: {
      CHECK: '/api/health'
    },
    
    // ==========================================
    // USER ENDPOINTS
    // ==========================================
    USERS: {
      PROFILE: '/api/v1/users/profile',
      DASHBOARD: '/api/v1/users/dashboard'
    },
    
    // ==========================================
    // BUSINESS ENDPOINTS
    // ==========================================
    BUSINESS: {
      LIST: '/api/v1/businesses',
      BY_ID: (id) => `/api/v1/businesses/${id}`,
      REVIEW_SUMMARY: (id) => `/api/v1/businesses/${id}/review-summary`,
      UPLOAD_LOGO: (id) => `/api/v1/businesses/${id}/logo`,
      DELETE_LOGO: (id) => `/api/v1/businesses/${id}/logo`
    },
    
    // ==========================================
    // DASHBOARD ENDPOINTS
    // ==========================================
    DASHBOARD: {
      LIST: '/api/v1/dashboard',
      METRICS: '/api/v1/dashboard/metrics'
    },
    
    // ==========================================
    // REVIEW ENDPOINTS
    // ==========================================
    REVIEWS: {
      BY_BUSINESS: (id) => `/api/v1/reviews/business/${id}`,
      CREATE: (businessId) => `/api/v1/reviews/${businessId}`,
      MANUAL: (businessId) => `/api/v1/reviews/manual/${businessId}`,
      BY_ID: (id) => `/api/v1/reviews/${id}`
    },
    
    // ==========================================
    // PUBLIC REVIEW ENDPOINTS (no auth)
    // ==========================================
    PUBLIC_REVIEWS: {
      BY_BUSINESS: (businessId) => `/api/v1/public/reviews/business/${businessId}`,
      SUBMIT: (businessId) => `/api/v1/public/reviews/${businessId}`
    },
    
    // ==========================================
    // REVIEW REQUEST ENDPOINTS
    // ==========================================
    REVIEW_REQUESTS: {
      SEND: '/api/v1/review-requests',
      SEND_DIRECT: '/api/v1/review-requests/send-direct',
      SEND_BATCH: '/api/v1/review-requests/send-batch',
      STATS: '/api/v1/review-requests/stats',
      VALIDATE_PHONE: '/api/v1/review-requests/validate-phone',
      BY_ID: (id) => `/api/v1/review-requests/${id}`
    },
    
    // ==========================================
    // CUSTOMER ENDPOINTS
    // ==========================================
    CUSTOMERS: {
      LIST: '/api/v1/customers',
      BY_ID: (id) => `/api/v1/customers/${id}`,
      BY_BUSINESS: (businessId) => `/api/v1/customers/business/${businessId}`,
      FEEDBACK_INFO: (id) => `/api/v1/customers/${id}/feedback-info`,
      STATS: '/api/v1/customers/stats',
      TEST: '/api/v1/customers/test'
    },
    
    // ==========================================
    // CONTACTS (CRM) ENDPOINTS
    // ==========================================
    CONTACTS: {
      LIST: '/api/v1/contacts',
      BY_ID: (id) => `/api/v1/contacts/${id}`,
      STATS: '/api/v1/contacts/stats',
      EXPORT_CSV: '/api/v1/contacts/export.csv',
      BULK_IMPORT_PREPARE: '/api/v1/contacts/bulk/import/prepare',
      BULK_IMPORT_COMMIT: '/api/v1/contacts/bulk/import/commit'
    },
    
    // ==========================================
    // EMAIL TEMPLATE ENDPOINTS
    // ==========================================
    EMAIL_TEMPLATES: {
      LIST: '/api/v1/email-templates',
      BY_ID: (id) => `/api/v1/email-templates/${id}`,
      BY_TYPE: (type) => `/api/v1/email-templates/type/${type}`,
      DEFAULT: (type) => `/api/v1/email-templates/default/${type}`,
      PREVIEW: (id) => `/api/v1/email-templates/${id}/preview`
    },
    
    // ==========================================
    // REPUTATION ENDPOINTS
    // ==========================================
    REPUTATION: {
      BY_BUSINESS: (businessId) => `/api/v1/reputation/business/${businessId}`,
      BREAKDOWN: (businessId) => `/api/v1/reputation/business/${businessId}/breakdown`,
      DETAILED: (businessId) => `/api/v1/reputation/business/${businessId}/detailed`,
      RECALCULATE: (businessId) => `/api/v1/reputation/business/${businessId}/recalculate`,
      BATCH_RECALCULATE: '/api/v1/reputation/batch/recalculate'
    },
    
    // ==========================================
    // BILLING ENDPOINTS
    // ==========================================
    BILLING: {
      CHECKOUT_SESSION: '/api/v1/billing/checkout-session',
      PORTAL_SESSION: '/api/v1/billing/portal-session',
      SUBSCRIPTION: '/api/v1/billing/subscription',
      PLANS: '/api/v1/billing/plans',
      CHECK_ENTITLEMENT: '/api/v1/billing/check-entitlement',
      BUSINESS_STATUS: (businessId) => `/api/v1/billing/business/${businessId}/status`,
      WEBHOOK: '/api/v1/billing/webhook'
    },
    
    // ==========================================
    // CAMPAIGN ENDPOINTS
    // ==========================================
    CAMPAIGNS: {
      // Sequences
      SEQUENCES: '/api/v1/campaigns/sequences',
      SEQUENCE_BY_ID: (id) => `/api/v1/campaigns/sequences/${id}`,
      UPDATE_SEQUENCE: (id) => `/api/v1/campaigns/sequences/${id}`,
      DELETE_SEQUENCE: (id) => `/api/v1/campaigns/sequences/${id}`,
      ACTIVATE_SEQUENCE: (id) => `/api/v1/campaigns/sequences/${id}/activate`,
      DEACTIVATE_SEQUENCE: (id) => `/api/v1/campaigns/sequences/${id}/deactivate`,
      
      // Executions
      EXECUTIONS: '/api/v1/campaigns/executions',
      EXECUTION_BY_ID: (id) => `/api/v1/campaigns/executions/${id}`,
      STOP_EXECUTION: (id) => `/api/v1/campaigns/executions/${id}/stop`,
      
      // Analytics
      ANALYTICS: (sequenceId) => `/api/v1/campaigns/sequences/${sequenceId}/analytics`
    },
    
    // ==========================================
    // AUTOMATION ENDPOINTS
    // ==========================================
    AUTOMATION: {
      // Workflows
      WORKFLOWS: '/api/v1/automation/workflows',
      WORKFLOW_BY_ID: (id) => `/api/v1/automation/workflows/${id}`,
      FROM_TEMPLATE: '/api/v1/automation/workflows/from-template',
      UPDATE_WORKFLOW: (id) => `/api/v1/automation/workflows/${id}`,
      DELETE_WORKFLOW: (id) => `/api/v1/automation/workflows/${id}`,
      TOGGLE_WORKFLOW: (id) => `/api/v1/automation/workflows/${id}/toggle`,
      
      // Templates
      TEMPLATES: '/api/v1/automation/templates',
      TEMPLATE_BY_ID: (id) => `/api/v1/automation/templates/${id}`,
      
      // Executions
      EXECUTIONS: '/api/v1/automation/executions',
      EXECUTION_BY_ID: (id) => `/api/v1/automation/executions/${id}`,
      RETRY_EXECUTION: (id) => `/api/v1/automation/executions/${id}/retry`,
      
      // Customer timeline
      CUSTOMER_TIMELINE: (customerId) => `/api/v1/automation/customers/${customerId}/timeline`,
      
      // Triggers
      TRIGGER_MANUAL: '/api/v1/automation/trigger/manual'
    },
    
    // ==========================================
    // WAITLIST ENDPOINTS
    // ==========================================
    WAITLIST: {
      ADD: '/api/v1/waitlist/add',
      COUNT: '/api/v1/waitlist/count'
    },
    
    // ==========================================
    // WEBHOOK ENDPOINTS (typically not called from frontend)
    // ==========================================
    WEBHOOKS: {
      EMAIL: {
        SENDGRID: '/api/v1/webhooks/email/sendgrid'
      },
      SMS: {
        STATUS: '/api/v1/webhooks/sms/status',
        DELIVERY: '/api/v1/webhooks/sms/delivery'
      }
    },
    
    // ==========================================
    // FILE SERVING ENDPOINTS
    // ==========================================
    FILES: {
      SERVE_LOGO: (filename) => `/api/v1/files/logos/${filename}`
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