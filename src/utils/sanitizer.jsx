// HTML sanitization utility for safe rendering
// This provides basic XSS protection by escaping HTML characters

export const sanitizeHtml = (content) => {
  if (!content) return '';
  
  // Convert to string and escape HTML characters
  const str = content.toString();
  
  // Basic HTML entity escaping
  const escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  // Convert newlines to <br> tags safely
  return escaped.replace(/\n/g, '<br>');
};

// For cases where we need to preserve basic formatting but still sanitize
export const sanitizeBasicHtml = (content) => {
  if (!content) return '';
  
  const str = content.toString();
  
  // Allow only basic tags: br, p, strong, em
  const allowedTags = /<\/?(?:br|p|strong|em|b|i)\s*\/?>/gi;
  
  // First escape all HTML
  let escaped = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Then restore allowed tags
  escaped = escaped.replace(/&lt;(\/?(?:br|p|strong|em|b|i))\s*\/?&gt;/gi, '<$1>');
  
  // Convert newlines to <br> if no <br> or <p> tags present
  if (!/<br|<p/i.test(escaped)) {
    escaped = escaped.replace(/\n/g, '<br>');
  }
  
  return escaped;
};

// Safe text-only rendering (no HTML at all)
export const renderTextOnly = (content) => {
  if (!content) return '';
  
  return content
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// ✅ NEW: For email template previews - allows trusted HTML to render
export const sanitizeEmailTemplate = (content) => {
  if (!content) return '';
  
  const str = content.toString();
  
  // For email templates, we trust the content since it comes from our backend
  // Just do basic cleanup but preserve the HTML structure
  
  // Remove any script tags for basic security
  let cleaned = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove any onclick, onload, etc. event handlers
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: links
  cleaned = cleaned.replace(/javascript:/gi, '');
  
  // Otherwise, preserve the HTML structure for proper email rendering
  return cleaned;
};

// ✅ NEW: For completely trusted content (like your own email templates)
export const renderTrustedHtml = (content) => {
  if (!content) return '';
  
  // For your own email templates, no sanitization needed
  // This is the safest for previewing your own templates
  return content.toString();
};