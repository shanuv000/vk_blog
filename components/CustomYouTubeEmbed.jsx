import React, { useState } from 'react';

const CustomYouTubeEmbed = ({ videoId, title = 'YouTube Video' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to extract video ID from various YouTube URL formats
  const extractVideoId = (url) => {
    if (!url) return null;
    
    let id = null;
    
    // Handle different YouTube URL formats
    if (url.includes('youtu.be/')) {
      // Short URL format: https://youtu.be/VIDEO_ID
      id = url.split('youtu.be/')[1];
      if (id.includes('?')) {
        id = id.split('?')[0];
      }
    } else if (url.includes('youtube.com/watch')) {
      // Standard URL format: https://www.youtube.com/watch?v=VIDEO_ID
      try {
        const urlObj = new URL(url);
        id = urlObj.searchParams.get('v');
      } catch (e) {
        console.error('Error parsing YouTube URL:', e);
      }
    } else if (url.includes('youtube.com/embed/')) {
      // Embed URL format: https://www.youtube.com/embed/VIDEO_ID
      id = url.split('youtube.com/embed/')[1];
      if (id.includes('?')) {
        id = id.split('?')[0];
      }
    } else {
      // If it's just the ID
      id = url;
    }
    
    return id;
  };

  // Get the actual video ID
  const actualVideoId = videoId.includes('http') ? extractVideoId(videoId) : videoId;
  
  // Create the embed URL with youtube-nocookie.com domain
  const embedUrl = `https://www.youtube-nocookie.com/embed/${actualVideoId}?autoplay=1&modestbranding=1&rel=0`;
  
  // Function to get thumbnail URL
  const getThumbnailUrl = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  // Handle click on the thumbnail to load the actual iframe
  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative pt-[56.25%] my-4 rounded-lg overflow-hidden shadow-md bg-black">
      {!isPlaying ? (
        // Show thumbnail with play button overlay
        <button 
          onClick={handleThumbnailClick}
          className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
          aria-label={`Play ${title}`}
        >
          <img 
            src={getThumbnailUrl(actualVideoId)} 
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition-opacity duration-300"></div>
          <div className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-300">
            <svg 
              className="w-8 h-8 text-white" 
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
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-lg shadow-md"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

export default CustomYouTubeEmbed;
