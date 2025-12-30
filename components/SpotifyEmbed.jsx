"use client";

import React, { useState, useMemo } from "react";

/**
 * SpotifyEmbed - Optimized Spotify player component
 * Supports: tracks, albums, playlists, episodes, and shows (podcasts)
 *
 * @param {string} url - Spotify URL (regular or embed format)
 * @param {string} type - Optional: 'track', 'album', 'playlist', 'episode', 'show'
 * @param {string} theme - Optional: 'dark' or 'light' (default: 0 = dark)
 * @param {boolean} compact - Optional: Use compact player height
 */
const SpotifyEmbed = ({
  url,
  type: providedType,
  theme = "dark",
  compact = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Parse Spotify URL and extract embed information
  const embedInfo = useMemo(() => {
    if (!url) return null;

    try {
      // Patterns to match different Spotify URL formats
      const patterns = {
        // Regular URL: https://open.spotify.com/track/ID or https://open.spotify.com/track/ID?si=xxx
        regular: /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
        // Embed URL: https://open.spotify.com/embed/track/ID
        embed: /open\.spotify\.com\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
      };

      let type = null;
      let id = null;

      // Try embed pattern first
      const embedMatch = url.match(patterns.embed);
      if (embedMatch) {
        type = embedMatch[1];
        id = embedMatch[2];
      } else {
        // Try regular pattern
        const regularMatch = url.match(patterns.regular);
        if (regularMatch) {
          type = regularMatch[1];
          id = regularMatch[2];
        }
      }

      // Use provided type if available
      if (providedType) {
        type = providedType;
      }

      if (!type || !id) {
        console.warn("Could not parse Spotify URL:", url);
        return null;
      }

      // Build embed URL with theme parameter
      const themeParam = theme === "light" ? "1" : "0";
      const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${themeParam}`;

      return { type, id, embedUrl };
    } catch (error) {
      console.error("Error parsing Spotify URL:", error);
      return null;
    }
  }, [url, providedType, theme]);

  // Determine player height based on content type
  const playerHeight = useMemo(() => {
    if (!embedInfo) return 152;

    if (compact) {
      return 152; // Compact height for all types
    }

    // Recommended heights for different content types
    switch (embedInfo.type) {
      case "track":
        return 152; // Single track - compact
      case "episode":
        return 232; // Podcast episode - medium
      case "album":
      case "playlist":
      case "show":
        return 352; // Collections - full height with artwork
      default:
        return 232;
    }
  }, [embedInfo, compact]);

  // Get content type label for accessibility
  const contentTypeLabel = useMemo(() => {
    if (!embedInfo) return "Spotify content";

    const labels = {
      track: "Spotify track",
      album: "Spotify album",
      playlist: "Spotify playlist",
      episode: "Spotify podcast episode",
      show: "Spotify podcast",
    };

    return labels[embedInfo.type] || "Spotify content";
  }, [embedInfo]);

  // Error state
  if (!embedInfo || hasError) {
    return (
      <div className="my-8 mx-auto max-w-2xl">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-center shadow-lg border border-gray-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg
              className="w-8 h-8 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-white font-medium">Spotify</span>
          </div>
          <p className="text-gray-400 text-sm">
            {hasError
              ? "Unable to load Spotify content"
              : "Invalid Spotify URL"}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-full transition-colors"
            >
              Open in Spotify
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 mx-auto max-w-2xl">
      {/* Loading skeleton */}
      {!isLoaded && (
        <div
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl animate-pulse flex items-center justify-center"
          style={{ height: playerHeight }}
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-10 h-10 text-green-500 animate-bounce"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-gray-400 text-sm">Loading {contentTypeLabel}...</span>
          </div>
        </div>
      )}

      {/* Spotify iframe */}
      <iframe
        src={embedInfo.embedUrl}
        width="100%"
        height={playerHeight}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={contentTypeLabel}
        className={`rounded-xl shadow-lg transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0 absolute"
        }`}
        style={{
          colorScheme: "normal",
          position: isLoaded ? "relative" : "absolute",
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

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
    regular: /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
    embed: /open\.spotify\.com\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
  };

  // Already an embed URL
  const embedMatch = url.match(patterns.embed);
  if (embedMatch) {
    const themeParam = theme === "light" ? "1" : "0";
    return `https://open.spotify.com/embed/${embedMatch[1]}/${embedMatch[2]}?utm_source=generator&theme=${themeParam}`;
  }

  // Regular URL - convert to embed
  const regularMatch = url.match(patterns.regular);
  if (regularMatch) {
    const themeParam = theme === "light" ? "1" : "0";
    return `https://open.spotify.com/embed/${regularMatch[1]}/${regularMatch[2]}?utm_source=generator&theme=${themeParam}`;
  }

  return null;
};

export default SpotifyEmbed;
