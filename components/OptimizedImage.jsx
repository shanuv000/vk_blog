import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGE_CONFIGS } from "../lib/image-config";

/**
 * OptimizedImage Component
 *
 * A high-performance image component that provides:
 * - Progressive loading with blur-up effect
 * - Smooth loading transitions
 * - Intelligent lazy loading
 * - Responsive image optimization
 * - Accessibility features
 * - Error handling with fallbacks
 * - Modern loading states similar to Notion/Linear/Vercel
 */

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = IMAGE_CONFIGS.postCard.sizes,
  priority = false,
  quality = IMAGE_CONFIGS.postCard.quality || 70,
  className = "",
  containerClassName = "",
  aspectRatio = "16/9",
  fallbackSrc = "/api/default-image?type=featured",
  showSkeleton = true,
  skeletonClassName = "",
  onLoad,
  onError,
  blurDataURL,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imageRef = useRef(null);

  // Generate blur data URL if not provided
  const generateBlurDataURL = (width = 10, height = 10) => {
    if (typeof window === "undefined") {
      // Server-side fallback
      return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJyZ2JhKDE1NiwgMTYzLCAxNzUsIDAuMSkiLz4KPHN2Zz4K";
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Create a subtle gradient for the blur effect
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(156, 163, 175, 0.1)");
    gradient.addColorStop(0.5, "rgba(156, 163, 175, 0.2)");
    gradient.addColorStop(1, "rgba(156, 163, 175, 0.1)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL();
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  // Handle image load success
  const handleLoad = (event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  // Handle image load error
  const handleError = (event) => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setHasError(true);
    setIsLoading(false);

    // Try fallback image if not already using it
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }

    onError?.(event);
  };

  // Reset state when src changes
  useEffect(() => {
    if (src !== imageSrc && !hasError) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, imageSrc, hasError]);

  // Skeleton component with modern shimmer effect
  const ImageSkeleton = () => (
    <div
      className={`absolute inset-0 bg-gradient-to-r from-gray-300/10 via-gray-200/20 to-gray-300/10 animate-shimmer ${skeletonClassName}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
        backgroundSize: "200% 100%",
      }}
      role="status"
      aria-label="Loading image"
    />
  );

  // Container styles for different aspect ratios
  const getAspectRatioClass = () => {
    const ratioMap = {
      "16/9": "aspect-[16/9]",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      "3/2": "aspect-[3/2]",
      "21/9": "aspect-[21/9]",
    };
    return ratioMap[aspectRatio] || "aspect-[16/9]";
  };

  return (
    <div
      className={`relative overflow-hidden ${
        !fill ? getAspectRatioClass() : ""
      } ${containerClassName}`}
      ref={imageRef}
    >
      {/* Loading skeleton */}
      <AnimatePresence>
        {isLoading && showSkeleton && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 z-10"
          >
            <ImageSkeleton />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1,
        }}
        className="relative w-full h-full"
      >
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width || 800}
          height={fill ? undefined : height || 600}
          fill={fill}
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={`transition-all duration-500 ease-out ${className}`}
          placeholder="blur"
          blurDataURL={defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </motion.div>

      {/* Error state */}
      <AnimatePresence>
        {hasError && imageSrc === fallbackSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100/10 backdrop-blur-sm"
          >
            <div className="text-center p-4">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400/60"
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
              <p className="text-xs text-gray-400/80 font-medium">
                Image unavailable
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OptimizedImage;
