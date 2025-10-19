/**
 * Request Deduplication Layer
 *
 * Prevents duplicate API requests by caching pending promises.
 * If the same request is made while one is already in-flight,
 * it returns the existing promise instead of making a new request.
 *
 * This is especially useful for GraphQL queries that might be
 * triggered multiple times during component mounting.
 */

// Store pending requests
const pendingRequests = new Map();

// Store completed requests temporarily (short-lived cache)
const completedRequests = new Map();

// Configuration
const CONFIG = {
  // How long to keep completed requests in cache (ms)
  COMPLETED_CACHE_TTL: 5000, // 5 seconds

  // Enable debug logging
  DEBUG: process.env.NODE_ENV === "development",
};

/**
 * Deduplicate async function calls
 *
 * @param {string} key - Unique identifier for the request
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Configuration options
 * @returns {Promise} - The deduplicated promise
 */
export const deduplicate = async (key, fn, options = {}) => {
  const { ttl = CONFIG.COMPLETED_CACHE_TTL, debug = CONFIG.DEBUG } = options;

  // Check if we have a recent completed request
  const completed = completedRequests.get(key);
  if (completed && completed.expiry > Date.now()) {
    if (debug) {
      console.log(`[Dedup] Cache hit: ${key}`);
    }
    return completed.data;
  }

  // Check if same request is already pending
  if (pendingRequests.has(key)) {
    if (debug) {
      console.log(`[Dedup] Returning pending request: ${key}`);
    }
    return pendingRequests.get(key);
  }

  // Execute the function and cache the promise
  if (debug) {
    console.log(`[Dedup] New request: ${key}`);
  }

  const promise = fn()
    .then((result) => {
      // Cache the completed request
      completedRequests.set(key, {
        data: result,
        expiry: Date.now() + ttl,
      });

      // Schedule cleanup of completed cache
      setTimeout(() => {
        completedRequests.delete(key);
      }, ttl);

      return result;
    })
    .finally(() => {
      // Remove from pending requests
      pendingRequests.delete(key);
    });

  // Store in pending requests
  pendingRequests.set(key, promise);

  return promise;
};

/**
 * Clear all pending and completed requests
 */
export const clearDeduplicationCache = () => {
  pendingRequests.clear();
  completedRequests.clear();

  if (CONFIG.DEBUG) {
    console.log("[Dedup] Cache cleared");
  }
};

/**
 * Get deduplication statistics
 *
 * @returns {Object} - Statistics about pending and completed requests
 */
export const getDeduplicationStats = () => {
  return {
    pending: pendingRequests.size,
    completed: completedRequests.size,
    pendingKeys: Array.from(pendingRequests.keys()),
    completedKeys: Array.from(completedRequests.keys()),
  };
};

/**
 * Generate a cache key from query and variables
 *
 * @param {string} operation - GraphQL operation name or identifier
 * @param {Object} variables - Query variables
 * @returns {string} - Unique cache key
 */
export const generateDeduplicationKey = (operation, variables = {}) => {
  // Sort variables for consistent key generation
  const sortedVars = Object.keys(variables)
    .sort()
    .reduce((acc, key) => {
      acc[key] = variables[key];
      return acc;
    }, {});

  return `${operation}:${JSON.stringify(sortedVars)}`;
};

/**
 * HOC for deduplicating API service functions
 *
 * @param {Function} serviceFn - The service function to wrap
 * @param {string} operationName - Name for the operation
 * @returns {Function} - Wrapped function with deduplication
 */
export const withDeduplication = (serviceFn, operationName) => {
  return async (...args) => {
    // Generate key from operation name and arguments
    const key = generateDeduplicationKey(operationName, args);

    // Execute with deduplication
    return deduplicate(key, () => serviceFn(...args));
  };
};

export default {
  deduplicate,
  clearDeduplicationCache,
  getDeduplicationStats,
  generateDeduplicationKey,
  withDeduplication,
};
