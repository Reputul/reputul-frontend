// Input validation utilities for form security

// Email validation with comprehensive regex
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  
  // Comprehensive email regex that handles most edge cases
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  if (email.length > 254) {
    return { valid: false, message: 'Email address is too long' };
  }
  
  return { valid: true };
};

// Enhanced password validation
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  const checks = [
    { test: password.length >= 8, message: 'at least 8 characters' },
    { test: /[a-z]/.test(password), message: 'a lowercase letter' },
    { test: /[A-Z]/.test(password), message: 'an uppercase letter' },
    { test: /\d/.test(password), message: 'a number' },
    { test: /[^a-zA-Z\d]/.test(password), message: 'a special character' }
  ];
  
  const failedChecks = checks.filter(check => !check.test);
  
  if (failedChecks.length > 0) {
    return { 
      valid: false, 
      message: `Password must contain ${failedChecks.map(c => c.message).join(', ')}` 
    };
  }
  
  // Additional security checks
  if (password.length > 128) {
    return { valid: false, message: 'Password is too long (max 128 characters)' };
  }
  
  // Check for common weak patterns
  const weakPatterns = [
    /(.)\1{3,}/, // Same character repeated 4+ times
    /123456|password|qwerty|admin|letmein/i, // Common weak passwords
    /^[a-zA-Z]+$/, // Only letters
    /^\d+$/, // Only numbers
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      return { valid: false, message: 'Password is too weak. Please choose a stronger password.' };
    }
  }
  
  return { valid: true };
};

// Name validation
export const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 100) {
    return { valid: false, message: 'Name is too long (max 100 characters)' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes, and periods
  const nameRegex = /^[a-zA-Z\s\-'.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }
  
  return { valid: true };
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) return { valid: true }; // Phone is optional in many cases
  
  if (typeof phone !== 'string') {
    return { valid: false, message: 'Invalid phone number format' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { valid: false, message: 'Phone number must be 10-15 digits' };
  }
  
  return { valid: true };
};

// URL validation
export const validateUrl = (url) => {
  if (!url) return { valid: true }; // URL is optional in many cases
  
  if (typeof url !== 'string') {
    return { valid: false, message: 'Invalid URL format' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, message: 'URL must use HTTP or HTTPS protocol' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

// Sanitize text input to prevent XSS
export const sanitizeTextInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, (match) => {
      const map = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return map[match];
    });
};

// Validate and sanitize form data
export const validateAndSanitizeForm = (formData, validationRules) => {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, value] of Object.entries(formData)) {
    const rules = validationRules[field];
    
    if (!rules) {
      // No validation rules, just sanitize
      sanitizedData[field] = sanitizeTextInput(value);
      continue;
    }
    
    // Apply validation
    let isValid = true;
    let errorMessage = '';
    
    for (const rule of rules) {
      const result = rule(value);
      if (!result.valid) {
        isValid = false;
        errorMessage = result.message;
        break;
      }
    }
    
    if (!isValid) {
      errors[field] = errorMessage;
    } else {
      // Sanitize valid input
      sanitizedData[field] = sanitizeTextInput(value);
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Common validation rule sets
export const VALIDATION_RULES = {
  REGISTRATION: {
    name: [validateName],
    email: [validateEmail],
    password: [validatePassword]
  },
  
  LOGIN: {
    email: [validateEmail],
    password: [(password) => {
      if (!password) return { valid: false, message: 'Password is required' };
      return { valid: true };
    }]
  },
  
  BUSINESS: {
    name: [validateName],
    phone: [validatePhone],
    website: [validateUrl],
    email: [validateEmail]
  }
};