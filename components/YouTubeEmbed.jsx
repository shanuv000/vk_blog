import React, { useState } from 'react';

const YouTubeEmbed = ({ videoId, title = 'YouTube Video' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create the embed URL with youtube-nocookie.com domain
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;

  // Function to extract thumbnail URL from video ID
  const getThumbnailUrl = (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  // Handle click on the thumbnail to load the actual iframe
  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative pt-[56.25%] my-4 rounded-lg overflow-hidden shadow-md">
      {!isPlaying ? (
        // Show thumbnail with play button overlay
        <button 
          onClick={handleThumbnailClick}
          className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
          aria-label={`Play ${title}`}
        >
          <img 
            src={getThumbnailUrl(videoId)} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition-opacity duration-300"></div>
          <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-300">
            <svg 
              className="w-8 h-8 md:w-10 md:h-10 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      ) : (
        // Show the actual iframe when play button is clicked
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

export default YouTubeEmbed;
