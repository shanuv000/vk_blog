/**
 * TinyURL Service for URL Shortening (Optimized for FREE version)
 * Provides URL shortening functionality for blog posts and sharing
 */

// TinyURL API Configuration
const TINYURL_API_BASE = "https://api.tinyurl.com";
const TINYURL_API_KEY = process.env.TINYURL_API_KEY;

// Rate limiting for free version (120 requests/hour = 2 requests/minute)
const RATE_LIMIT = {
  maxRequests: 2,
  windowMs: 60 * 1000, // 1 minute
  requests: [],
};

/**
 * TinyURL Service Class (FREE Version Optimized)
 */
class TinyURLService {
  constructor() {
    this.apiKey = TINYURL_API_KEY;
    this.cache = new Map(); // Persistent cache to reduce API calls
    this.rateLimiter = RATE_LIMIT;
    this.defaultOptions = {
      domain: "tinyurl.com", // Free version only supports default domain
      alias: null, // Auto-generated alias (safer for free version)
      // Removed tags and descriptions for free version compatibility
    };
  }

  /**
   * Check if TinyURL service is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Rate limiter for free version (120 requests/hour)
   * @returns {boolean} - true if request is allowed
   */
  checkRateLimit() {
    const now = Date.now();

    // Remove requests older than the window
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      (requestTime) => now - requestTime < this.rateLimiter.windowMs
    );

    // Check if we're under the limit
    if (this.rateLimiter.requests.length >= this.rateLimiter.maxRequests) {
      console.warn("⚠️ TinyURL rate limit reached, using cache/fallback");
      return false;
    }

