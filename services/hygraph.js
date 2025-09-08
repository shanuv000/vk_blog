import { GraphQLClient, gql } from "graphql-request";
import {
  setCacheItem,
  getCacheItem,
  hasCacheItem,
  clearCache as clearCacheStorage,
  generateCacheKey,
  getCacheTTL,
} from "../lib/cache-manager";

// API endpoints
export const HYGRAPH_CONTENT_API = process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API;
export const HYGRAPH_CDN_API = process.env.NEXT_PUBLIC_HYGRAPH_CDN_API;
export const HYGRAPH_AUTH_TOKEN = process.env.HYGRAPH_AUTH_TOKEN;

// Determine if we're running in the browser
const isBrowser = typeof window !== "undefined";

// Create clients with optimized settings
const createClient = (endpoint, options = {}) => {
  return new GraphQLClient(endpoint, {
    timeout: 10000, // 10 second timeout
    retryCount: 2, // Retry failed requests twice
    retryDelay: 1000, // Wait 1 second between retries
    ...options,
  });
};

// Create clients for different purposes
export const contentClient = createClient(HYGRAPH_CONTENT_API);

// Create an authenticated client if token is available
export const authClient = HYGRAPH_AUTH_TOKEN
  ? createClient(HYGRAPH_CONTENT_API, {
      headers: {
        authorization: `Bearer ${HYGRAPH_AUTH_TOKEN}`,
      },
    })
  : contentClient; // Fallback to non-authenticated client

// For client-side requests, use our proxy API to avoid CORS issues
// For server-side requests, use the CDN API directly
export const cdnClient = isBrowser
  ? createClient("/api/hygraph-proxy", {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Client-Type": "browser",
      },
    })
  : createClient(HYGRAPH_CDN_API, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Client-Type": "server",
      },
    });

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
  const cacheTTL = getCacheTTL(query);
  const isImageRelated =
    query.includes("featuredImage") || query.includes("photo");

  // Implement stale-while-revalidate pattern
  let staleData = null;

  // Check cache if enabled
  if (useCache && hasCacheItem(cacheKey)) {
    const cachedItem = getCacheItem(cacheKey);

    if (cachedItem && cachedItem.data) {
      if (cachedItem.expiry > Date.now()) {
        // Valid cache hit
        console.log(`Cache hit for query: ${cacheKey.substring(0, 40)}...`);
        return cachedItem.data;
      } else {
        // Expired but still usable as stale data
        console.log(
          `Using stale data for query: ${cacheKey.substring(0, 40)}...`
        );
        staleData = cachedItem.data;

        // If this is a non-critical query (like images or categories),
        // we can return stale data immediately and refresh in background
        if (isImageRelated || query.includes("categories")) {
          // Start background refresh
          setTimeout(() => {
            fetchFromCDN(query, variables, true).catch((e) =>
              console.log(`Background refresh failed: ${e.message}`)
            );
          }, 0);

          return staleData;
        }
      }
    }
  }

  try {
    // Add timestamp for dynamic content that needs to be fresh
    // For static content like images and categories, don't add timestamp to leverage CDN caching
    const shouldAddTimestamp = !isImageRelated && !query.includes("categories");

    const timestampedVariables = shouldAddTimestamp
      ? { ...variables, _timestamp: Date.now() }
      : variables;

    // Set request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Make the request
    const result = await cdnClient.request(query, timestampedVariables);
    clearTimeout(timeoutId);

    // Optimize image URLs in the response if needed
    const optimizedResult = isImageRelated ? optimizeImageUrls(result) : result;

    // Store in cache if caching is enabled
    if (useCache) {
      setCacheItem(cacheKey, optimizedResult, cacheTTL);
      console.log(
        `Cached result for ${
          cacheTTL / 1000 / 60
        } minutes: ${cacheKey.substring(0, 40)}...`
      );
    }

    return optimizedResult;
  } catch (error) {
    console.error(`Error fetching from Hygraph CDN: ${error.message}`);

    // If we have stale data, use it as fallback
    if (staleData) {
      console.log(
        `Using stale data as fallback for: ${cacheKey.substring(0, 40)}...`
      );
      return staleData;
    }

    // Try content API as fallback
    try {
      console.log("Falling back to Content API due to CDN failure");

      // Same timestamp logic as above
      const shouldAddTimestamp =
        !isImageRelated && !query.includes("categories");
      const timestampedVariables = shouldAddTimestamp
        ? { ...variables, _timestamp: Date.now() }
        : variables;

      const result = await contentClient.request(query, timestampedVariables);
      const optimizedResult = isImageRelated
        ? optimizeImageUrls(result)
        : result;

      // Store in cache with shorter TTL since it's from fallback
      if (useCache) {
        setCacheItem(cacheKey, optimizedResult, Math.floor(cacheTTL / 2));
        console.log(
          `Cached content API result for ${cacheTTL / 2000 / 60} minutes`
        );
      }

      return optimizedResult;
    } catch (fallbackError) {
      console.error(
        `Fallback to Content API also failed: ${fallbackError.message}`
      );

      // Last resort: check if we have ANY cached data, even if very old
      const lastResortData = getCacheItem(cacheKey);
      if (lastResortData && lastResortData.data) {
        console.log(
          `Using very old cache as last resort for: ${cacheKey.substring(
            0,
            40
          )}...`
        );
        return lastResortData.data;
      }

      throw error; // No fallbacks left, throw the original error
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
    clearCacheStorage();

    return result;
  } catch (error) {
    console.error(`Error fetching from Hygraph Content API: ${error.message}`);
    throw error;
  }
};

