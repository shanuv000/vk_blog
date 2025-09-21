import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Image Loading States Component
 * 
 * Provides sophisticated loading states for images with modern animations
 * and professional UX patterns similar to Notion, Linear, and Vercel
 */

// Progressive image loader with blur-up effect
export const ProgressiveImageLoader = ({ 
  isLoading = true, 
  progress = 0, 
  className = "",
  showProgress = false 
}) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-gray-900/5 via-gray-800/10 to-gray-900/5 backdrop-blur-sm ${className}`}
      >
        <div className="text-center">
          {/* Modern loading spinner */}
          <div className="mb-4">
            <LoadingSpinner size="medium" type="spinner" />
          </div>
          
          {/* Progress indicator */}
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-32 mx-auto"
            >
              <div className="h-1 bg-gray-600/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
              <p className="text-xs text-gray-400/80 mt-2 font-medium">
                {Math.round(progress)}%
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Shimmer loading overlay
export const ShimmerLoader = ({ 
  isLoading = true, 
  className = "",
  intensity = "medium" 
}) => {
  const intensityStyles = {
    light: {
      background: "linear-gradient(90deg, rgba(75, 85, 99, 0.05) 25%, rgba(156, 163, 175, 0.1) 50%, rgba(75, 85, 99, 0.05) 75%)",
    },
    medium: {
      background: "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
    },
    strong: {
      background: "linear-gradient(90deg, rgba(75, 85, 99, 0.15) 25%, rgba(156, 163, 175, 0.3) 50%, rgba(75, 85, 99, 0.15) 75%)",
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-0 z-10 animate-shimmer ${className}`}
          style={{
            ...intensityStyles[intensity],
            backgroundSize: "200% 100%",
          }}
          role="status"
          aria-label="Loading image"
        />
      )}
    </AnimatePresence>
  );
};

// Pulse loading effect
export const PulseLoader = ({ 
  isLoading = true, 
  className = "",
  color = "primary" 
}) => {
  const colorClasses = {
    primary: "bg-primary/20",
    secondary: "bg-gray-400/20",
    accent: "bg-accent/20"
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-0 z-10 ${colorClasses[color]} animate-pulse ${className}`}
          role="status"
          aria-label="Loading image"
        />
      )}
    </AnimatePresence>
  );
};

// Skeleton with content placeholders
export const SkeletonWithContent = ({ 
  isLoading = true, 
  showBadges = false,
  showOverlay = false,
  className = "" 
}) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute inset-0 z-10 ${className}`}
      >
        {/* Base shimmer */}
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
            backgroundSize: "200% 100%",
          }}
        />
        
        {/* Content placeholders */}
        {showBadges && (
          <>
            {/* Top left badge */}
            <div className="absolute top-3 left-3">
              <div className="w-20 h-6 bg-gray-400/30 rounded-full animate-pulse" />
            </div>
            
            {/* Top right badges */}
            <div className="absolute top-3 right-3 flex gap-2">
              <div className="w-16 h-6 bg-gray-400/25 rounded animate-pulse" />
              <div className="w-12 h-6 bg-gray-400/25 rounded animate-pulse" />
            </div>
          </>
        )}
        
        {/* Center overlay content */}
        {showOverlay && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-400/20 rounded-full animate-pulse" />
              <div className="w-24 h-2 mx-auto bg-gray-400/15 rounded animate-pulse" />
            </div>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// Modern blur-up loader
export const BlurUpLoader = ({ 
  isLoading = true, 
  blurAmount = "blur-md",
  className = "" 
}) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 1, filter: "blur(20px)" }}
        exit={{ 
          opacity: 0, 
          filter: "blur(0px)",
          transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
        }}
        className={`absolute inset-0 z-10 bg-gradient-to-br from-gray-400/10 via-gray-300/15 to-gray-400/10 ${blurAmount} ${className}`}
        role="status"
        aria-label="Loading image"
      />
    )}
  </AnimatePresence>
);

// Ripple loading effect
export const RippleLoader = ({ 
  isLoading = true, 
  className = "",
  color = "primary" 
}) => {
  const colorClasses = {
    primary: "border-primary/30",
    secondary: "border-gray-400/30",
    accent: "border-accent/30"
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-0 z-10 flex items-center justify-center ${className}`}
        >
          <div className="relative w-16 h-16">
            {[0, 1].map((index) => (
              <div
                key={index}
                className={`absolute inset-0 border-2 ${colorClasses[color]} rounded-full opacity-75`}
                style={{
                  animation: `ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
                  animationDelay: `${index * 1}s`,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Gradient loading overlay
export const GradientLoader = ({ 
  isLoading = true, 
  direction = "to-br",
  className = "" 
}) => (
  <AnimatePresence>
    {isLoading && (
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`absolute inset-0 z-10 bg-gradient-${direction} from-gray-900/5 via-gray-800/10 to-gray-900/5 backdrop-blur-sm ${className}`}
        role="status"
        aria-label="Loading image"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Error state overlay
export const ImageErrorState = ({ 
  hasError = false, 
  onRetry,
  className = "",
  message = "Failed to load image" 
}) => (
  <AnimatePresence>
    {hasError && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`absolute inset-0 z-20 flex items-center justify-center bg-gray-100/10 backdrop-blur-sm ${className}`}
      >
        <div className="text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-red-400/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-xs text-gray-400/80 font-medium mb-2">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs text-primary hover:text-primary-light transition-colors duration-200 font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default {
  ProgressiveImageLoader,
  ShimmerLoader,
  PulseLoader,
  SkeletonWithContent,
  BlurUpLoader,
  RippleLoader,
  GradientLoader,
  ImageErrorState,
};