    // Add current request to tracker
    this.rateLimiter.requests.push(now);
    return true;
  }

  /**
   * Enhanced cache with persistence considerations
   * @param {string} key - Cache key
   * @returns {Object|null} - Cached result or null
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached) {
      // Check if cached result is still valid (24 hours for free version)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - cached.timestamp < maxAge) {
        console.log("✅ Using cached TinyURL result");
        return cached.data;
      } else {
        this.cache.delete(key);
      }
    }
    return null;
  }

  /**
   * Set cache with timestamp
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedResult(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Create a shortened URL (FREE version optimized)
   * @param {string} longUrl - The original URL to shorten
   * @param {Object} options - Optional parameters (limited for free version)
   * @param {string} options.alias - Custom alias (optional, can be auto-generated)
   * @returns {Promise<Object>} - Shortened URL data
   */
  async createShortUrl(longUrl, options = {}) {
    try {
      // Input validation
      if (!longUrl || typeof longUrl !== "string") {
        throw new Error("Invalid URL provided");
      }

      if (!this.isConfigured()) {
        console.warn("TinyURL API key not configured, returning original URL");
        return {
          data: {
            tiny_url: longUrl,
            url: longUrl,
            alias: null,
            deleted: false,
          },
          code: 0,
          errors: [],
          fromCache: false,
        };
      }

      // Check cache first (critical for free version to avoid API calls)
      const cacheKey = this.generateCacheKey(longUrl, options);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return { ...cachedResult, fromCache: true };
      }

      // Check rate limit before making API call
      if (!this.checkRateLimit()) {
        console.warn("Rate limit reached, returning original URL");
        return {
          data: {
            tiny_url: longUrl,
            url: longUrl,
            alias: null,
            deleted: false,
          },
          code: 429,
          errors: ["Rate limit exceeded"],
          fromCache: false,
        };
      }

      console.log("🔄 Creating TinyURL (free version)...");

      // For free version, use simpler approach with fewer retries
      const aliasesToTry = [
        null, // Let TinyURL auto-generate (most reliable for free version)
        options.alias ? options.alias.substring(0, 30) : null, // Use provided alias if available
      ].filter(Boolean);

      // Only try auto-generation if no alias specified, to save API calls
      if (!options.alias) {
        aliasesToTry.unshift(null);
      }

      for (let i = 0; i < Math.min(aliasesToTry.length, 2); i++) {
        // Max 2 attempts for free version
        const currentAlias = aliasesToTry[i];

        // Minimal payload for free version (avoid unsupported features)
        const payload = {
          url: longUrl,
          domain: this.defaultOptions.domain, // Always use default domain
        };

        // Only add alias if specified (free version works better with auto-generation)
        if (currentAlias) {
          payload.alias = currentAlias;
        }

        console.log(`🔄 TinyURL attempt ${i + 1}:`, {
          alias: currentAlias || "auto-generated",
          url: longUrl.substring(0, 50) + "...",
        });

        // Make API request with timeout for free version
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        try {
          const response = await fetch(`${TINYURL_API_BASE}/create`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const result = await response.json();

          // Check if this attempt succeeded
          if (response.ok && result.code === 0) {
            console.log(
              "✅ TinyURL created successfully:",
              result.data.tiny_url
            );

            // Cache the successful result
            this.setCachedResult(cacheKey, result);
            return { ...result, fromCache: false };
          }

          // For free version, don't retry on alias conflicts - use auto-generation
          if (result.code === 5 && currentAlias) {
            console.warn("⚠️ Alias unavailable, will try auto-generation");
            continue;
          }

          // For other errors, log and try next approach or fail
          console.warn(
            `⚠️ Attempt ${i + 1} failed:`,
            result.errors || result.message
          );

          // If this was auto-generation and it failed, don't retry
          if (!currentAlias) {
            break;
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === "AbortError") {
            console.warn("⚠️ TinyURL request timed out");
          } else {
            console.warn("⚠️ Network error:", fetchError.message);
          }
          continue;
        }
      }

      // If all attempts failed, return original URL (graceful degradation)
      console.log("⚠️ TinyURL creation failed, using original URL");
      const fallbackResult = {
        data: {
          tiny_url: longUrl,
          url: longUrl,
          alias: null,
          deleted: false,
        },
        code: 200, // Success code for fallback
        errors: ["TinyURL unavailable, using original"],
        fromCache: false,
      };

      // Cache the fallback to avoid repeated API calls for same URL
      this.setCachedResult(cacheKey, fallbackResult);
      return fallbackResult;
    } catch (error) {
      console.error("❌ Error creating short URL:", error);

      // Graceful fallback - return original URL
      const fallbackResult = {
        data: {
          tiny_url: longUrl,
          url: longUrl,
          alias: null,
          deleted: false,
        },
        code: 500,
        errors: [error.message],
        fromCache: false,
      };

      // Cache the error result to prevent repeated failures
      const cacheKey = this.generateCacheKey(longUrl, options);
      this.setCachedResult(cacheKey, fallbackResult);

      return fallbackResult;
    }
  }

  /**
   * Get analytics for a shortened URL (LIMITED in free version)
   * @param {string} alias - The alias of the shortened URL
   * @returns {Promise<Object>} - Analytics data (may be limited)
   */
  async getAnalytics(alias) {
    try {
      if (!this.isConfigured() || !alias) {
        console.warn("Analytics unavailable: no API key or alias");
        return null;
      }

      // Check rate limit before analytics call
      if (!this.checkRateLimit()) {
        console.warn("Analytics skipped: rate limit reached");
        return null;
      }

      console.log(
        "📊 Fetching TinyURL analytics (free version limitations may apply)..."
      );

      const response = await fetch(`${TINYURL_API_BASE}/analytics/${alias}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          console.warn("Analytics not available in free plan");
          return null;
        }
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Analytics error (expected in free version):",
        error.message
      );
      return null;
    }
  }

  /**
   * Update an existing short URL (LIMITED in free version)
   * @param {string} alias - The alias to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated URL data
   */
  async updateShortUrl(alias, updates) {
    console.warn("⚠️ URL updates may not be available in free TinyURL version");
    return null; // Skip updates for free version to save API calls
  }

  /**
   * Generate a cache key for storing results
   * @private
   */
  generateCacheKey(url, options) {
    const key = `${url}-${JSON.stringify(options)}`;
    return btoa(key).replace(/[+/=]/g, ""); // Base64 encode and clean
  }

  /**
   * Generate a meaningful alias from post data
   * @private
   */
  generateAlias(url) {
    try {
      // Extract slug from URL if it's a blog post
      const match = url.match(/\/post\/([^/?#]+)/);
      if (match) {
        const slug = match[1];

        // For very long slugs, create a shorter meaningful alias
        let alias;
        if (slug.length > 50) {
          // Extract key parts from long slug
          const parts = slug.split("-");
          const keyParts = [];
          let currentLength = 8; // "urtechy-" prefix

          for (const part of parts) {
            if (currentLength + part.length + 1 <= 30 && keyParts.length < 4) {
              keyParts.push(part);
              currentLength += part.length + 1;
            } else if (keyParts.length === 0) {
              // If no parts fit, take first part truncated
              keyParts.push(part.substring(0, 20));
              break;
            } else {
              break;
            }
          }

          alias = `urtechy-${keyParts.join("-")}`
            .substring(0, 30)
            .replace(/[^a-zA-Z0-9-]/g, "");
        } else {
          // Short slug, use as-is with prefix
          alias = `urtechy-${slug}`
            .substring(0, 30)
            .replace(/[^a-zA-Z0-9-]/g, "");
        }

        // Generated alias from post slug
        return alias;
      }

      // Fallback: generate random alias
      const fallback = `urtechy-${Date.now().toString(36)}`;
      // Using fallback alias
      return fallback;
    } catch (error) {
      console.error("Error generating alias:", error);
      return `urtechy-${Date.now().toString(36)}`;
    }
  }

  /**
   * Shorten a blog post URL (FREE version optimized)
   * @param {Object} post - Post object from Hygraph
   * @param {string} baseUrl - Base URL for the site
   * @returns {Promise<string>} - Shortened URL or original URL
   */
  async shortenPostUrl(post, baseUrl = "https://blog.urtechy.com") {
    try {
      console.log("🔗 TinyURL Service - shortenPostUrl called (FREE version)");

      if (!post || !post.slug) {
        throw new Error("Invalid post object provided");
      }

      const longUrl = `${baseUrl}/post/${post.slug}`;

      // For free version, use minimal options to avoid API errors
      const options = {
        // Let TinyURL auto-generate alias for better success rate
        alias: null,
      };

      console.log(
        "🔄 Creating short URL for:",
        longUrl.substring(0, 50) + "..."
      );

      const result = await this.createShortUrl(longUrl, options);

      console.log("✅ TinyURL creation completed:", {
        success: result.code === 0,
        fromCache: result.fromCache,
        isShortened: result.data.tiny_url !== longUrl,
      });

      return result.data.tiny_url;
    } catch (error) {
      console.error("❌ Error shortening post URL:", error);
      const fallbackUrl = `${baseUrl}/post/${post.slug}`;
      console.log("🔄 Returning fallback URL:", fallbackUrl);
      return fallbackUrl; // Return original URL on error
    }
  }

  /**
   * Clear cache (for development/testing)
   */
  clearCache() {
    this.cache.clear();
    this.rateLimiter.requests = [];
    console.log("✅ TinyURL cache and rate limiter cleared");
  }

  /**
   * Get service statistics (FREE version specific)
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      rateLimiter: {
        requests: this.rateLimiter.requests.length,
        windowMs: this.rateLimiter.windowMs,
        maxRequests: this.rateLimiter.maxRequests,
      },
      isConfigured: this.isConfigured(),
      apiKeyExists: !!this.apiKey,
    };
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    const now = Date.now();
    const recentRequests = this.rateLimiter.requests.filter(
      (requestTime) => now - requestTime < this.rateLimiter.windowMs
    );

    return {
      requestsInWindow: recentRequests.length,
      maxRequests: this.rateLimiter.maxRequests,
      canMakeRequest: recentRequests.length < this.rateLimiter.maxRequests,
      nextResetIn:
        recentRequests.length > 0
          ? Math.max(
              0,
              this.rateLimiter.windowMs - (now - Math.min(...recentRequests))
            )
          : 0,
    };
  }
}

// Create and export a singleton instance
const tinyUrlService = new TinyURLService();

// Export both the class and the instance
export default tinyUrlService;
export { TinyURLService };

// Export utility functions for direct use
export const createShortUrl = (url, options) =>
  tinyUrlService.createShortUrl(url, options);
export const shortenPostUrl = (post, baseUrl) =>
  tinyUrlService.shortenPostUrl(post, baseUrl);
export const getUrlAnalytics = (alias) => tinyUrlService.getAnalytics(alias);
