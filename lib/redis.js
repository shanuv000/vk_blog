// Upstash Redis cache utility for SEO APIs
// Provides reliable 24-hour caching to avoid burning RapidAPI quota

import { Redis } from "@upstash/redis";

// Initialize Redis client (lazy initialization)
let redis = null;

function getRedis() {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn("[Redis] Upstash credentials not configured, caching disabled");
      return null;
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Get cached data from Redis
 * @param {string} key - Cache key
 * @returns {Promise<object|null>} - Cached data or null if not found
 */
export async function getCachedData(key) {
  try {
    const client = getRedis();
    if (!client) return null;

    const cached = await client.get(key);
    if (cached) {
      console.log(`[Redis] Cache HIT for ${key}`);
      return cached;
    }
    console.log(`[Redis] Cache MISS for ${key}`);
    return null;
  } catch (error) {
    console.error(`[Redis] Error getting cache:`, error.message);
    return null;
  }
}

/**
 * Set cached data in Redis with TTL
 * @param {string} key - Cache key
 * @param {object} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 24 hours)
 * @returns {Promise<boolean>} - Success status
 */
export async function setCachedData(key, data, ttlSeconds = 86400) {
  try {
    const client = getRedis();
    if (!client) return false;

    await client.set(key, data, { ex: ttlSeconds });
    console.log(`[Redis] Cached ${key} for ${ttlSeconds}s`);
    return true;
  } catch (error) {
    console.error(`[Redis] Error setting cache:`, error.message);
    return false;
  }
}

/**
 * Wrapper function to handle caching logic for SEO APIs
 * @param {string} cacheKey - Unique cache key for this API
 * @param {function} fetchFn - Function to fetch fresh data
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @returns {Promise<{data: any, source: string}>}
 */
export async function withCache(cacheKey, fetchFn, ttlSeconds = 86400) {
  // Try to get from cache first
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return { data: cached, source: "redis-cache" };
  }

  // Fetch fresh data
  const freshData = await fetchFn();
  
  // Cache the fresh data (don't await to avoid blocking response)
  setCachedData(cacheKey, freshData, ttlSeconds).catch(() => {});
  
  return { data: freshData, source: "rapidapi-fresh" };
}

export default { getCachedData, setCachedData, withCache };
