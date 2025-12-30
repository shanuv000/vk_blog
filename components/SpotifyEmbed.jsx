"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * SpotifyEmbed - Mobile-optimized Spotify player component with lazy loading
 * Supports: tracks, albums, playlists, episodes, and shows (podcasts)
 *
 * Features:
 * - Intersection Observer for lazy loading
 * - Click-to-load preview card
 * - Fully responsive & mobile-optimized
 * - Touch-friendly interactions
 * - Loading states and error handling
 *
 * @param {string} url - Spotify URL (regular or embed format)
 * @param {string} type - Optional: 'track', 'album', 'playlist', 'episode', 'show'
 * @param {string} theme - Optional: 'dark' or 'light' (default: 0 = dark)
 * @param {boolean} compact - Optional: Use compact player height
 * @param {boolean} autoLoad - Optional: Auto-load without click (default: false)
 */
const SpotifyEmbed = ({
  url,
  type: providedType,
  theme = "dark",
  compact = false,
  autoLoad = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(autoLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
        rootMargin: "100px", // Start loading 100px before it enters viewport
        threshold: 0.1,
      }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // Parse Spotify URL and extract embed information
  const embedInfo = useMemo(() => {
    if (!url) return null;

    try {
      const patterns = {
        regular:
          /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
        embed:
          /open\.spotify\.com\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
      };

      let type = null;
      let id = null;

      const embedMatch = url.match(patterns.embed);
      if (embedMatch) {
        type = embedMatch[1];
        id = embedMatch[2];
      } else {
        const regularMatch = url.match(patterns.regular);
        if (regularMatch) {
          type = regularMatch[1];
          id = regularMatch[2];
        }
      }

      if (providedType) {
        type = providedType;
      }

      if (!type || !id) {
        console.warn("Could not parse Spotify URL:", url);
        return null;
      }

      const themeParam = theme === "light" ? "1" : "0";
      const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${themeParam}`;

      return { type, id, embedUrl };
    } catch (error) {
      console.error("Error parsing Spotify URL:", error);
      return null;
    }
  }, [url, providedType, theme]);

  // Determine player height based on content type - Mobile optimized
  const playerHeight = useMemo(() => {
    if (!embedInfo) return 152;

    if (compact) {
      return 152;
    }

    // Slightly smaller heights on mobile for better fit
    switch (embedInfo.type) {
      case "track":
        return 152;
      case "episode":
        return 232;
      case "album":
      case "playlist":
      case "show":
        return 352;
      default:
        return 232;
    }
  }, [embedInfo, compact]);

  // Get content type label
  const contentTypeLabel = useMemo(() => {
    if (!embedInfo) return "Spotify content";

    const labels = {
      track: "Track",
      album: "Album",
      playlist: "Playlist",
      episode: "Podcast Episode",
      show: "Podcast",
    };

    return labels[embedInfo.type] || "Content";
  }, [embedInfo]);

  // Handle click/tap to load
  const handleLoadClick = () => {
    setShouldLoad(true);
  };

  // Error state - Mobile optimized
  if (!embedInfo || hasError) {
    return (
      <div className="my-6 sm:my-8 mx-auto max-w-2xl px-4 sm:px-0">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 sm:p-6 text-center shadow-lg border border-gray-700">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
            <SpotifyIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            <span className="text-white font-medium text-sm sm:text-base">
              Spotify
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">
            {hasError
              ? "Unable to load Spotify content"
              : "Invalid Spotify URL"}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 sm:py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-medium rounded-full transition-colors touch-manipulation"
            >
              Open in Spotify
              <ExternalLinkIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 sm:my-8 mx-auto max-w-2xl px-4 sm:px-0"
    >
      {/* Click-to-load preview card - Mobile optimized */}
      {isVisible && !shouldLoad && (
        <button
          onClick={handleLoadClick}
          className="w-full group cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-xl touch-manipulation"
          aria-label={`Load Spotify ${contentTypeLabel}`}
        >
          <div
            className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl sm:group-hover:scale-[1.02] active:scale-[0.98]"
            style={{ height: playerHeight }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />

            {/* Spotify pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, rgba(30, 215, 96, 0.3) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, rgba(30, 215, 96, 0.2) 0%, transparent 50%)`,
                }}
              />
            </div>

            {/* Content - Mobile responsive */}
            <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6">
              {/* Spotify logo and play button - Responsive sizes */}
              <div className="relative mb-3 sm:mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform duration-300">
                  <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 text-black ml-0.5 sm:ml-1" />
                </div>
                {/* Spotify icon badge */}
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 bg-black rounded-full flex items-center justify-center border-2 border-gray-800">
                  <SpotifyIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                </div>
              </div>

              {/* Text - Responsive */}
              <p className="text-white font-semibold text-base sm:text-lg mb-0.5 sm:mb-1">
                {contentTypeLabel}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                <SpotifyIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                <span className="hidden xs:inline">Click to load</span>
                <span className="xs:hidden">Tap to play</span>
              </p>

              {/* Powered by - Hidden on very small screens */}
              <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 hidden sm:flex justify-center">
                <span className="text-[10px] sm:text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Powered by Spotify
                </span>
              </div>
            </div>

            {/* Border glow effect */}
            <div className="absolute inset-0 rounded-xl border border-gray-700 group-hover:border-green-500/50 group-active:border-green-500 transition-colors pointer-events-none" />
          </div>
        </button>
      )}

      {/* Loading skeleton - Mobile optimized */}
      {isVisible && shouldLoad && !isLoaded && (
        <div
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl animate-pulse flex items-center justify-center"
          style={{ height: playerHeight }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <SpotifyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 animate-bounce" />
            <span className="text-gray-400 text-xs sm:text-sm">
              Loading {contentTypeLabel}...
            </span>
          </div>
        </div>
      )}

      {/* Spotify iframe - Responsive */}
      {isVisible && shouldLoad && (
        <iframe
          src={embedInfo.embedUrl}
          width="100%"
          height={playerHeight}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Spotify ${contentTypeLabel}`}
          className={`rounded-xl shadow-lg transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0 absolute"
          }`}
          style={{
            colorScheme: "normal",
            position: isLoaded ? "relative" : "absolute",
            // Ensure touch scrolling works within iframe on iOS
            WebkitOverflowScrolling: "touch",
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Placeholder when not visible yet - Mobile optimized */}
      {!isVisible && (
        <div
          className="bg-gray-800/50 rounded-xl flex items-center justify-center"
          style={{ height: playerHeight }}
        >
          <div className="flex items-center gap-2 text-gray-500">
            <SpotifyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xs sm:text-sm">Spotify Player</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Spotify Logo Icon
const SpotifyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

// Play Icon
const PlayIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

// External Link Icon
const ExternalLinkIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);

/**
 * Utility function to check if a URL is a Spotify URL
 */
export const isSpotifyUrl = (url) => {
  if (!url) return false;
  return (
    url.includes("open.spotify.com") ||
    url.includes("spotify.com/embed") ||
    url.includes("spotify.link")
  );
};

/**
 * Utility function to convert regular Spotify URL to embed URL
 */
export const getSpotifyEmbedUrl = (url, theme = "dark") => {
  if (!url) return null;

  const patterns = {
    regular:
      /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
    embed:
      /open\.spotify\.com\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
  };

  const embedMatch = url.match(patterns.embed);
  if (embedMatch) {
    const themeParam = theme === "light" ? "1" : "0";
    return `https://open.spotify.com/embed/${embedMatch[1]}/${embedMatch[2]}?utm_source=generator&theme=${themeParam}`;
  }

  const regularMatch = url.match(patterns.regular);
  if (regularMatch) {
    const themeParam = theme === "light" ? "1" : "0";
    return `https://open.spotify.com/embed/${regularMatch[1]}/${regularMatch[2]}?utm_source=generator&theme=${themeParam}`;
  }

  return null;
};

export default SpotifyEmbed;
