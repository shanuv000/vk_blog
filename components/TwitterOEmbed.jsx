import React, { useState, useEffect, useRef } from "react";

/**
 * TwitterOEmbed Component
 *
 * Uses the server-side oEmbed API endpoint for optimal caching and rate limit handling.
 * This component is simpler and more efficient than TwitterPost as it:
 * - Uses Twitter's official oEmbed HTML (no custom rendering)
 * - Benefits from 1-hour server cache (vs 15 min)
 * - Has stale cache fallback for rate limit scenarios
 * - Requires fewer API calls and resources
 *
 * Use this for blog posts where you want embedded tweets with minimal overhead.
 * Use TwitterPost for cases where you need custom tweet rendering or data access.
 */
const TwitterOEmbed = ({ tweetId, className = "" }) => {
  const [html, setHtml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Clean and validate tweet ID
  const cleanTweetId = tweetId?.toString().trim();
  const isValidTweetId =
    cleanTweetId && /^\d+$/.test(cleanTweetId) && cleanTweetId.length > 8;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!containerRef.current || !isValidTweetId) {return;}

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading when 200px before visible
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isValidTweetId]);

  // Fetch oEmbed HTML when visible
  useEffect(() => {
    if (!isVisible || !isValidTweetId) {return;}

    const controller = new AbortController();

    const fetchOEmbed = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/twitter/oembed/${cleanTweetId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Tweet not found"
              : response.status === 429
              ? "Rate limit exceeded"
              : `Failed to load tweet (${response.status})`
          );
        }

        const data = await response.json();

        if (data.html) {
          setHtml(data.html);

          // OPTIMIZED: Use requestAnimationFrame instead of setTimeout for better scheduling
          requestAnimationFrame(() => {
            if (window.twttr?.widgets?.load) {
              try {
                window.twttr.widgets.load(containerRef.current);
              } catch (e) {
                console.error("Failed to load Twitter widgets:", e);
              }
            }
          });
        } else {
          throw new Error("No HTML in response");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(`Failed to load oEmbed for ${cleanTweetId}:`, err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOEmbed();

    return () => {
      controller.abort();
    };
  }, [isVisible, cleanTweetId, isValidTweetId]);

  // Load Twitter widgets script if not already loaded
  useEffect(() => {
    if (typeof window === "undefined") {return;}

    // Check if Twitter widgets script is already loaded
    if (window.twttr) {return;}

    // Check if script tag already exists
    if (document.getElementById("twitter-widgets-script")) {return;}

    // Load Twitter widgets script
    const script = document.createElement("script");
    script.id = "twitter-widgets-script";
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Don't remove the script on unmount as it may be used by other components
    };
  }, []);

  // Invalid tweet ID
  if (!isValidTweetId) {
    return (
      <div
        ref={containerRef}
        className={`p-4 border border-gray-200 rounded-lg bg-gray-50 text-center ${className}`}
      >
        <p className="text-gray-500 text-sm">Invalid tweet ID: {tweetId}</p>
      </div>
    );
  }

  // Before visible - lightweight placeholder
  if (!isVisible) {
    return (
      <div ref={containerRef} className={className}>
        <div className="h-32 w-full animate-pulse bg-gray-50 rounded" />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div ref={containerRef} className={className}>
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        ref={containerRef}
        className={`border border-red-100 rounded-lg p-4 bg-red-50 ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <span className="font-medium text-red-900">
              Failed to load tweet
            </span>
          </div>
        </div>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <a
          href={`https://twitter.com/i/status/${cleanTweetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>View on X (Twitter)</span>
        </a>
      </div>
    );
  }

  // Render oEmbed HTML
  return (
    <div
      ref={containerRef}
      className={`twitter-oembed-container ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default TwitterOEmbed;