// Execute multiple queries in parallel with individual caching
export const batchQueries = async (queries = [], useCache = true) => {
  if (!queries || queries.length === 0) {
    return [];
  }

  // If only one query, use regular fetchFromCDN
  if (queries.length === 1) {
    const { query, variables } = queries[0];
    return [await fetchFromCDN(query, variables, useCache)];
  }

  // For multiple queries, execute them in parallel with individual caching
  try {
    console.log(`Executing ${queries.length} queries in parallel`);

    // Create an array of promises, each using fetchFromCDN with its own caching
    const queryPromises = queries.map(({ query, variables }) =>
      fetchFromCDN(query, variables, useCache).catch((err) => {
        console.error(`Query failed: ${err.message}`);
        return null; // Return null for failed queries
      })
    );

    // Execute all queries in parallel
    const results = await Promise.all(queryPromises);
    return results;
  } catch (error) {
    console.error(`Error executing parallel queries: ${error.message}`);
    return queries.map(() => null); // Return array of nulls on complete failure
  }
};

// Prefetch common queries during idle time
export const prefetchCommonQueries = () => {
  if (typeof window === "undefined") return; // Only run in browser

  // Use requestIdleCallback if available, otherwise setTimeout
  const scheduleIdle =
    window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));

  scheduleIdle(() => {
    console.log("Prefetching common queries during idle time");

    // Prefetch each query individually instead of batching
    // This is more reliable and avoids the batch query issues

    // Prefetch categories
    fetchFromCDN(
      gql`
        query GetGategories {
          categories(where: { show: true }, orderBy: name_DESC) {
            name
            slug
          }
        }
      `,
      {},
      true
    ).catch((err) => console.log(`Categories prefetch failed: ${err.message}`));

    // Prefetch featured posts
    fetchFromCDN(
      gql`
        query GetFeaturedPosts {
          posts(
            where: { featuredpost: true }
            first: 12
            orderBy: createdAt_DESC
          ) {
            author {
              name
              photo {
                url
              }
            }
            featuredImage {
              url
              width
              height
            }
            title
            slug
            createdAt
          }
        }
      `,
      {},
      true
    ).catch((err) =>
      console.log(`Featured posts prefetch failed: ${err.message}`)
    );

    // Prefetch recent posts
    fetchFromCDN(
      gql`
        query GetRecentPosts {
          posts(orderBy: createdAt_DESC, first: 5) {
            title
            featuredImage {
              url
            }
            createdAt
            slug
          }
        }
      `,
      {},
      true
    )
      .then((data) => {
        if (data && data.posts && data.posts.length > 0) {
          console.log(
            `Recent posts prefetch successful: ${data.posts.length} posts loaded`
          );
        } else {
          console.log("Recent posts prefetch returned empty data");
        }
      })
      .catch((err) => {
        // Only log as failed if it's actually an error
        if (err.response && err.response.status === 200) {
          console.log(
            "Recent posts prefetch completed with warnings:",
            err.message
          );
        } else {
          console.log(`Recent posts prefetch failed: ${err.message}`);
        }
      });

    // Log success message
    console.log("Prefetch queries initiated");
  });
};

// Export cache utilities with our new implementation
export const getCacheStats = () => {
  const stats = require("../lib/cache-manager").getCacheStats();
  return stats;
};

export const clearCache = () => {
  return clearCacheStorage();
};

export const pruneExpiredCache = () => {
  // This functionality is now handled automatically by the cache manager
  console.log("Pruning expired cache entries");
  return 0;
};

// Export gql for convenience
export { gql };
