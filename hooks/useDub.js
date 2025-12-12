/**
 * useDub Hook - React hook for Dub.co link shortening
 * Provides easy access to short URLs in components
 * 
 * Usage:
 * const { shortUrl, isLoading, copyToClipboard, copied } = useDub(post);
 */

import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * Main hook for single post URL shortening
 * @param {Object} post - Post object with slug, shortUrl
 * @param {Object} options - Configuration options
 * @returns {Object} - Hook state and functions
 */
export const useDub = (post, options = {}) => {
  const {
    baseUrl = "https://blog.urtechy.com",
    autoFetch = true,
    enabled = true,
  } = options;

  const [shortUrl, setShortUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Generate long URL from post
  const longUrl = useMemo(() => {
    if (!post?.slug) return null;
    return `${baseUrl}/post/${post.slug}`;
  }, [post?.slug, baseUrl]);

  // Initialize short URL from post data (from Hygraph)
  // No on-demand creation - short URLs are only created via Hygraph webhook
  useEffect(() => {
    if (!enabled || !post?.slug) return;

    // If post already has shortUrl from Hygraph, use it
    if (post.shortUrl) {
      setShortUrl(post.shortUrl);
      setIsLoading(false);
      return;
    }

    // No shortUrl yet - use long URL as fallback
    // Short URL will be created when post is published via webhook
    setShortUrl(longUrl);
    setIsLoading(false);
  }, [post?.slug, post?.shortUrl, longUrl, enabled]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(async () => {
    const urlToCopy = shortUrl || longUrl;
    if (!urlToCopy) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(urlToCopy);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = urlToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  }, [shortUrl, longUrl]);

  // Share function using Web Share API
  const share = useCallback(
    async (options = {}) => {
      const urlToShare = shortUrl || longUrl;
      const title = options.title || post?.title || "Check out this article";
      const text = options.text || "";

      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url: urlToShare,
          });
          return true;
        } catch (err) {
          if (err.name !== "AbortError") {
            console.error("Share failed:", err);
          }
          return false;
        }
      }

      // Fallback to copy if Web Share not available
      return copyToClipboard();
    },
    [shortUrl, longUrl, post?.title, copyToClipboard]
  );

  // Generate share URLs for different platforms
  const shareUrls = useMemo(() => {
    const url = encodeURIComponent(shortUrl || longUrl || "");
    const title = encodeURIComponent(post?.title || "");

    return {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${title}`,
      email: `mailto:?subject=${title}&body=${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${title}`,
    };
  }, [shortUrl, longUrl, post?.title]);

  return {
    shortUrl: shortUrl || longUrl,
    longUrl,
    isLoading,
    error,
    copied,
    copyToClipboard,
    share,
    shareUrls,
    isShortened: shortUrl && shortUrl !== longUrl,
  };
};

/**
 * Hook for bulk URL operations
 * @param {Array} posts - Array of post objects
 * @param {Object} options - Configuration options
 */
export const useBulkDub = (posts, options = {}) => {
  const { baseUrl = "https://blog.urtechy.com" } = options;

  const [shortUrls, setShortUrls] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Generate short URLs map from existing post data
  useEffect(() => {
    if (!posts || !Array.isArray(posts)) return;

    const urlMap = {};
    posts.forEach((post) => {
      if (post?.slug) {
        // Use existing shortUrl if available, otherwise use long URL
        urlMap[post.slug] = post.shortUrl || `${baseUrl}/post/${post.slug}`;
      }
    });

    setShortUrls(urlMap);
  }, [posts, baseUrl]);

  // Get short URL for a specific slug
  const getShortUrl = useCallback(
    (slug) => {
      return shortUrls[slug] || `${baseUrl}/post/${slug}`;
    },
    [shortUrls, baseUrl]
  );

  return {
    shortUrls,
    isLoading,
    getShortUrl,
    count: Object.keys(shortUrls).length,
  };
};

// Default export
export default useDub;
