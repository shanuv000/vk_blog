/**
 * Enhanced TinyURL Hook with Smart Validation
 * Handles new posts vs legacy posts with proper validation
 */
import { useState, useEffect, useCallback, useMemo } from "react";

// Date when TinyURL integration was implemented (adjust this to your integration date)
const TINYURL_INTEGRATION_DATE = new Date("2025-09-29T00:00:00Z");

/**
 * Determines if a post should have a TinyURL based on publish date
 * @param {Object} post - Post object
 * @returns {boolean} Whether post should have TinyURL
 */
const shouldHaveTinyUrl = (post) => {
  if (!post) return false;

  // Check if post has publish date
  const publishedAt = post.publishedAt || post.createdAt;
  if (!publishedAt) return false;

  const postDate = new Date(publishedAt);
  return postDate >= TINYURL_INTEGRATION_DATE;
};

/**
 * Enhanced hook for managing shortened URLs with smart validation
 * @param {Object} post - Post object containing slug, title, publishedAt, etc.
 * @param {Object} options - Configuration options
 * @returns {Object} Hook state and functions
 */
export const useTinyUrl = (post, options = {}) => {
  const {
    autoShorten = true,
    baseUrl = "https://blog.urtechy.com",
    enableAnalytics = false,
    forceShorten = false, // Force shortening even for legacy posts
  } = options;

  // State management
  const [shortUrl, setShortUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [alias, setAlias] = useState(null);

  // Validation states
  const [validationStatus, setValidationStatus] = useState({
    isNewPost: false,
    shouldAutoShorten: false,
    hasValidData: false,
  });

  // Memoized long URL
  const longUrl = useMemo(() => {
    if (!post?.slug) return null;
    return `${baseUrl}/post/${post.slug}`;
  }, [post?.slug, baseUrl]);

  // Validate post and determine TinyURL eligibility
  const validatePost = useCallback(() => {
    if (!post) {
      setValidationStatus({
        isNewPost: false,
        shouldAutoShorten: false,
        hasValidData: false,
      });
      return false;
    }

    const isNewPost = shouldHaveTinyUrl(post);
    const hasValidData = !!(post.slug && post.title);
    const shouldAutoShorten =
      (isNewPost || forceShorten) && hasValidData && autoShorten;

    const status = {
      isNewPost,
      shouldAutoShorten,
      hasValidData,
      publishDate: post.publishedAt || post.createdAt,
      integrationDate: TINYURL_INTEGRATION_DATE.toISOString(),
    };

    setValidationStatus(status);
    return shouldAutoShorten;
  }, [post, autoShorten, forceShorten]);

  // Create shortened URL with validation
  const createShortUrl = useCallback(
    async (customOptions = {}) => {
      if (!post || !post.slug) {
        setError("Invalid post data provided");
        return null;
      }

      // Validate if we should create short URL
      if (!customOptions.force && !forceShorten && !shouldHaveTinyUrl(post)) {
        setShortUrl(longUrl);
        return longUrl;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Call server-side API endpoint where environment variables are available
        const response = await fetch("/api/create-tinyurl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post,
            baseUrl,
            force: customOptions.force || false,
          }),
        });

        const apiResult = await response.json();

        if (!apiResult.success) {
          throw new Error(apiResult.error || "Server API failed");
        }

        const result = apiResult.shortUrl;

        if (apiResult.isShortened && result && result !== longUrl) {
          setShortUrl(result);
          // Extract alias from the shortened URL for analytics
          if (apiResult.alias) {
            setAlias(apiResult.alias);
          } else {
            const aliasMatch = result.match(/tinyurl\.com\/(.+)$/);
            if (aliasMatch) {
              setAlias(aliasMatch[1]);
            }
          }
          return result;
        } else {
          // Use long URL (either legacy post or creation failed)
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
    [post, baseUrl, longUrl, forceShorten]
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

  // Copy URL to clipboard with multiple fallback methods
  const copyToClipboard = useCallback(async () => {
    const urlToCopy = shortUrl || longUrl;
    if (!urlToCopy) {
      return false;
    }

    // Method 1: Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(urlToCopy);
        return true;
      } catch (err) {
        // Continue to fallback method
      }
    }

    // Method 2: Legacy execCommand fallback
    try {
      const textarea = document.createElement("textarea");
      textarea.value = urlToCopy;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);

      // Select and copy
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        return true;
      } else {
        throw new Error("execCommand('copy') returned false");
      }
    } catch (err) {
      // Final fallback - show URL in alert for manual copying
      alert(
        `Unable to copy automatically. Please copy manually:\n${urlToCopy}`
      );
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

  // Validate post on mount and when post changes
  useEffect(() => {
    validatePost();
  }, [validatePost]);

  // Auto-shorten URL based on validation
  useEffect(() => {
    if (validationStatus.shouldAutoShorten && !shortUrl && !isLoading) {
      createShortUrl();
    } else if (!validationStatus.shouldAutoShorten && !shortUrl) {
      // For legacy posts, just set the long URL
      setShortUrl(longUrl);
    }
  }, [
    validationStatus.shouldAutoShorten,
    shortUrl,
    isLoading,
    createShortUrl,
    longUrl,
    post?.slug,
    validationStatus.isNewPost,
  ]);

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
    validationStatus,

    // Actions
    createShortUrl,
    fetchAnalytics,
    copyToClipboard,
    getSharingUrls,

    // Computed values
    isShortened:
      !!shortUrl && shortUrl !== longUrl && validationStatus.isNewPost,
    hasAnalytics: !!analytics,
    isNewPost: validationStatus.isNewPost,
    shouldHaveShortUrl: validationStatus.shouldAutoShorten,

    // Utilities
    refresh: () => createShortUrl({ force: true }),
    clearError: () => setError(null),
    forceCreateShortUrl: () => createShortUrl({ force: true }),
  };
};

