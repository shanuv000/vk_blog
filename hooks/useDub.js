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

  // Initialize short URL from post data or fetch on-demand
  useEffect(() => {
    if (!enabled || !post?.slug) return;

    // If post already has shortUrl from Hygraph, use it directly
    if (post.shortUrl) {
      setShortUrl(post.shortUrl);
      setIsLoading(false);
      return;
    }

    // If autoFetch is disabled, just use long URL
    if (!autoFetch) {
      setShortUrl(longUrl);
      return;
    }

    // Fetch short URL on-demand via API
    const fetchShortUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/create-dub-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            post: {
              slug: post.slug,
              title: post.title,
              id: post.id,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create short URL");
        }

        const data = await response.json();
        setShortUrl(data.shortUrl || longUrl);
      } catch (err) {
        console.error("Error fetching short URL:", err);
        setError(err.message);
        setShortUrl(longUrl); // Fallback to long URL
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have a cached short URL
    fetchShortUrl();
  }, [post?.slug, post?.shortUrl, longUrl, autoFetch, enabled]);

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
