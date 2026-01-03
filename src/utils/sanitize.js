import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks
 * Uses DOMPurify to clean HTML/JS and trims whitespace
 * 
 * @param {string} input - The raw user input
 * @param {number} maxLength - Maximum allowed length (optional)
 * @param {object} options - DOMPurify configuration options
 * @returns {string} - Sanitized and trimmed string
 */
export const sanitizeInput = (input, maxLength = null, options = {}) => {
  if (!input) return '';
  
  // Trim whitespace
  let cleaned = String(input).trim();
  
  // Apply length limit if specified
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  // Sanitize with DOMPurify
  const defaultOptions = {
    ALLOWED_TAGS: [], // Strip all HTML tags by default
    ALLOWED_ATTR: [], // Strip all HTML attributes by default
    KEEP_CONTENT: true, // Keep text content
    ...options
  };
  
  return DOMPurify.sanitize(cleaned, defaultOptions);
};

/**
 * Sanitizes HTML content (allows some safe HTML tags)
 * Use this when you need to preserve formatting like <b>, <i>, <br>
 * 
 * @param {string} html - The HTML content to sanitize
 * @param {object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHTML = (html, options = {}) => {
  if (!html) return '';
  
  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['class'],
    ...options
  };
  
  return DOMPurify.sanitize(html, defaultOptions);
};

/**
 * Validates and sanitizes email addresses
 * 
 * @param {string} email - The email to validate
 * @returns {string|null} - Sanitized email or null if invalid
 */
export const sanitizeEmail = (email) => {
  if (!email) return null;
  
  const cleaned = sanitizeInput(email, 254); // Max email length per RFC
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(cleaned) ? cleaned : null;
};

/**
 * Sanitizes and validates phone numbers
 * 
 * @param {string} phone - The phone number to validate
 * @returns {string|null} - Sanitized phone or null if invalid
 */
export const sanitizePhone = (phone) => {
  if (!phone) return null;
  
  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  
  // Basic validation: should be between 7-15 digits (international standard)
  const phoneRegex = /^\+?\d{7,15}$/;
  
  return phoneRegex.test(cleaned) ? cleaned : null;
};

/**
 * Sanitizes URLs to prevent javascript: and data: protocol attacks
 * 
 * @param {string} url - The URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeURL = (url) => {
  if (!url) return null;
  
  const cleaned = sanitizeInput(url, 2048); // Max URL length
  
  try {
    const parsed = new URL(cleaned);
    // Only allow http, https, and mailto protocols
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (e) {
    // Invalid URL
  }
  
  return null;
};
