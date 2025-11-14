/**
 * Enhanced cache manager for Hygraph data
 * Provides persistent caching with localStorage on client-side
 * and memory cache on server-side
 */

// Cache TTL constants (in milliseconds)
const DEFAULT_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const IMAGE_CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours
const CATEGORY_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
const POST_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
const FEATURED_POSTS_TTL = 30 * 60 * 1000; // 30 minutes

// In-memory cache for server-side
const memoryCache = new Map();

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Helper to determine cache TTL based on query content
const getCacheTTL = (query = '') => {
  if (!query) {return DEFAULT_CACHE_TTL;}
  
  const queryString = typeof query === 'string' ? query : query.toString();
  
  if (queryString.includes('featuredImage') || queryString.includes('photo')) {
    return IMAGE_CACHE_TTL;
  }
  
  if (queryString.includes('GetFeaturedPosts') || queryString.includes('featuredpost: true')) {
    return FEATURED_POSTS_TTL;
  }
  
  if (queryString.includes('categories') && !queryString.includes('post')) {
    return CATEGORY_CACHE_TTL;
  }
  
  if (queryString.includes('GetPostDetails') || queryString.includes('post(where:')) {
    return POST_CACHE_TTL;
  }
  
  return DEFAULT_CACHE_TTL;
};

// Generate a cache key from query and variables
const generateCacheKey = (query, variables = {}) => {
  // Remove timestamp from variables for cache key
  const { _timestamp, ...cacheVariables } = variables;
  
  // Create a prefix based on query type for better organization
  let prefix = 'query';
  
  if (typeof query === 'string') {
    if (query.includes('GetPostDetails')) {prefix = 'post';}
    else if (query.includes('GetCategories')) {prefix = 'categories';}
    else if (query.includes('GetFeaturedPosts')) {prefix = 'featured';}
    else if (query.includes('GetRecentPosts')) {prefix = 'recent';}
  }
  
  return `hygraph:${prefix}:${query}:${JSON.stringify(cacheVariables)}`;
};

// Set cache item (works in both browser and server)
const setCacheItem = (key, data, ttl) => {
  const now = Date.now();
  const item = {
    data,
    expiry: now + ttl,
    timestamp: now
  };
  
  // For browser, use localStorage with fallback to memory
  if (isBrowser) {
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      // If localStorage fails (quota exceeded, etc.), use memory cache
      console.warn('localStorage cache failed, using memory cache:', e.message);
      memoryCache.set(key, item);
    }
  } else {
    // For server, use memory cache
    memoryCache.set(key, item);
  }
  
  return item;
};

// Get cache item (works in both browser and server)
const getCacheItem = (key) => {
  // For browser, try localStorage first
  if (isBrowser) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      // If localStorage fails, try memory cache
      console.warn('localStorage get failed, trying memory cache:', e.message);
      return memoryCache.get(key);
    }
  } else {
    // For server, use memory cache
    return memoryCache.get(key);
  }
};

// Check if cache item exists and is valid
const hasCacheItem = (key) => {
  const item = getCacheItem(key);
  return item && item.expiry > Date.now();
};

// Delete cache item
const deleteCacheItem = (key) => {
  if (isBrowser) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage remove failed:', e.message);
    }
  }
  
  return memoryCache.delete(key);
};

// Clear all cache
const clearCache = () => {
  if (isBrowser) {
    try {
      // Only clear Hygraph-related items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hygraph:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('localStorage clear failed:', e.message);
    }
  }
  
  // Clear memory cache
  memoryCache.clear();
};

// Get cache stats
const getCacheStats = () => {
  const now = Date.now();
  const stats = {
    totalEntries: 0,
    validEntries: 0,
    expiredEntries: 0,
    browserEntries: 0,
    memoryEntries: memoryCache.size,
    averageAge: 0,
  };
  
  let totalAge = 0;
  const entries = [];
  
  // Get memory cache entries
  memoryCache.forEach((value, key) => {
    entries.push({ key, value, source: 'memory' });
  });
  
  // Get localStorage entries if in browser
  if (isBrowser) {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('hygraph:')) {
          const value = JSON.parse(localStorage.getItem(key));
          entries.push({ key, value, source: 'localStorage' });
          stats.browserEntries++;
        }
      });
    } catch (e) {
      console.warn('Error reading localStorage for stats:', e.message);
    }
  }
  
  // Process all entries
  entries.forEach(({ value }) => {
    stats.totalEntries++;
    
    if (value.expiry > now) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }
    
    if (value.timestamp) {
      totalAge += (now - value.timestamp);
    }
  });
  
  if (stats.totalEntries > 0) {
    stats.averageAge = totalAge / stats.totalEntries;
  }
  
  return stats;
};

export {
  setCacheItem,
  getCacheItem,
  hasCacheItem,
  deleteCacheItem,
  clearCache,
  getCacheStats,
  generateCacheKey,
  getCacheTTL
};
