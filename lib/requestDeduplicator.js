/**
 * Request deduplication service to prevent multiple identical API calls
 * This prevents the same Hygraph query from being executed multiple times simultaneously
 */

class RequestDeduplicator {
  constructor() {
    this.inFlightRequests = new Map();
    this.requestCounters = new Map();
  }

  /**
   * Execute a request with deduplication
   * @param {string} key - Unique key for the request
   * @param {Function} requestFn - The async function to execute
   * @returns {Promise} - The request result
   */
  async execute(key, requestFn) {
    // Increment request counter for monitoring
    this.requestCounters.set(key, (this.requestCounters.get(key) || 0) + 1);
    
    // If request is already in flight, return the existing promise
    if (this.inFlightRequests.has(key)) {
      console.log(`🔄 [RequestDedup] Reusing in-flight request: ${key}`);
      return this.inFlightRequests.get(key);
    }

    // Create new request promise
    const requestPromise = requestFn()
      .then(result => {
        console.log(`✅ [RequestDedup] Completed: ${key}`);
        return result;
      })
      .catch(error => {
        console.error(`❌ [RequestDedup] Failed: ${key}`, error);
        throw error;
      })
      .finally(() => {
        // Clean up the in-flight request
        this.inFlightRequests.delete(key);
      });

    // Store the promise
    this.inFlightRequests.set(key, requestPromise);
    
    console.log(`🚀 [RequestDedup] Started new request: ${key}`);
    return requestPromise;
  }

  /**
   * Get statistics about request deduplication
   * @returns {Object} - Stats object
   */
  getStats() {
    return {
      inFlightRequests: this.inFlightRequests.size,
      totalRequests: Array.from(this.requestCounters.values()).reduce((sum, count) => sum + count, 0),
      uniqueRequests: this.requestCounters.size,
      requestBreakdown: Object.fromEntries(this.requestCounters)
    };
  }

  /**
   * Clear all in-flight requests (useful for cleanup)
   */
  clear() {
    this.inFlightRequests.clear();
    this.requestCounters.clear();
  }
}

// Create global instance
const requestDeduplicator = new RequestDeduplicator();

// Helper to generate cache keys for common operations
export const generateRequestKey = (type, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  return `${type}:${JSON.stringify(sortedParams)}`;
};

export { requestDeduplicator };
export default requestDeduplicator;