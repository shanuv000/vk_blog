// Simple in-memory cache for Twitter API responses
class TwitterCache {
  constructor() {
    this.cache = new Map();
    this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if cache has expired
    if (Date.now() - item.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const twitterCache = new TwitterCache();

// Clean up expired cache entries every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    twitterCache.cleanup();
  }, 5 * 60 * 1000);
}
