/**
 * Production Configuration for Hygraph API Optimization
 * This file contains all production-specific settings and constants
 */

// Performance thresholds for production monitoring
export const PERFORMANCE_CONFIG = {
  // API call timing thresholds (in milliseconds)
  SLOW_QUERY_THRESHOLD: 3000, // Queries slower than 3s are flagged
  TIMEOUT_THRESHOLD: 15000, // Timeout requests after 15s
  RETRY_DELAY: 1000, // Wait 1s between retries
  MAX_RETRIES: 2, // Maximum retry attempts

  // Cache configuration
  CACHE_TTL: {
    CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
    FEATURED_POSTS: 30 * 60 * 1000, // 30 minutes
    RECENT_POSTS: 15 * 60 * 1000, // 15 minutes
    POST_DETAILS: 60 * 60 * 1000, // 1 hour
    IMAGES: 48 * 60 * 60 * 1000, // 48 hours
  },

  // Pagination limits
  MAX_POSTS_PER_PAGE: 50, // Maximum posts per API call
  DEFAULT_PAGE_SIZE: 12, // Default page size
  INFINITE_SCROLL_SIZE: 5, // Posts loaded per infinite scroll

  // Request deduplication
  ENABLE_REQUEST_DEDUP: true, // Enable request deduplication
  DEDUP_CLEANUP_INTERVAL: 30000, // Clean up dedupe cache every 30s

  // Monitoring and analytics
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === "development",
  LOG_SLOW_QUERIES: true,
  TRACK_CACHE_HIT_RATE: true,
};

// API endpoint priorities (CDN first, Content API as fallback)
export const API_PRIORITY = ["CDN_API", "CONTENT_API", "CACHED_DATA"];

// Image optimization settings
export const IMAGE_CONFIG = {
  QUALITY: 85, // Image quality (0-100)
  FORMAT: "webp", // Preferred format
  AUTO_OPTIMIZE: true, // Enable auto optimization
  LAZY_LOADING: true, // Enable lazy loading
  PRELOAD_ABOVE_FOLD: 3, // Preload first 3 images

  // Size configurations
  FEATURED_IMAGE: { width: 800, height: 600 },
  THUMBNAIL: { width: 400, height: 300 },
  AUTHOR_PHOTO: { width: 150, height: 150 },
};

// Error handling configuration
export const ERROR_CONFIG = {
  ENABLE_FALLBACKS: true, // Enable fallback data
  FALLBACK_TIMEOUT: 5000, // Timeout for fallback attempts
  STALE_WHILE_REVALIDATE: true, // Use stale data while fetching fresh
  GRACEFUL_DEGRADATION: true, // Show partial content on errors

  // Default fallback data
  FALLBACK_DATA: {
    categories: [
      { name: "Technology", slug: "technology" },
      { name: "Web Development", slug: "web-development" },
      { name: "Programming", slug: "programming" },
    ],
    posts: [],
    featuredPosts: [],
  },
};

// Security and rate limiting
export const SECURITY_CONFIG = {
  ALLOWED_ORIGINS: [
    "https://blog.urtechy.com",
    "https://www.blog.urtechy.com",
    "https://urtechy.com",
    "https://www.urtechy.com",
    ...(process.env.NODE_ENV === "development"
      ? ["http://localhost:3000", "http://localhost:3001"]
      : []),
  ],

  // Request validation
  VALIDATE_QUERY_COMPLEXITY: true,
  MAX_QUERY_DEPTH: 5,
  MAX_QUERY_FIELDS: 30,

  // Headers
  SECURITY_HEADERS: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
};

// Development vs Production settings
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  return {
    ENABLE_DEBUG_LOGGING: isDevelopment,
    ENABLE_PERFORMANCE_LOGS: isDevelopment,
    ENABLE_API_MONITOR: isDevelopment,
    CACHE_DEBUGGING: isDevelopment,
    STRICT_ERROR_HANDLING: !isDevelopment,

    // Adjust timeouts for development
    API_TIMEOUT: isDevelopment ? 30000 : 15000,
    CACHE_TTL_MULTIPLIER: isDevelopment ? 0.1 : 1.0, // Shorter cache in dev
  };
};

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  ENABLE_OPTIMIZED_HOMEPAGE: true,
  ENABLE_REQUEST_DEDUPLICATION: true,
  ENABLE_IMAGE_OPTIMIZATION: true,
  ENABLE_STALE_WHILE_REVALIDATE: true,
  ENABLE_PERFORMANCE_MONITORING: process.env.NODE_ENV === "development",
  ENABLE_APOLLO_CLIENT_FALLBACK: false, // Disable Apollo fallback in production
};

// Export all configurations
export default {
  PERFORMANCE_CONFIG,
  API_PRIORITY,
  IMAGE_CONFIG,
  ERROR_CONFIG,
  SECURITY_CONFIG,
  FEATURE_FLAGS,
  getEnvironmentConfig,
};
