/**
 * Dub.co Link Shortener Service
 * Provides URL shortening functionality using Dub.co API
 * Replaces TinyURL with better analytics and custom domain support
 */

// Dub.co API Configuration
const DUB_API_BASE = "https://api.dub.co";

// Rate limiting (Dub.co free tier: 10 requests/second)
const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 1000, // 1 second
  requests: [],
};

/**
 * Dub.co Service Class
 */
class DubService {
  constructor() {
    this.cache = new Map();
    this.rateLimiter = { ...RATE_LIMIT };
  }

  /**
   * Get API key at runtime (for serverless environments)
   */
  getApiKey() {
    return process.env.DUB_API_KEY;
  }

  /**
   * Get custom domain at runtime (for serverless environments)
   */
  getDomain() {
    return process.env.DUB_CUSTOM_DOMAIN || "dub.sh";
  }

  /**
   * Check if Dub.co service is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    const apiKey = this.getApiKey();
    const configured = !!apiKey;
    if (!configured) {
      console.warn("⚠️ DUB_API_KEY not found in environment");
    }
    return configured;
  }

  /**
   * Rate limiter check
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
      console.warn("⚠️ Dub.co rate limit reached, using cache/fallback");
      return false;
    }

    // Add current request to tracker
    this.rateLimiter.requests.push(now);
    return true;
  }

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {Object|null} - Cached result or null
   */
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (cached) {
      // Cache valid for 7 days
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - cached.timestamp < maxAge) {
        console.log("✅ Using cached Dub.co result");
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
   * Generate cache key
   * @private
   */
  generateCacheKey(url) {
    // Simple hash for cache key
    return `dub_${Buffer.from(url).toString("base64").slice(0, 32)}`;
  }

  /**
   * Create a shortened URL using Dub.co
   * @param {string} longUrl - The original URL to shorten
   * @param {Object} options - Optional parameters
   * @param {string} options.key - Custom short link slug
   * @param {string} options.externalId - External ID (for linking to your DB)
   * @param {string[]} options.tagNames - Tag names for organization
   * @param {string} options.title - Custom title for link preview
   * @param {string} options.description - Custom description for link preview
   * @returns {Promise<Object>} - Shortened URL data
   */
  async createLink(longUrl, options = {}) {
    try {
      // Input validation
      if (!longUrl || typeof longUrl !== "string") {
        throw new Error("Invalid URL provided");
      }

      if (!this.isConfigured()) {
        console.warn("⚠️ Dub.co API key not configured, returning original URL");
        return {
          shortLink: longUrl,
          url: longUrl,
          success: false,
          error: "API key not configured",
        };
      }

      // Check cache first (note: cache is ephemeral in serverless)
      const cacheKey = this.generateCacheKey(longUrl);
      const cachedResult = this.getCachedResult(cacheKey);
      if (cachedResult) {
        return { ...cachedResult, fromCache: true };
      }

      // Check rate limit
      if (!this.checkRateLimit()) {
        console.warn("⚠️ Rate limit reached, returning original URL");
        return {
          shortLink: longUrl,
          url: longUrl,
          success: false,
          error: "Rate limit exceeded",
        };
      }

      // NOTE: We don't pre-check for existing links because Dub.co's API 
      // returns all links when querying by URL (not filtered).
      // Instead, we rely on Dub.co's 409 conflict error to detect duplicates.

      console.log("🔗 Creating new Dub.co short link for:", longUrl);

      // Build request payload
      const payload = {
        url: longUrl,
        domain: this.getDomain(),
      };

      // Add optional parameters
      if (options.key) payload.key = options.key;
      if (options.externalId) payload.externalId = options.externalId;
      if (options.tagNames) payload.tagNames = options.tagNames;
      if (options.title) payload.title = options.title;
      if (options.description) payload.description = options.description;
      if (options.comments) payload.comments = options.comments;

      // Make API request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(`${DUB_API_BASE}/links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle duplicate link error (link already exists)
        if (response.status === 409) {
          console.log("🔄 Link already exists, fetching existing link...");
          // Try to find existing link
          const existingLink = await this.findLinkByUrl(longUrl);
          if (existingLink) {
            this.setCachedResult(cacheKey, existingLink);
            return { ...existingLink, fromCache: false, wasExisting: true };
          }
        }

        console.error("❌ Dub.co API error:", errorData);
        throw new Error(
          errorData.error?.message || `API request failed: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("✅ Dub.co link created:", result.shortLink);

      const linkData = {
        id: result.id,
        shortLink: result.shortLink,
        url: result.url,
        key: result.key,
        domain: result.domain,
        success: true,
      };

      // Cache the result
      this.setCachedResult(cacheKey, linkData);

      return linkData;
    } catch (error) {
      console.error("❌ Error creating Dub.co link:", error.message);

      // Graceful fallback
      return {
        shortLink: longUrl,
        url: longUrl,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Find a link by its destination URL
   * @param {string} url - The destination URL to search for
   * @returns {Promise<Object|null>}
   */
  async findLinkByUrl(url) {
    try {
      if (!this.isConfigured()) return null;

      const response = await fetch(
        `${DUB_API_BASE}/links?url=${encodeURIComponent(url)}`,
        {
          headers: {
            Authorization: `Bearer ${this.getApiKey()}`,
          },
        }
      );

      if (!response.ok) return null;

      const links = await response.json();
      if (links && links.length > 0) {
        const link = links[0];
        return {
          id: link.id,
          shortLink: link.shortLink,
          url: link.url,
          key: link.key,
          domain: link.domain,
          success: true,
        };
      }

      return null;
    } catch (error) {
      console.error("Error finding link:", error.message);
      return null;
    }
  }

  /**
   * Get analytics for a link
   * @param {string} linkId - The link ID
   * @returns {Promise<Object|null>}
   */
  async getAnalytics(linkId) {
    try {
      if (!this.isConfigured() || !linkId) {
        return null;
      }

      const response = await fetch(
        `${DUB_API_BASE}/analytics?linkId=${linkId}&event=clicks`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        console.warn("Analytics not available");
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching analytics:", error.message);
      return null;
    }
  }

  /**
   * Shorten a blog post URL
   * @param {Object} post - Post object with slug, title, id
   * @param {string} baseUrl - Base URL for the site
   * @returns {Promise<string>} - Shortened URL or original URL
   */
  async shortenPostUrl(post, baseUrl = "https://blog.urtechy.com") {
    try {
      console.log("🔗 Dub.co Service - shortenPostUrl called");

      if (!post || !post.slug) {
        throw new Error("Invalid post object provided");
      }

      const longUrl = `${baseUrl}/post/${post.slug}`;

      const options = {
        externalId: post.id || undefined,
        comments: `Blog post: ${post.title || post.slug}`,
      };

      // Add tags from post categories if available
      if (post.categories && Array.isArray(post.categories)) {
        options.tagNames = post.categories.map((c) => c.name || c).slice(0, 5);
      }

      console.log("🔄 Creating short URL for:", longUrl);

      const result = await this.createLink(longUrl, options);

      console.log("✅ Dub.co creation completed:", {
        success: result.success,
        fromCache: result.fromCache || false,
        shortLink: result.shortLink,
      });

      return result.shortLink;
    } catch (error) {
      console.error("❌ Error shortening post URL:", error);
      const fallbackUrl = `${baseUrl}/post/${post.slug}`;
      console.log("🔄 Returning fallback URL:", fallbackUrl);
      return fallbackUrl;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.rateLimiter.requests = [];
    console.log("✅ Dub.co cache cleared");
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      domain: this.domain,
      isConfigured: this.isConfigured(),
      rateLimiter: {
        requests: this.rateLimiter.requests.length,
        maxRequests: this.rateLimiter.maxRequests,
        windowMs: this.rateLimiter.windowMs,
      },
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
    };
  }
}

// Create and export singleton instance
const dubService = new DubService();

export default dubService;
export { DubService };

// Export utility functions
export const createShortUrl = (url, options) =>
  dubService.createLink(url, options);
export const shortenPostUrl = (post, baseUrl) =>
  dubService.shortenPostUrl(post, baseUrl);
export const getAnalytics = (linkId) => dubService.getAnalytics(linkId);
