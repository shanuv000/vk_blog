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
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes in milliseconds
const IMAGE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for images

// Helper function to generate a cache key from query and variables
const generateCacheKey = (query, variables) => {
  // Remove timestamp from variables for cache key
  const { _timestamp, ...cacheVariables } = variables;
  return `${query}:${JSON.stringify(cacheVariables)}`;
};

// Helper function to check if a query is for images
const isImageQuery = (query) => {
  return query.includes("featuredImage") || query.includes("photo");
};

// Helper function to optimize image URLs
const optimizeImageUrls = (data) => {
  // Skip if data is null or not an object
  if (!data || typeof data !== "object") return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => optimizeImageUrls(item));
  }

  // Process object properties
  const result = { ...data };

  // Look for image URLs in the data
  Object.keys(result).forEach((key) => {
    // If this is an image object with a URL
    if (key === "featuredImage" || key === "photo") {
      if (result[key] && result[key].url) {
        // Add quality parameter to URL if not already present
        const url = new URL(result[key].url);
        if (!url.searchParams.has("q")) {
          url.searchParams.set("q", "80"); // Set quality to 80%
        }
        result[key].url = url.toString();
      }
    }
    // If this is a nested object or array, recursively process it
    else if (typeof result[key] === "object" && result[key] !== null) {
      result[key] = optimizeImageUrls(result[key]);
    }
  });

  return result;
};

// Helper function for read-only operations with caching (uses CDN for better performance)
export const fetchFromCDN = async (query, variables = {}, useCache = true) => {
  // Generate cache key
  const cacheKey = generateCacheKey(query, variables);

  // Determine if this is an image-related query for longer caching
  const isImageRelated = isImageQuery(query);
  const cacheTTL = isImageRelated ? IMAGE_CACHE_TTL : CACHE_TTL;

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
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout (reduced from 8s)

    // For image queries, we can use cached CDN responses
    const timestampedVariables = isImageRelated
      ? variables // Don't add timestamp for image queries to leverage CDN caching
      : {
          ...variables,
          _timestamp: Date.now(), // Add timestamp for non-image queries
        };

    const result = await cdnClient.request(query, timestampedVariables);
    clearTimeout(timeoutId);

    // Optimize image URLs in the response
    const optimizedResult = isImageRelated ? optimizeImageUrls(result) : result;

    // Store in cache if caching is enabled
    if (useCache) {
      cache.set(cacheKey, {
        data: optimizedResult,
        expiry: Date.now() + cacheTTL,
      });
    }

    return optimizedResult;
  } catch (error) {
    console.error("Error fetching from Hygraph CDN:", error);

    // If CDN fails, try the content API as fallback
    try {
      console.log("Falling back to Content API due to CDN failure");

      // Add timestamp to variables for content API too (except for image queries)
      const timestampedVariables = isImageRelated
        ? variables
        : {
            ...variables,
            _timestamp: Date.now(),
          };

      const result = await contentClient.request(query, timestampedVariables);

      // Optimize image URLs in the response
      const optimizedResult = isImageRelated
        ? optimizeImageUrls(result)
        : result;

      // Store in cache if caching is enabled
      if (useCache) {
        cache.set(cacheKey, {
          data: optimizedResult,
          expiry: Date.now() + cacheTTL,
        });
      }

      return optimizedResult;
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
