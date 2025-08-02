// Enhanced JWT security utilities
import logger from './logger';

// JWT token security improvements
export const JWT_CONFIG = {
  // Token expiry buffer (refresh 5 minutes before expiry)
  REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Maximum token age (for additional security)
  MAX_TOKEN_AGE: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Parse JWT payload safely
export const parseJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    logger.error('Failed to parse JWT:', error);
    return null;
  }
};

// Check if token is expired or about to expire
export const isTokenExpired = (token, bufferMs = JWT_CONFIG.REFRESH_BUFFER) => {
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  
  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return currentTime >= (expiryTime - bufferMs);
};

// Check if token is too old (additional security check)
export const isTokenTooOld = (token) => {
  const payload = parseJWT(token);
  if (!payload || !payload.iat) return true;
  
  const issuedTime = payload.iat * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return (currentTime - issuedTime) > JWT_CONFIG.MAX_TOKEN_AGE;
};

// Validate token structure and basic security checks
export const validateToken = (token) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Invalid token format' };
  }
  
  // Check token structure
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, reason: 'Invalid JWT structure' };
  }
  
  // Parse payload
  const payload = parseJWT(token);
  if (!payload) {
    return { valid: false, reason: 'Invalid JWT payload' };
  }
  
  // Check required fields
  if (!payload.exp || !payload.iat) {
    return { valid: false, reason: 'Missing required JWT fields' };
  }
  
  // Check if expired
  if (isTokenExpired(token, 0)) { // No buffer for validation
    return { valid: false, reason: 'Token expired' };
  }
  
  // Check if token is too old
  if (isTokenTooOld(token)) {
    return { valid: false, reason: 'Token too old' };
  }
  
  return { valid: true, payload };
};

// Secure token storage helpers (preparation for httpOnly cookies)
export const TokenStorage = {
  // Current localStorage implementation (to be replaced with httpOnly cookies)
  get: () => {
    try {
      return localStorage.getItem('token');
    } catch (error) {
      logger.error('Failed to get token from storage:', error);
      return null;
    }
  },
  
  set: (token) => {
    try {
      if (!token) {
        TokenStorage.remove();
        return;
      }
      
      // Validate token before storing
      const validation = validateToken(token);
      if (!validation.valid) {
        logger.error('Attempted to store invalid token:', validation.reason);
        return false;
      }
      
      localStorage.setItem('token', token);
      return true;
    } catch (error) {
      logger.error('Failed to store token:', error);
      return false;
    }
  },
  
  remove: () => {
    try {
      localStorage.removeItem('token');
    } catch (error) {
      logger.error('Failed to remove token from storage:', error);
    }
  },
  
  // Check if stored token is valid
  isValid: () => {
    const token = TokenStorage.get();
    if (!token) return false;
    
    const validation = validateToken(token);
    if (!validation.valid) {
      // Auto-cleanup invalid tokens
      TokenStorage.remove();
      return false;
    }
    
    return true;
  }
};

// Security headers for API requests
export const getSecureHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
    // Security headers
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  if (token) {
    const validation = validateToken(token);
    if (validation.valid) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      logger.warn('Attempted to use invalid token for API request');
    }
  }
  
  return headers;
};