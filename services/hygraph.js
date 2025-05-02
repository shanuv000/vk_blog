import { GraphQLClient, gql } from "graphql-request";

// API endpoints
export const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
export const HYGRAPH_CDN_API = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;
export const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Create clients for different purposes
export const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API);

// Create an authenticated client if token is available
export const authClient = HYGRAPH_AUTH_TOKEN
  ? new GraphQLClient(HYGRAPH_CONTENT_API, {
      headers: {
        authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
      },
    })
  : contentClient; // Fallback to non-authenticated client

export const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);

// Simple in-memory cache implementation
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper function to generate a cache key from query and variables
const generateCacheKey = (query, variables) => {
  // Remove timestamp from variables for cache key
  const { _timestamp, ...cacheVariables } = variables;
  return `${query}:${JSON.stringify(cacheVariables)}`;
};

// Helper function for read-only operations with caching (uses CDN for better performance)
export const fetchFromCDN = async (query, variables = {}, useCache = true) => {
  // Generate cache key
  const cacheKey = generateCacheKey(query, variables);

  // Check cache if enabled
  if (useCache && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData.expiry > Date.now()) {
      return cachedData.data;
    } else {
      // Remove expired cache entry
      cache.delete(cacheKey);
    }
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Add a timestamp parameter to the variables to bypass CDN caching
    const timestampedVariables = {
      ...variables,
      _timestamp: Date.now(),
    };

    const result = await cdnClient.request(query, timestampedVariables);
    clearTimeout(timeoutId);

    // Store in cache if caching is enabled
    if (useCache) {
      cache.set(cacheKey, {
        data: result,
        expiry: Date.now() + CACHE_TTL,
      });
    }

    return result;
  } catch (error) {
    console.error("Error fetching from Hygraph CDN:", error);

    // If CDN fails, try the content API as fallback
    try {
      console.log("Falling back to Content API due to CDN failure");

      // Add timestamp to variables for content API too
      const timestampedVariables = {
        ...variables,
        _timestamp: Date.now(),
      };

      const result = await contentClient.request(query, timestampedVariables);

      // Store in cache if caching is enabled
      if (useCache) {
        cache.set(cacheKey, {
          data: result,
          expiry: Date.now() + CACHE_TTL,
        });
      }

      return result;
    } catch (fallbackError) {
      console.error("Fallback to Content API also failed:", fallbackError);
      throw error; // Throw the original error
    }
  }
};

// Helper function for operations that might include mutations (uses Content API)
export const fetchFromContentAPI = async (query, variables = {}) => {
  try {
    // Add a timestamp parameter to the variables to bypass caching
    const timestampedVariables = {
      ...variables,
      _timestamp: Date.now(),
    };

    const result = await contentClient.request(query, timestampedVariables);

    // Clear cache after mutations to ensure fresh data
    cache.clear();

    return result;
  } catch (error) {
    console.error("Error fetching from Hygraph Content API:", error);
    throw error;
  }
};

// Export gql for convenience
export { gql };
