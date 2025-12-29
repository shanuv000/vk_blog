/**
 * Lightweight Date Utilities
 * 
 * Replaces moment.js (~70KB) with native JavaScript Date APIs.
 * Provides consistent date formatting across the application.
 */

/**
 * Format a date string to a readable format
 * 
 * @param {string|Date|null} dateInput - Date string, Date object, or null
 * @param {('short'|'long'|'full')} format - Output format
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate('2024-12-29') // "Dec 29"
 * formatDate('2024-12-29', 'long') // "Dec 29, 2024"
 * formatDate('2024-12-29', 'full') // "December 29, 2024"
 */
export const formatDate = (dateInput, format = 'long') => {
  if (!dateInput) return 'No date';
  
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    // Check for invalid date
    if (isNaN(date.getTime())) return 'No date';
    
    const options = {
      short: { month: 'short', day: 'numeric' },
      long: { month: 'short', day: 'numeric', year: 'numeric' },
      full: { month: 'long', day: 'numeric', year: 'numeric' },
    };
    
    return date.toLocaleDateString('en-US', options[format] || options.long);
  } catch {
    return 'No date';
  }
};

/**
 * Check if a date is after another date
 * 
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date (defaults to now)
 * @returns {boolean} True if date1 is after date2
 */
export const isAfter = (date1, date2 = new Date()) => {
  if (!date1) return false;
  try {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    return d1 > d2;
  } catch {
    return false;
  }
};

/**
 * Check if a date is before another date
 * 
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date (defaults to now)
 * @returns {boolean} True if date1 is before date2
 */
export const isBefore = (date1, date2 = new Date()) => {
  if (!date1) return false;
  try {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    return d1 < d2;
  } catch {
    return false;
  }
};

/**
 * Get the smart display date for a post
 * Uses publishedAt unless it's in the future, then falls back to createdAt
 * 
 * @param {Object} post - Post object with publishedAt and createdAt properties
 * @param {('short'|'long'|'full')} format - Output format
 * @returns {string} Formatted date string
 */
export const getPostDisplayDate = (post, format = 'long') => {
  if (!post) return 'No date';
  
  const { publishedAt, createdAt } = post;
  const now = new Date();
  
  // If publishedAt exists and is not in the future, use it
  if (publishedAt) {
    const pubDate = new Date(publishedAt);
    if (pubDate <= now) {
      return formatDate(pubDate, format);
    }
  }
  
  // Fall back to createdAt, or use publishedAt even if in future
  return formatDate(createdAt || publishedAt, format);
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * 
 * @param {string|Date} dateInput - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  } catch {
    return '';
  }
};

/**
 * Format date for schema/SEO (ISO 8601)
 * 
 * @param {string|Date} dateInput - Date to format
 * @returns {string} ISO 8601 formatted date
 */
export const toISOString = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toISOString();
  } catch {
    return '';
  }
};

export default {
  formatDate,
  isAfter,
  isBefore,
  getPostDisplayDate,
  getRelativeTime,
  toISOString,
};
