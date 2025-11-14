import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { getOptimizedImageUrl } from "../lib/image-config";
import { hasRendered, markRendered } from "../utils/renderedTweets";

// Use dynamic import to avoid SSR issues with the legacy embed library
const LegacyTwitterEmbed = dynamic(() => import("./Blog/TwitterEmbed"), {
  ssr: false,
});

const TwitterPost = ({ tweetId, className = "", variant = "card" }) => {
  const [tweet, setTweet] = useState(null);
  // Start not loading; we'll show a light placeholder until visible
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const isInline = variant === "inline";

  // Refs for intersection observer and fetch aborting
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  // Fetch tweet data with optional oEmbed support
  const fetchTweet = useCallback(
    async (signal, useOembed = false) => {
      try {
        // Use oEmbed endpoint for better caching (1 hour vs 15 min) and rate limit handling
        const endpoint = useOembed
          ? `/api/twitter/oembed/${tweetId}`
          : `/api/twitter/tweet/${tweetId}`;

        const response = await fetch(endpoint, {
          signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            // If rate limited on oEmbed, try regular API (which has stale cache fallback)
            if (useOembed) {
              if (process.env.NODE_ENV === 'development') {

                if (process.env.NODE_ENV === 'development') {


                  console.log(
                `🔄 Rate limited on oEmbed for ${tweetId}, falling back to data API`
              );


                }

              }
              return fetchTweet(signal, false);
            }
            throw new Error("Rate limit exceeded");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data;
      } catch (err) {
        // Re-throw abort errors as-is
        if (err.name === "AbortError") {
          throw err;
        }
        throw err;
      }
    },
    [tweetId]
  );

  // Observe visibility and fetch only when near viewport
  useEffect(() => {
    if (!containerRef.current || isVisible) {return;}
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  // Trigger fetch when visible, with same-page dedupe
  useEffect(() => {
    if (!isVisible) {return;}
    // Avoid duplicate widgets for same tweet within a page render
    if (hasRendered(tweetId)) {
      setLoading(false);
      setTweet(null);
      setError(null);
      setIsRateLimit(false);
      return;
    }
    fetchTweet();
  }, [tweetId, isVisible]);

  // Cleanup on unmount: abort in-flight fetch
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        try {
          controllerRef.current.abort();
        } catch (_) {}
      }
    };
  }, []);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    fetchTweet();
  };

  const formatText = (text, entities) => {
    if (!entities) {return text;}

    let formattedText = text;

    // Replace URLs with links
    if (entities.urls) {
      entities.urls.forEach((url) => {
        const linkText = url.display_url || url.expanded_url;
        formattedText = formattedText.replace(
          url.url,
          `<a href="${url.expanded_url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${linkText}</a>`
        );
      });
    }

    // Replace mentions with links
    if (entities.mentions) {
      entities.mentions.forEach((mention) => {
        formattedText = formattedText.replace(
          `@${mention.username}`,
          `<a href="https://twitter.com/${mention.username}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">@${mention.username}</a>`
        );
      });
    }

    // Replace hashtags with links
    if (entities.hashtags) {
      entities.hashtags.forEach((hashtag) => {
        formattedText = formattedText.replace(
          `#${hashtag.tag}`,
          `<a href="https://twitter.com/hashtag/${hashtag.tag}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">#${hashtag.tag}</a>`
        );
      });
    }

    return formattedText;
  };

  // Before visible, render a lightweight placeholder to avoid layout shift
  if (!isVisible) {
    return (
      <div ref={containerRef} className={className}>
        {isInline ? (
          <div className="h-24 w-full animate-pulse bg-gray-50 rounded" />
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <div className="h-28 w-full animate-pulse bg-gray-50 rounded" />
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        ref={containerRef}
        className={`${
          isInline
            ? ""
            : "border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        } ${className}`}
      >
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
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // If rate limited, switch to legacy client embed without showing the large card
    if (isRateLimit) {
      // Ensure dedupe even when using fallback embed
      markRendered(tweetId);
      return (
        <div ref={containerRef} className={className}>
          {isInline ? (
            <LegacyTwitterEmbed tweetId={tweetId} useApiVersion={false} />
          ) : (
            <div className="border border-gray-200 rounded-lg bg-white p-2">
              <LegacyTwitterEmbed tweetId={tweetId} useApiVersion={false} />
            </div>
          )}
        </div>
      );
    }

    // Enhanced fallback for other errors
    return (
      <div
        ref={containerRef}
        className={`${
          isInline
            ? ""
            : "border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        } ${className}`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <span className="font-medium text-gray-900">Twitter Post</span>
          </div>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
            Error
          </span>
        </div>

        <div className="text-gray-600 mb-4">
          <p className="text-sm mb-2">Unable to load this tweet.</p>
          <div className="bg-gray-50 border-l-4 border-red-400 p-3 rounded">
            <p className="text-xs text-gray-500 mb-1">Tweet ID: {tweetId}</p>
            <p className="text-xs text-gray-500">Error: {error}</p>
          </div>
        </div>

        <div
          className={`flex items-center justify-between ${
            isInline ? "pt-2" : "pt-3 border-t border-gray-100"
          }`}
        >
          <a
            href={`https://twitter.com/i/status/${tweetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>View on X (Twitter)</span>
          </a>
          <button
            onClick={handleRetry}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Retry {retryCount > 0 && `(${retryCount})`}
          </button>
        </div>
      </div>
    );
  }

  if (!tweet) {
    return <div ref={containerRef} className={className} />;
  }

  const timeAgo = tweet.createdAt
    ? formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })
    : "";

  return (
    <div
      ref={containerRef}
      className={`${
        isInline
          ? ""
          : "border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
      } ${className}`}
    >
      {/* Header */}
      <div
        className={`flex items-center space-x-3 ${isInline ? "mb-2" : "mb-3"}`}
      >
        {tweet.author?.profileImageUrl && (
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={getOptimizedImageUrl(tweet.author.profileImageUrl, "avatar")}
              alt={`${tweet.author.name} profile`}
              fill
              className="rounded-full object-cover"
              sizes="48px"
              quality={70}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <h3 className="font-bold text-gray-900 truncate">
              {tweet.author?.name || "Unknown User"}
            </h3>
            {tweet.author?.verified && (
              <svg
                className="w-4 h-4 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>@{tweet.author?.username || "unknown"}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Tweet Content */}
      <div className={isInline ? "mb-2" : "mb-3"}>
        <div
          className="text-gray-900 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{
            __html: formatText(tweet.text, tweet.entities),
          }}
        />
      </div>

      {/* Media */}
      {tweet.media && tweet.media.length > 0 && (
        <div className={isInline ? "mb-2" : "mb-3"}>
          {tweet.media.map((media, index) => (
            <div key={index} className="mt-2">
              {media.type === "photo" && media.url && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={getOptimizedImageUrl(media.url, "featured")}
                    alt={media.altText || "Tweet image"}
                    width={media.width || 600}
                    height={media.height || 400}
                    className="w-full h-auto object-cover"
                    quality={70}
                    sizes="(max-width: 640px) 100vw, 600px"
                    style={{
                      maxHeight: "400px",
                    }}
                  />
                </div>
              )}
              {media.type === "video" && media.previewImageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={getOptimizedImageUrl(
                      media.previewImageUrl,
                      "featured"
                    )}
                    alt={media.altText || "Tweet video"}
                    width={media.width || 600}
                    height={media.height || 400}
                    className="w-full h-auto object-cover"
                    quality={70}
                    sizes="(max-width: 640px) 100vw, 600px"
                    style={{
                      maxHeight: "400px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <svg
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div
        className={`flex items-center space-x-4 text-sm text-gray-500 ${
          isInline ? "pt-2" : "border-t border-gray-100 pt-3"
        }`}
      >
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{tweet.metrics?.reply_count || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{tweet.metrics?.retweet_count || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{tweet.metrics?.like_count || 0}</span>
        </div>
        <div className="ml-auto">
          <a
            href={tweet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View on Twitter
          </a>
        </div>
      </div>
    </div>
  );
};

export default TwitterPost;
