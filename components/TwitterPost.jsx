import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { getOptimizedImageUrl } from "../lib/image-config";
import { hasRendered, markRendered } from "../utils/renderedTweets";

const TwitterPost = ({ tweetId, className = "", variant = "card", onError }) => {
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
                 console.log(`🔄 Rate limited on oEmbed for ${tweetId}, falling back to data API`);
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
      return;
    }
    
    setLoading(true);
    const controller = new AbortController();
    controllerRef.current = controller;

    // Try oEmbed first (true), then fallback to API
    fetchTweet(controller.signal, true)
      .then((data) => {
        if (!controller.signal.aborted) {
          setTweet(data.data);
          setLoading(false);
          markRendered(tweetId);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error(`TwitterPost: Failed to load tweet ${tweetId}`, err);
          setError(err.message);
          setLoading(false);
          if (onError) {
            onError(err);
          }
        }
      });

    return () => {
      controller.abort();
    };
  }, [tweetId, isVisible, fetchTweet, onError]);

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
    // If we have an error, we return null so the parent can handle the fallback
    // The onError callback was already called in the catch block
    return null;
  }

  if (!tweet) {
    return <div ref={containerRef} className={className} />;
  }

  // If we have oEmbed HTML (from oEmbed endpoint), render that
  if (tweet.html) {
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: tweet.html }}
        ref={(node) => {
           containerRef.current = node;
           if (node && window.twttr?.widgets?.load) {
             window.twttr.widgets.load(node);
           }
        }}
      />
    );
  }

  const timeAgo = tweet.createdAt
    ? formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })
    : "";

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

  return (
    <div
      ref={containerRef}
      className={`${
        isInline
          ? ""
          : "border border-gray-200 rounded-lg p-3 md:p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
      } ${className} w-full max-w-full overflow-hidden`}
    >
      {/* Header */}
      <div
        className={`flex items-center space-x-2 md:space-x-3 ${isInline ? "mb-2" : "mb-2 md:mb-3"}`}
      >
        {tweet.author?.profileImageUrl && (
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            <Image
              src={getOptimizedImageUrl(tweet.author.profileImageUrl, "avatar")}
              alt={`${tweet.author.name} profile`}
              fill
              className="rounded-full object-cover"
              sizes="(max-width: 768px) 40px, 48px"
              quality={70}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 flex-wrap">
            <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">
              {tweet.author?.name || "Unknown User"}
            </h3>
            {tweet.author?.verified && (
              <svg
                className="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-1 text-xs md:text-sm text-gray-500">
            <span className="truncate">@{tweet.author?.username || "unknown"}</span>
            <span>•</span>
            <span className="whitespace-nowrap">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Tweet Content */}
      <div className={isInline ? "mb-2" : "mb-2 md:mb-3"}>
        <div
          className="text-gray-900 leading-relaxed whitespace-pre-wrap text-sm md:text-base break-words"
          dangerouslySetInnerHTML={{
            __html: formatText(tweet.text, tweet.entities),
          }}
        />
      </div>

      {/* Media */}
      {tweet.media && tweet.media.length > 0 && (
        <div className={isInline ? "mb-2" : "mb-2 md:mb-3"}>
          {tweet.media.map((media, index) => (
            <div key={index} className="mt-2">
              {media.type === "photo" && media.url && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 w-full">
                  <Image
                    src={getOptimizedImageUrl(media.url, "featured")}
                    alt={media.altText || "Tweet image"}
                    width={media.width || 600}
                    height={media.height || 400}
                    className="w-full h-auto object-cover"
                    quality={70}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 600px"
                    style={{
                      maxHeight: "400px",
                    }}
                  />
                </div>
              )}
              {media.type === "video" && media.previewImageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 w-full">
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
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, 600px"
                    style={{
                      maxHeight: "400px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <svg
                      className="w-12 h-12 md:w-16 md:h-16 text-white"
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
        className={`flex items-center justify-between text-xs md:text-sm text-gray-500 ${
          isInline ? "pt-2" : "border-t border-gray-100 pt-2 md:pt-3"
        }`}
      >
        <div className="flex items-center space-x-4 md:space-x-6">
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
        </div>
        <div className="ml-2">
          <a
            href={tweet.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline whitespace-nowrap"
          >
            View on X
          </a>
        </div>
      </div>
    </div>
  );
};

export default TwitterPost;
