import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { IMAGE_CONFIGS } from "../lib/image-config";
import { getBlurDataURL, getRawImageUrl } from "../lib/cloudinary-loader";

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
  // Priority images start as loaded (they're preloaded by Next.js)
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imageRef = useRef(null);

  // Generate blur placeholder - use Cloudinary for external images
  const getBlurPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    // Use Cloudinary blur for external URLs, static for local
    return getBlurDataURL(src);
  };

  const defaultBlurDataURL = getBlurPlaceholder();

  // Handle image load success
  const handleLoad = (event) => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.(event);
  };

  // Handle image load error with Cloudinary fallback
  const handleError = (event) => {
    console.warn(`Image failed to load: ${imageSrc}`);
    setHasError(true);
    setIsLoading(false);

    // Try raw URL fallback (bypassing Cloudinary) if not already using fallback
    if (imageSrc === src && src !== fallbackSrc) {
      const rawUrl = getRawImageUrl(src);
      if (rawUrl && rawUrl !== imageSrc) {
        console.log(`Trying raw URL fallback: ${rawUrl}`);
        setImageSrc(rawUrl);
        setHasError(false);
        setIsLoading(true);
        return;
      }
    }

    // Try final fallback image
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
      {/* Loading skeleton - skip for priority images (they preload) */}
      <AnimatePresence>
        {isLoading && showSkeleton && !priority && (
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

      {/* Main image - instant rendering for priority images */}
      <motion.div
        initial={{ opacity: priority ? 1 : 0 }}
        animate={{ opacity: priority || !isLoading ? 1 : 0 }}
        transition={{
          duration: priority ? 0 : 0.5,
          ease: [0.4, 0, 0.2, 1],
          delay: 0,
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
