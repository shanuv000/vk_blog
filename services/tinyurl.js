/**
 * TinyURL Service for URL Shortening
 * Provides URL shortening functionality for blog posts and sharing
 */

// TinyURL API Configuration
const TINYURL_API_BASE = 'https://api.tinyurl.com';
const TINYURL_API_KEY = process.env.TINYURL_API_KEY;

/**
 * TinyURL Service Class
 */
class TinyURLService {
  constructor() {
    this.apiKey = TINYURL_API_KEY;
    this.cache = new Map(); // In-memory cache for development
    this.defaultOptions = {
      domain: 'tinyurl.com', // Use default TinyURL domain
      alias: null, // Auto-generated alias
      tags: [], // Empty tags by default (some plans don't support tags)
      expires_at: null, // Never expires by default
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
   * Create a shortened URL
   * @param {string} longUrl - The original URL to shorten
   * @param {Object} options - Optional parameters
   * @param {string} options.alias - Custom alias for the short URL
   * @param {Array<string>} options.tags - Tags for tracking
   * @param {string} options.description - Description for the URL
   * @param {string} options.expires_at - Expiration date (ISO format)
   * @returns {Promise<Object>} - Shortened URL data
   */
  async createShortUrl(longUrl, options = {}) {
    try {
      // Input validation
      if (!longUrl || typeof longUrl !== 'string') {
        throw new Error('Invalid URL provided');
      }

      if (!this.isConfigured()) {
        console.warn('TinyURL API key not configured, returning original URL');
        return {
          data: {
            tiny_url: longUrl,
            url: longUrl,
            alias: null,
            deleted: false,
          },
          code: 0,
          errors: [],
        };
      }

      // Check cache first (for development)
      const cacheKey = this.generateCacheKey(longUrl, options);
      if (this.cache.has(cacheKey)) {
        console.log('Returning cached short URL for:', longUrl);
        return this.cache.get(cacheKey);
      }

      // Prepare request payload
      const payload = {
        url: longUrl,
        domain: options.domain || this.defaultOptions.domain,
        alias: options.alias || this.generateAlias(longUrl),
        tags: options.tags || this.defaultOptions.tags,
        expires_at: options.expires_at || this.defaultOptions.expires_at,
      };

      // Add description if provided
      if (options.description) {
        payload.description = options.description.substring(0, 500); // TinyURL limit
      }

      console.log('Creating short URL with TinyURL API:', { longUrl, alias: payload.alias });

      // Make API request
      const response = await fetch(`${TINYURL_API_BASE}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      // Handle API errors
      if (!response.ok || result.code !== 0) {
        console.error('TinyURL API error:', result);
        
        // Return original URL on error
        return {
          data: {
            tiny_url: longUrl,
            url: longUrl,
            alias: payload.alias,
            deleted: false,
          },
          code: result.code || response.status,
          errors: result.errors || ['API request failed'],
        };
      }

      // Cache the result
      this.cache.set(cacheKey, result);

      console.log('Successfully created short URL:', result.data.tiny_url);
      return result;

    } catch (error) {
      console.error('Error creating short URL:', error);
      
      // Graceful fallback - return original URL
      return {
        data: {
          tiny_url: longUrl,
          url: longUrl,
          alias: null,
          deleted: false,
        },
        code: 500,
        errors: [error.message],
      };
    }
  }

  /**
   * Get analytics for a shortened URL
   * @param {string} alias - The alias of the shortened URL
   * @returns {Promise<Object>} - Analytics data
   */
  async getAnalytics(alias) {
    try {
      if (!this.isConfigured() || !alias) {
        return null;
      }

      const response = await fetch(`${TINYURL_API_BASE}/analytics/${alias}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  /**
   * Update an existing short URL
   * @param {string} alias - The alias to update
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated URL data
   */
  async updateShortUrl(alias, updates) {
    try {
      if (!this.isConfigured() || !alias) {
        return null;
      }

      const response = await fetch(`${TINYURL_API_BASE}/alias/${alias}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Update request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating short URL:', error);
      return null;
    }
  }

  /**
   * Generate a cache key for storing results
   * @private
   */
  generateCacheKey(url, options) {
    const key = `${url}-${JSON.stringify(options)}`;
    return btoa(key).replace(/[+/=]/g, ''); // Base64 encode and clean
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
        // Create a meaningful alias from slug (max 30 chars for TinyURL)
        const alias = `urtechy-${slug}`.substring(0, 30).replace(/[^a-zA-Z0-9-]/g, '');
        return alias;
      }
      
      // Fallback: generate random alias
      return `urtechy-${Date.now().toString(36)}`;
    } catch (error) {
      console.error('Error generating alias:', error);
      return `urtechy-${Date.now().toString(36)}`;
    }
  }

  /**
   * Shorten a blog post URL with optimized settings
   * @param {Object} post - Post object from Hygraph
   * @param {string} baseUrl - Base URL for the site
   * @returns {Promise<string>} - Shortened URL
   */
  async shortenPostUrl(post, baseUrl = 'https://blog.urtechy.com') {
    try {
      if (!post || !post.slug) {
        throw new Error('Invalid post object provided');
      }

      const longUrl = `${baseUrl}/post/${post.slug}`;
      const options = {
        alias: this.generateAlias(longUrl),
        // Only add tags if the API plan supports it
        tags: [], // Removed tags to avoid API errors
        description: post.title ? post.title.substring(0, 500) : 'urTechy Blog Post',
      };

      const result = await this.createShortUrl(longUrl, options);
      return result.data.tiny_url;
    } catch (error) {
      console.error('Error shortening post URL:', error);
      return `${baseUrl}/post/${post.slug}`; // Return original URL on error
    }
  }

  /**
   * Clear cache (for development/testing)
   */
  clearCache() {
    this.cache.clear();
    console.log('TinyURL cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create and export a singleton instance
const tinyUrlService = new TinyURLService();

// Export both the class and the instance
export default tinyUrlService;
export { TinyURLService };

// Export utility functions for direct use
export const createShortUrl = (url, options) => tinyUrlService.createShortUrl(url, options);
export const shortenPostUrl = (post, baseUrl) => tinyUrlService.shortenPostUrl(post, baseUrl);
export const getUrlAnalytics = (alias) => tinyUrlService.getAnalytics(alias);