import axios from 'axios';
import { buildUrl, API_ENDPOINTS } from '../config/api';

// Get authentication token from localStorage (matching your existing pattern)
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : null;
};

// Create axios instance with default config
const api = axios.create({
  timeout: 30000, // 30 second timeout for imports
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// Contact API endpoints
export const contactsApi = {
  // Get all contacts with search/filter/pagination
  getContacts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('query', params.query);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) queryParams.append('sort', params.sort);
    
    const url = buildUrl('/api/contacts') + (queryParams.toString() ? `?${queryParams}` : '');
    return api.get(url);
  },

  // Get single contact
  getContact: (id) => {
    return api.get(buildUrl(`/api/contacts/${id}`));
  },

  // Create new contact  
  createContact: (contactData) => {
    return api.post(buildUrl('/api/contacts'), contactData);
  },

  // Update existing contact
  updateContact: (id, contactData) => {
    return api.put(buildUrl(`/api/contacts/${id}`), contactData);
  },

  // Delete contact
  deleteContact: (id) => {
    return api.delete(buildUrl(`/api/contacts/${id}`));
  },

  // CSV Import - Prepare step
  prepareCsvImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(buildUrl('/api/contacts/bulk/import/prepare'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // CSV Import - Commit step
  commitCsvImport: (commitData) => {
    return api.post(buildUrl('/api/contacts/bulk/import/commit'), commitData);
  },

  // Export contacts to CSV
  exportContacts: (tag = null) => {
    const url = buildUrl('/api/contacts/export.csv') + (tag ? `?tag=${encodeURIComponent(tag)}` : '');
    return api.get(url, {
      responseType: 'blob', // Important for file download
    });
  },

  // Get contact statistics
  getContactStats: () => {
    return api.get(buildUrl('/api/contacts/stats'));
  },
};

// Utility functions for handling API responses
export const handleApiError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
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
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An unexpected error occurred';
};

// Download helper for CSV export
export const downloadCsvFile = (blob, filename = 'contacts_export.csv') => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default contactsApi;