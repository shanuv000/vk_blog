/**
 * Hook for managing TinyURL shortened links
 * Provides URL shortening functionality with caching and error handling
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import tinyUrlService from "../services/tinyurl";

/**
 * Custom hook for managing shortened URLs
 * @param {Object} post - Post object containing slug, title, etc.
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoShorten - Whether to automatically create short URLs
 * @param {string} options.baseUrl - Base URL for the site
 * @param {boolean} options.enableAnalytics - Whether to fetch analytics data
 * @returns {Object} Hook state and functions
 */
export const useTinyUrl = (post, options = {}) => {
  const {
    autoShorten = true,
    baseUrl = "https://blog.urtechy.com",
    enableAnalytics = false,
  } = options;

  // State management
  const [shortUrl, setShortUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [alias, setAlias] = useState(null);

  // Memoized long URL
  const longUrl = useMemo(() => {
    if (!post?.slug) return null;
    return `${baseUrl}/post/${post.slug}`;
  }, [post?.slug, baseUrl]);

  // Create shortened URL
  const createShortUrl = useCallback(
    async (customOptions = {}) => {
      if (!post || !post.slug) {
        setError("Invalid post data provided");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await tinyUrlService.shortenPostUrl(post, baseUrl);

        if (result && result !== longUrl) {
          setShortUrl(result);
          // Extract alias from the shortened URL for analytics
          const aliasMatch = result.match(/tinyurl\.com\/(.+)$/);
          if (aliasMatch) {
            setAlias(aliasMatch[1]);
          }
          return result;
        } else {
          // Fallback to long URL if shortening fails
          setShortUrl(longUrl);
          return longUrl;
        }
      } catch (err) {
        console.error("Error creating short URL:", err);
        setError(err.message);
        setShortUrl(longUrl); // Fallback to original URL
        return longUrl;
      } finally {
        setIsLoading(false);
      }
    },
    [post, baseUrl, longUrl]
  );

  // Get analytics for the shortened URL
  const fetchAnalytics = useCallback(async () => {
    if (!alias || !enableAnalytics) return null;

    try {
      const analyticsData = await tinyUrlService.getAnalytics(alias);
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      console.error("Error fetching analytics:", err);
      return null;
    }
  }, [alias, enableAnalytics]);

  // Copy URL to clipboard with feedback
  const copyToClipboard = useCallback(async () => {
    const urlToCopy = shortUrl || longUrl;
    if (!urlToCopy) return false;

    try {
      await navigator.clipboard.writeText(urlToCopy);
      return true;
    } catch (err) {
      console.error("Failed to copy URL:", err);
      return false;
    }
  }, [shortUrl, longUrl]);

  // Generate sharing URLs for different platforms with shortened URLs
  const getSharingUrls = useCallback(() => {
    const urlToShare = shortUrl || longUrl;
    const title = post?.title || "urTechy Blog Post";
    const imageUrl =
      post?.featuredImage?.url || `${baseUrl}/default-og-image.jpg`;

    if (!urlToShare) return {};

    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        urlToShare
      )}&quote=${encodeURIComponent(title)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(
        urlToShare
      )}&via=Onlyblogs_&hashtags=urtechy,blog`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        urlToShare
      )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
        title
      )}&source=urTechy`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        `${title} - ${urlToShare}`
      )}`,
      reddit: `http://www.reddit.com/submit?url=${encodeURIComponent(
        urlToShare
      )}&title=${encodeURIComponent(title)}`,
      pinterest: `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(
        urlToShare
      )}&description=${encodeURIComponent(title)}&media=${encodeURIComponent(
        imageUrl
      )}`,
      email: `mailto:?subject=${encodeURIComponent(
        title
      )}&body=${encodeURIComponent(
        `Check out this article: ${title}\n\n${urlToShare}`
      )}`,
    };
  }, [shortUrl, longUrl, post, baseUrl]);

  // Auto-shorten URL on mount if enabled
  useEffect(() => {
    if (autoShorten && post?.slug && !shortUrl && !isLoading) {
      createShortUrl();
    }
  }, [autoShorten, post?.slug, shortUrl, isLoading, createShortUrl]);

  // Fetch analytics periodically if enabled
  useEffect(() => {
    if (enableAnalytics && alias) {
      fetchAnalytics();

      // Set up periodic analytics fetching (every 5 minutes)
      const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [enableAnalytics, alias, fetchAnalytics]);

  return {
    // URLs
    shortUrl,
    longUrl,
    alias,

    // State
    isLoading,
    error,
    analytics,

    // Actions
    createShortUrl,
    fetchAnalytics,
    copyToClipboard,
    getSharingUrls,

    // Computed values
    isShortened: !!shortUrl && shortUrl !== longUrl,
    hasAnalytics: !!analytics,

    // Utilities
    refresh: () => createShortUrl(),
    clearError: () => setError(null),
  };
};

/**
 * Hook for bulk URL shortening (for multiple posts)
 * @param {Array} posts - Array of post objects
 * @param {Object} options - Configuration options
 * @returns {Object} Bulk shortening state and functions
 */
export const useBulkTinyUrl = (posts, options = {}) => {
  const { baseUrl = "https://blog.urtechy.com" } = options;

  const [shortUrls, setShortUrls] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  const shortenAllUrls = useCallback(async () => {
    if (!posts || posts.length === 0) return;

    setIsLoading(true);
    setErrors({});
    setProgress({ completed: 0, total: posts.length });

    const results = {};
    const errorResults = {};

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      try {
        const shortUrl = await tinyUrlService.shortenPostUrl(post, baseUrl);
        results[post.slug] = shortUrl;
      } catch (error) {
        console.error(`Error shortening URL for post ${post.slug}:`, error);
        errorResults[post.slug] = error.message;
        results[post.slug] = `${baseUrl}/post/${post.slug}`; // Fallback
      }

      setProgress({ completed: i + 1, total: posts.length });

      // Small delay to avoid rate limiting
      if (i < posts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    setShortUrls(results);
    setErrors(errorResults);
    setIsLoading(false);
  }, [posts, baseUrl]);

  const getShortUrl = useCallback(
    (slug) => {
      return shortUrls[slug] || `${baseUrl}/post/${slug}`;
    },
    [shortUrls, baseUrl]
  );

  return {
    shortUrls,
    isLoading,
    errors,
    progress,
    shortenAllUrls,
    getShortUrl,
    hasErrors: Object.keys(errors).length > 0,
    isCompleted: progress.completed === progress.total && progress.total > 0,
  };
};

export default useTinyUrl;
