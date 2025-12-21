import React, { useState } from "react";

const CustomYouTubeEmbed = ({ videoId, title = "YouTube Video" }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Function to extract video ID from various YouTube URL formats
  const extractVideoId = (url) => {
    if (!url) {return null;}

    let id = null;

    // Handle different YouTube URL formats
    if (url.includes("youtu.be/")) {
      // Short URL format: https://youtu.be/VIDEO_ID
      id = url.split("youtu.be/")[1];
      if (id.includes("?")) {
        id = id.split("?")[0];
      }
    } else if (url.includes("youtube.com/watch")) {
      // Standard URL format: https://www.youtube.com/watch?v=VIDEO_ID
      try {
        const urlObj = new URL(url);
        id = urlObj.searchParams.get("v");
      } catch (e) {
        console.error("Error parsing YouTube URL:", e);
      }
    } else if (url.includes("youtube.com/embed/")) {
      // Embed URL format: https://www.youtube.com/embed/VIDEO_ID
      id = url.split("youtube.com/embed/")[1];
      if (id.includes("?")) {
        id = id.split("?")[0];
      }
    } else {
      // If it's just the ID
      id = url;
    }

    return id;
  };

  // Get the actual video ID
  const actualVideoId = videoId.includes("http")
    ? extractVideoId(videoId)
    : videoId;

  // Create the embed URL with youtube-nocookie.com domain + mobile-friendly params
  const embedUrl = `https://www.youtube-nocookie.com/embed/${actualVideoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;

  // Get thumbnail URLs (maxres with hqdefault fallback)
  const getMaxResThumbnail = (id) =>
    `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const getHqThumbnail = (id) =>
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  // Handle click on the thumbnail to load the actual iframe
  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  return (
    <div 
      className="relative w-full my-4 sm:my-6 rounded-xl overflow-hidden shadow-lg bg-black"
      style={{ paddingBottom: "56.25%" }}
    >
      {!isPlaying ? (
        // Show thumbnail with play button overlay
        <button
          onClick={handleThumbnailClick}
          className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer group"
          style={{ touchAction: "manipulation" }}
          aria-label={`Play ${title}`}
        >
          {/* Thumbnail image with quality fallback */}
          <img
            src={thumbnailError ? getHqThumbnail(actualVideoId) : getMaxResThumbnail(actualVideoId)}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={() => setThumbnailError(true)}
          />
          
          {/* Dark overlay - more visible on tap */}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 group-active:bg-black/30 transition-all duration-200" />
          
          {/* Play button - larger on mobile for better touch target (min 48px accessibility) */}
          <div className="relative z-10 w-16 h-16 sm:w-[68px] sm:h-[68px] flex items-center justify-center rounded-full bg-red-600 group-hover:bg-red-700 group-active:scale-95 transition-all duration-200 shadow-xl">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          
          {/* YouTube branding hint */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-80">
            <svg className="w-8 h-6 sm:w-10 sm:h-7 text-white drop-shadow-lg" viewBox="0 0 90 20" fill="currentColor">
              <path d="M27.973 0H2.03C.91 0 0 .91 0 2.03v15.94C0 19.09.91 20 2.03 20h25.94c1.12 0 2.03-.91 2.03-2.03V2.03C30 .91 29.09 0 27.97 0zM12 14.5v-9l7.5 4.5-7.5 4.5z"/>
            </svg>
          </div>
        </button>
      ) : (
        // Show the actual iframe when play button is clicked
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
};

export default CustomYouTubeEmbed;

