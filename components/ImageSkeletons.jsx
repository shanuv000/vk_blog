import React from "react";
import { motion } from "framer-motion";

/**
 * Image Skeleton Components
 * 
 * Specialized skeleton components for different image aspect ratios and use cases
 * with modern shimmer effects and smooth animations
 */

// Base skeleton with modern shimmer effect
const BaseImageSkeleton = ({ 
  className = "", 
  aspectRatio = "16/9",
  showOverlay = false,
  overlayContent = null,
  animationDelay = 0
}) => {
  const getAspectRatioClass = () => {
    const ratioMap = {
      "16/9": "aspect-[16/9]",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      "3/2": "aspect-[3/2]",
      "21/9": "aspect-[21/9]",
      "2/3": "aspect-[2/3]",
    };
    return ratioMap[aspectRatio] || "aspect-[16/9]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1],
        delay: animationDelay 
      }}
      className={`relative overflow-hidden rounded-lg ${getAspectRatioClass()} ${className}`}
      role="status"
      aria-label="Loading image"
    >
      {/* Main shimmer background */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-300/10 via-gray-200/20 to-gray-300/10 animate-shimmer"
        style={{
          background: "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
          backgroundSize: "200% 100%",
          animationDelay: `${animationDelay}s`,
        }}
      />
      
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-400/5 to-gray-600/10" />
      
      {/* Optional overlay content */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          {overlayContent || (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-400/20 rounded-full animate-pulse" />
              <div className="w-16 h-2 mx-auto bg-gray-400/15 rounded animate-pulse" />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Featured post image skeleton (16:9 aspect ratio)
export const FeaturedImageSkeleton = ({ className = "", animationDelay = 0 }) => (
  <BaseImageSkeleton
    aspectRatio="16/9"
    className={`w-full ${className}`}
    animationDelay={animationDelay}
    showOverlay={true}
    overlayContent={
      <div className="text-center">
        {/* Featured badge skeleton */}
        <div className="absolute top-3 left-3">
          <div className="w-20 h-6 bg-gray-400/20 rounded-full animate-pulse" />
        </div>
        {/* Category badges skeleton */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="w-16 h-6 bg-gray-400/20 rounded animate-pulse" />
          <div className="w-12 h-6 bg-gray-400/20 rounded animate-pulse" />
        </div>
      </div>
    }
  />
);

// Post card image skeleton (16:9 aspect ratio)
export const PostCardImageSkeleton = ({ className = "", animationDelay = 0 }) => (
  <BaseImageSkeleton
    aspectRatio="16/9"
    className={`w-full ${className}`}
    animationDelay={animationDelay}
    showOverlay={true}
    overlayContent={
      <div className="absolute top-4 right-4">
        <div className="w-20 h-6 bg-gray-400/20 rounded-full animate-pulse" />
      </div>
    }
  />
);

// Hero image skeleton (21:9 aspect ratio for wide hero images)
export const HeroImageSkeleton = ({ className = "", animationDelay = 0 }) => (
  <BaseImageSkeleton
    aspectRatio="21/9"
    className={`w-full ${className}`}
    animationDelay={animationDelay}
    showOverlay={true}
    overlayContent={
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-400/20 rounded-full animate-pulse" />
        <div className="w-32 h-3 mx-auto mb-2 bg-gray-400/15 rounded animate-pulse" />
        <div className="w-24 h-2 mx-auto bg-gray-400/10 rounded animate-pulse" />
      </div>
    }
  />
);

// Square image skeleton (1:1 aspect ratio for avatars, thumbnails)
export const SquareImageSkeleton = ({ className = "", size = "medium", animationDelay = 0 }) => {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-16 h-16", 
    large: "w-24 h-24",
    xlarge: "w-32 h-32"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1],
        delay: animationDelay 
      }}
      className={`relative overflow-hidden rounded-full ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading avatar"
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-300/15 via-gray-200/25 to-gray-300/15 animate-shimmer"
        style={{
          background: "linear-gradient(135deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
          backgroundSize: "200% 200%",
          animationDelay: `${animationDelay}s`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-1/2 h-1/2 text-gray-400/30"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </motion.div>
  );
};

// Portrait image skeleton (2:3 aspect ratio)
export const PortraitImageSkeleton = ({ className = "", animationDelay = 0 }) => (
  <BaseImageSkeleton
    aspectRatio="2/3"
    className={`w-full ${className}`}
    animationDelay={animationDelay}
  />
);

// Landscape image skeleton (3:2 aspect ratio)
export const LandscapeImageSkeleton = ({ className = "", animationDelay = 0 }) => (
  <BaseImageSkeleton
    aspectRatio="3/2"
    className={`w-full ${className}`}
    animationDelay={animationDelay}
  />
);

// Gallery image skeleton with multiple placeholders
export const GalleryImageSkeleton = ({ 
  count = 3, 
  className = "", 
  aspectRatio = "4/3" 
}) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <BaseImageSkeleton
        key={index}
        aspectRatio={aspectRatio}
        animationDelay={index * 0.1}
        className="w-full"
      />
    ))}
  </div>
);

// Inline image skeleton for content
export const InlineImageSkeleton = ({ 
  width = "100%", 
  height = "200px", 
  className = "",
  animationDelay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ 
      duration: 0.3, 
      ease: [0.4, 0, 0.2, 1],
      delay: animationDelay 
    }}
    className={`relative overflow-hidden rounded-lg ${className}`}
    style={{ width, height }}
    role="status"
    aria-label="Loading inline image"
  >
    <div
      className="absolute inset-0 bg-gradient-to-r from-gray-300/10 via-gray-200/20 to-gray-300/10 animate-shimmer"
      style={{
        background: "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
        backgroundSize: "200% 100%",
        animationDelay: `${animationDelay}s`,
      }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-gray-400/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  </motion.div>
);

export default BaseImageSkeleton;
