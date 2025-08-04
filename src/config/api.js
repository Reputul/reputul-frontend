// Centralized API configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE ||
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
      LIST: '/api/businesses',
      BY_ID: (id) => `/api/businesses/${id}`,
      REVIEW_SUMMARY: (id) => `/api/businesses/${id}/review-summary`
    },
    
    // Review endpoints
    REVIEWS: {
      BY_BUSINESS: (id) => `/api/reviews/business/${id}`,
      REQUEST: '/api/reviews/request',
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

// Export endpoints for easy access
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;
export const API_BASE_URL = API_CONFIG.BASE_URL;

export default API_CONFIG;