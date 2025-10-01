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
    
    const url = buildUrl('/api/v1/contacts') + (queryParams.toString() ? `?${queryParams}` : '');
    return api.get(url);
  },

  // Get single contact
  getContact: (id) => {
    return api.get(buildUrl(`/api/v1/contacts/${id}`));
  },

  // Create new contact  
  createContact: (contactData) => {
    return api.post(buildUrl('/api/v1/contacts'), contactData);
  },

  // Update existing contact
  updateContact: (id, contactData) => {
    return api.put(buildUrl(`/api/v1/contacts/${id}`), contactData);
  },

  // Delete contact
  deleteContact: (id) => {
    return api.delete(buildUrl(`/api/v1/contacts/${id}`));
  },

  // CSV Import - Prepare step (matches backend /api/contacts/bulk/import/prepare)
  prepareCsvImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(buildUrl('/api/v1/contacts/bulk/import/prepare'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // CSV Import - Commit step (matches backend /api/v1/contacts/bulk/import/commit)
  commitCsvImport: (commitData) => {
    return api.post(buildUrl('/api/v1/contacts/bulk/import/commit'), commitData);
  },

  // Export contacts to CSV
  exportContacts: (tag = null) => {
    const url = buildUrl('/api/v1/contacts/export.csv') + (tag ? `?tag=${encodeURIComponent(tag)}` : '');
    return api.get(url, {
      responseType: 'blob', // Important for file download
    });
  },

  // Get contact statistics
  getContactStats: () => {
    return api.get(buildUrl('/api/v1/contacts/stats'));
  },
};

// CSV parsing utility for client-side preview
export const parseCSVPreview = (csvText, maxRows = 5) => {
  try {
    const lines = csvText.trim().split('\n');
    
    if (lines.length === 0) {
      return { headers: [], rows: [] };
    }
    
    // Parse headers (first line)
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
    const rows = [];
    const dataLines = lines.slice(1, Math.min(lines.length, maxRows + 1));
    
    for (const line of dataLines) {
      if (line.trim()) { // Skip empty lines
        const row = parseCSVLine(line);
        // Pad row to match headers length
        while (row.length < headers.length) {
          row.push('');
        }
        rows.push(row);
      }
    }
    
    return { headers, rows };
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error('Invalid CSV format');
  }
};

// Helper function to parse a single CSV line
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
      continue;
    } else {
      current += char;
    }
    
    i++;
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
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