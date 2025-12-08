// Upstash Redis cache utility for SEO APIs
// Cache expires daily at 5:00 AM IST

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
 * Calculate seconds until next 5:00 AM IST
 * IST is UTC+5:30, so 5:00 AM IST = 23:30 UTC (previous day)
 * @returns {number} - Seconds until next 5:00 AM IST
 */
export function getTTLUntil5AMIST() {
  const now = new Date();
  
  // Create target time: 5:00 AM IST = 23:30 UTC (previous day)
  // IST is UTC+5:30, so subtract 5:30 from IST to get UTC
  // 5:00 AM IST = 05:00 - 05:30 = -00:30 = 23:30 UTC (previous day)
  const target = new Date(now);
  
  // Set to 23:30 UTC (which is 5:00 AM IST next day)
  target.setUTCHours(23, 30, 0, 0);
  
  // If we're past 23:30 UTC today, set to tomorrow
  if (now >= target) {
    target.setUTCDate(target.getUTCDate() + 1);
  }
  
  const ttlMs = target - now;
  const ttlSeconds = Math.floor(ttlMs / 1000);
  
  // Ensure minimum TTL of 1 hour to avoid too-short caches
  return Math.max(ttlSeconds, 3600);
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
    console.log(`[Redis] Cache MISS for ${key}`)
    return null;
  } catch (error) {
    console.error(`[Redis] Error getting cache:`, error.message);
    return null;
  }
}

/**
 * Set cached data in Redis with TTL until 5:00 AM IST
 * @param {string} key - Cache key
 * @param {object} data - Data to cache
 * @param {number} ttlSeconds - Time to live in seconds (optional, default: until 5 AM IST)
 * @returns {Promise<boolean>} - Success status
 */
export async function setCachedData(key, data, ttlSeconds = null) {
  try {
    const client = getRedis();
    if (!client) return false;

    // Use provided TTL or calculate until 5:00 AM IST
    const ttl = ttlSeconds || getTTLUntil5AMIST();
    
    await client.set(key, data, { ex: ttl });
    
    const expiryTime = new Date(Date.now() + ttl * 1000);
    console.log(`[Redis] Cached ${key} until ${expiryTime.toISOString()} (${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`[Redis] Error setting cache:`, error.message);
    return false;
  }
}

/**
 * Wrapper function to handle caching logic for SEO APIs
 * Cache expires at 5:00 AM IST daily
 * @param {string} cacheKey - Unique cache key for this API
 * @param {function} fetchFn - Function to fetch fresh data
 * @returns {Promise<{data: any, source: string}>}
 */
export async function withCache(cacheKey, fetchFn) {
  // Try to get from cache first
  const cached = await getCachedData(cacheKey);
  if (cached) {
    return { data: cached, source: "redis-cache" };
  }

  // Fetch fresh data
  const freshData = await fetchFn();
  
  // Cache the fresh data until 5:00 AM IST
  await setCachedData(cacheKey, freshData);
  
  return { data: freshData, source: "rapidapi-fresh" };
}

export default { getCachedData, setCachedData, withCache, getTTLUntil5AMIST };

