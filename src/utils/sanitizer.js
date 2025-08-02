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