"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";

/**
 * SpotifyEmbed - Premium Spotify player component with lazy loading
 * Supports: tracks, albums, playlists, episodes, and shows (podcasts)
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
  const [isHovered, setIsHovered] = useState(false);
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
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Parse Spotify URL
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

      if (providedType) type = providedType;
      if (!type || !id) return null;

      const themeParam = theme === "light" ? "1" : "0";
      const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=${themeParam}`;

      return { type, id, embedUrl };
    } catch (error) {
      return null;
    }
  }, [url, providedType, theme]);

  // Player height
  const playerHeight = useMemo(() => {
    if (!embedInfo) return 152;
    if (compact) return 152;

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

  // Content type info
  const contentInfo = useMemo(() => {
    if (!embedInfo) return { label: "Content", icon: "🎵", color: "#1DB954" };

    const info = {
      track: { label: "Play Track", icon: "🎵", color: "#1DB954" },
      album: { label: "Play Album", icon: "💿", color: "#1DB954" },
      playlist: { label: "Play Playlist", icon: "📀", color: "#1DB954" },
      episode: { label: "Listen Now", icon: "🎙️", color: "#1DB954" },
      show: { label: "Listen to Podcast", icon: "🎧", color: "#1DB954" },
    };

    return info[embedInfo.type] || info.track;
  }, [embedInfo]);

  const handleLoadClick = () => setShouldLoad(true);

  // Error state
  if (!embedInfo || hasError) {
    return (
      <div className="my-6 sm:my-8 mx-auto max-w-2xl px-4 sm:px-0">
        <div className="relative overflow-hidden rounded-2xl bg-[#121212] p-6 sm:p-8 text-center border border-white/10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SpotifyLogo className="w-8 h-8" />
          </div>
          <p className="text-white/60 text-sm mb-4">
            {hasError ? "Unable to load content" : "Invalid Spotify URL"}
          </p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] active:scale-95 text-black font-bold text-sm rounded-full transition-all duration-200"
            >
              Open in Spotify
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
      {/* Premium Click-to-load Preview */}
      {isVisible && !shouldLoad && (
        <button
          onClick={handleLoadClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full group focus:outline-none focus:ring-2 focus:ring-[#1DB954] focus:ring-offset-2 focus:ring-offset-black rounded-2xl touch-manipulation"
          aria-label={`Load Spotify ${contentInfo.label}`}
        >
          <div
            className="relative overflow-hidden rounded-2xl transition-all duration-500 ease-out"
            style={{ height: playerHeight }}
          >
            {/* Premium gradient background */}
            <div className="absolute inset-0 bg-[#121212]" />
            
            {/* Animated gradient overlay */}
            <div 
              className="absolute inset-0 opacity-60 transition-opacity duration-500"
              style={{
                background: `
                  radial-gradient(ellipse 80% 50% at 50% -20%, rgba(29, 185, 84, 0.15) 0%, transparent 50%),
                  radial-gradient(ellipse 60% 40% at 100% 100%, rgba(29, 185, 84, 0.1) 0%, transparent 50%),
                  radial-gradient(ellipse 40% 30% at 0% 100%, rgba(29, 185, 84, 0.08) 0%, transparent 50%)
                `,
              }}
            />

            {/* Hover glow effect */}
            <div 
              className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(29, 185, 84, 0.2) 0%, transparent 70%)',
              }}
            />

            {/* Content Container */}
            <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8">
              
              {/* Sound wave animation bars */}
              <div className="absolute top-4 left-4 flex items-end gap-1 h-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-1 bg-[#1DB954]/40 rounded-full transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}
                    style={{
                      height: `${12 + (i % 3) * 8}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>

              {/* Spotify Logo top right */}
              <div className="absolute top-4 right-4">
                <SpotifyLogo className="w-6 h-6 sm:w-7 sm:h-7 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Main Play Button */}
              <div className="relative mb-5 sm:mb-6">
                {/* Glow ring */}
                <div 
                  className={`absolute -inset-3 rounded-full bg-[#1DB954]/20 blur-xl transition-all duration-500 ${isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`}
                />
                
                {/* Play button */}
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-[#1DB954] rounded-full flex items-center justify-center shadow-2xl shadow-[#1DB954]/30 transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'} active:scale-95`}>
                  <svg 
                    className="w-7 h-7 sm:w-8 sm:h-8 text-black ml-1" 
                    viewBox="0 0 24 24" 
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center space-y-2">
                <p className="text-white font-bold text-lg sm:text-xl tracking-tight">
                  {contentInfo.label}
                </p>
                <p className="text-white/50 text-sm flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
                  Tap to stream on Spotify
                </p>
              </div>

              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px]">
                <div 
                  className={`h-full bg-gradient-to-r from-transparent via-[#1DB954] to-transparent transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-30'}`}
                />
              </div>
            </div>

            {/* Border */}
            <div className={`absolute inset-0 rounded-2xl border transition-all duration-300 pointer-events-none ${isHovered ? 'border-[#1DB954]/50' : 'border-white/10'}`} />
          </div>
        </button>
      )}

      {/* Loading State */}
      {isVisible && shouldLoad && !isLoaded && (
        <div
          className="relative overflow-hidden rounded-2xl bg-[#121212] flex items-center justify-center"
          style={{ height: playerHeight }}
        >
          {/* Loading animation */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <SpotifyLogo className="w-12 h-12 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-[#1DB954]/30 border-t-[#1DB954] animate-spin" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Loading</span>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-[#1DB954] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
          
          {/* Border */}
          <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
        </div>
      )}

      {/* Spotify Iframe */}
      {isVisible && shouldLoad && (
        <iframe
          src={embedInfo.embedUrl}
          width="100%"
          height={playerHeight}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={`Spotify ${contentInfo.label}`}
          className={`rounded-2xl shadow-xl transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0 absolute"
          }`}
          style={{
            colorScheme: "normal",
            position: isLoaded ? "relative" : "absolute",
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Placeholder */}
      {!isVisible && (
        <div
          className="rounded-2xl bg-[#121212]/50 flex items-center justify-center border border-white/5"
          style={{ height: playerHeight }}
        >
          <SpotifyLogo className="w-8 h-8 opacity-30" />
        </div>
      )}
    </div>
  );
};

// Spotify Logo Component
const SpotifyLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1DB954">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

// Utility functions
export const isSpotifyUrl = (url) => {
  if (!url) return false;
  return (
    url.includes("open.spotify.com") ||
    url.includes("spotify.com/embed") ||
    url.includes("spotify.link")
  );
};

export const getSpotifyEmbedUrl = (url, theme = "dark") => {
  if (!url) return null;

  const patterns = {
    regular: /open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
    embed: /open\.spotify\.com\/embed\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/,
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
