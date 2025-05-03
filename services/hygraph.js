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
const CACHE_TTL = 60 * 60 * 1000; // 60 minutes in milliseconds (increased from 15 minutes)
const IMAGE_CACHE_TTL = 48 * 60 * 60 * 1000; // 48 hours for images (increased from 24 hours)
const CATEGORY_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours for categories

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

// Helper function to check if a query is for categories
const isCategoryQuery = (query) => {
  return query.includes("categories") && !query.includes("post");
};

// Helper function to determine appropriate cache TTL based on query content
const getCacheTTL = (query) => {
  if (isImageQuery(query)) return IMAGE_CACHE_TTL;
  if (isCategoryQuery(query)) return CATEGORY_CACHE_TTL;
  return CACHE_TTL;
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

  // Determine appropriate cache TTL based on query content
  const isImageRelated = isImageQuery(query);
  const cacheTTL = getCacheTTL(query);

  // Check cache if enabled
  if (useCache && cache.has(cacheKey)) {
    const cachedData = cache.get(cacheKey);
    if (cachedData.expiry > Date.now()) {
      // Log cache hit for debugging
      console.log(`Cache hit for query: ${cacheKey.substring(0, 50)}...`);
      return cachedData.data;
    } else {
      // Remove expired cache entry
      console.log(`Cache expired for query: ${cacheKey.substring(0, 50)}...`);
      cache.delete(cacheKey);
    }
  } else if (useCache) {
    console.log(`Cache miss for query: ${cacheKey.substring(0, 50)}...`);
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Only add timestamp for dynamic content that needs to be fresh
    // For static content like images and categories, don't add timestamp to leverage CDN caching
    const shouldAddTimestamp = !isImageRelated && !isCategoryQuery(query);

    const timestampedVariables = shouldAddTimestamp
      ? {
          ...variables,
          _timestamp: Date.now(), // Add timestamp only for dynamic content
        }
      : variables; // Use original variables for static content

    const result = await cdnClient.request(query, timestampedVariables);
    clearTimeout(timeoutId);

    // Optimize image URLs in the response if needed
    const optimizedResult = isImageRelated ? optimizeImageUrls(result) : result;

    // Store in cache if caching is enabled
    if (useCache) {
      cache.set(cacheKey, {
        data: optimizedResult,
        expiry: Date.now() + cacheTTL,
        timestamp: Date.now(), // Store when this was cached
      });
      console.log(
        `Cached result for ${
          cacheTTL / 1000 / 60
        } minutes: ${cacheKey.substring(0, 50)}...`
      );
    }

    return optimizedResult;
  } catch (error) {
    console.error("Error fetching from Hygraph CDN:", error);

    // Check if we have a cached version we can use as fallback, even if expired
    if (useCache && cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      // Use expired cache data as fallback if it's not too old (less than 2x the TTL)
      if (cachedData.expiry > Date.now() - cacheTTL) {
        console.log(
          `Using slightly expired cache as fallback for: ${cacheKey.substring(
            0,
            50
          )}...`
        );
        return cachedData.data;
      }
    }

    // If CDN fails and no usable cache, try the content API as fallback
    try {
      console.log("Falling back to Content API due to CDN failure");

      // Same timestamp logic as above
      const shouldAddTimestamp = !isImageRelated && !isCategoryQuery(query);

      const timestampedVariables = shouldAddTimestamp
        ? {
            ...variables,
            _timestamp: Date.now(),
          }
        : variables;

      const result = await contentClient.request(query, timestampedVariables);

      // Optimize image URLs in the response if needed
      const optimizedResult = isImageRelated
        ? optimizeImageUrls(result)
        : result;

      // Store in cache if caching is enabled
      if (useCache) {
        cache.set(cacheKey, {
          data: optimizedResult,
          expiry: Date.now() + cacheTTL,
          timestamp: Date.now(),
          source: "content-api", // Mark this as coming from content API
        });
        console.log(
          `Cached content API result for ${
            cacheTTL / 1000 / 60
          } minutes: ${cacheKey.substring(0, 50)}...`
        );
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

// Cache debugging and management utilities
export const getCacheStats = () => {
  const now = Date.now();
  const stats = {
    totalEntries: cache.size,
    validEntries: 0,
    expiredEntries: 0,
    imageEntries: 0,
    categoryEntries: 0,
    otherEntries: 0,
    averageAge: 0,
    oldestEntry: 0,
    newestEntry: now,
  };

  let totalAge = 0;
  let oldestTimestamp = now;
  let newestTimestamp = 0;

  cache.forEach((value, key) => {
    const isValid = value.expiry > now;
    if (isValid) {
      stats.validEntries++;
    } else {
      stats.expiredEntries++;
    }

    // Categorize by entry type
    if (key.includes("featuredImage") || key.includes("photo")) {
      stats.imageEntries++;
    } else if (key.includes("categories") && !key.includes("post")) {
      stats.categoryEntries++;
    } else {
      stats.otherEntries++;
    }

    // Track age statistics
    if (value.timestamp) {
      const age = now - value.timestamp;
      totalAge += age;

      if (value.timestamp < oldestTimestamp) {
        oldestTimestamp = value.timestamp;
      }

      if (value.timestamp > newestTimestamp) {
        newestTimestamp = value.timestamp;
      }
    }
  });

  if (cache.size > 0) {
    stats.averageAge = totalAge / cache.size;
    stats.oldestEntry = now - oldestTimestamp;
    stats.newestEntry = now - newestTimestamp;
  }

  return stats;
};

export const clearCache = () => {
  const size = cache.size;
  cache.clear();
  console.log(`Cache cleared. ${size} entries removed.`);
  return size;
};

export const pruneExpiredCache = () => {
  const now = Date.now();
  let pruned = 0;

  cache.forEach((value, key) => {
    if (value.expiry <= now) {
      cache.delete(key);
      pruned++;
    }
  });

  console.log(`Cache pruned. ${pruned} expired entries removed.`);
  return pruned;
};

// Export gql for convenience
export { gql };