/**
 * Hook for bulk URL shortening with validation
 * @param {Array} posts - Array of post objects
 * @param {Object} options - Configuration options
 * @returns {Object} Bulk shortening state and functions
 */
export const useBulkTinyUrl = (posts, options = {}) => {
  const {
    baseUrl = "https://blog.urtechy.com",
    onlyNewPosts = true, // Only process posts that should have TinyURLs
  } = options;

  const [shortUrls, setShortUrls] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [validationResults, setValidationResults] = useState({});

  // Filter posts based on validation
  const eligiblePosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      const isEligible = onlyNewPosts ? shouldHaveTinyUrl(post) : true;
      return isEligible && post.slug;
    });
  }, [posts, onlyNewPosts]);

  const shortenAllUrls = useCallback(async () => {
    if (!eligiblePosts || eligiblePosts.length === 0) return;

    setIsLoading(true);
    setErrors({});
    setValidationResults({});
    setProgress({ completed: 0, total: eligiblePosts.length });

    const results = {};
    const errorResults = {};
    const validation = {};

    for (let i = 0; i < eligiblePosts.length; i++) {
      const post = eligiblePosts[i];

      validation[post.slug] = {
        isNewPost: shouldHaveTinyUrl(post),
        publishDate: post.publishedAt || post.createdAt,
        processed: true,
      };

      try {
        const shortUrl = await tinyUrlService.shortenPostUrl(post, baseUrl);
        results[post.slug] = shortUrl;

        // Bulk TinyURL created successfully
      } catch (error) {
        console.error(`❌ Error shortening URL for post ${post.slug}:`, error);
        errorResults[post.slug] = error.message;
        results[post.slug] = `${baseUrl}/post/${post.slug}`; // Fallback
      }

      setProgress({ completed: i + 1, total: eligiblePosts.length });

      // Small delay to avoid rate limiting
      if (i < eligiblePosts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    setShortUrls(results);
    setErrors(errorResults);
    setValidationResults(validation);
    setIsLoading(false);
  }, [eligiblePosts, baseUrl]);

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
    validationResults,
    eligiblePosts,
    shortenAllUrls,
    getShortUrl,
    hasErrors: Object.keys(errors).length > 0,
    isCompleted: progress.completed === progress.total && progress.total > 0,
    totalEligible: eligiblePosts.length,
    totalOriginal: posts?.length || 0,
  };
};

export default useTinyUrl;
