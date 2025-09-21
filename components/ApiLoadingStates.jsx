import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import PostCardSkeleton from "./PostCardSkeleton";

/**
 * API Loading States Component
 * Provides different loading states for API operations
 */

// Modern Initial page loader with enhanced animations
export const InitialPageLoader = ({ message = "Loading latest posts..." }) => (
  <div className="container mx-auto px-10 mb-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main content area */}
      <div className="lg:col-span-8 col-span-1">
        {/* Simplified header skeleton */}
        <div className="mb-8">
          <div className="h-8 rounded-lg w-64 bg-gray-300/20 animate-pulse mb-4" />
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"></div>
        </div>

        {/* Simplified loading message */}
        <div className="text-center py-12">
          <div className="mb-8">
            <LoadingSpinner size="large" type="spinner" message={message} />
          </div>
          <div className="text-text-secondary/60 text-sm font-medium">
            Preparing your content experience...
          </div>
        </div>

        {/* Simplified skeleton posts */}
        <div className="space-y-8">
          {[...Array(3)].map((_, index) => (
            <div
              key={`initial-skeleton-${index}`}
              className="opacity-0 animate-fadeIn"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              <PostCardSkeleton />
            </div>
          ))}
        </div>
      </div>

      {/* Modern sidebar skeleton */}
      <div className="lg:col-span-4 col-span-1">
        <div className="space-y-8">
          {/* Simplified widget skeleton */}
          <div
            className="bg-secondary rounded-xl shadow-lg overflow-hidden border border-gray-700/20 opacity-0 animate-fadeIn"
            style={{
              animationDelay: "0.2s",
              animationFillMode: "forwards",
            }}
          >
            <div className="h-12 bg-gray-300/20" />
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 rounded-md bg-gray-300/15 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Simplified Infinite scroll loader
export const InfiniteScrollLoader = ({ count = 3 }) => (
  <div className="space-y-8 py-6">
    <div className="text-center py-6">
      <div className="mb-4">
        <LoadingSpinner
          size="medium"
          type="spinner"
          message="Loading more posts..."
        />
      </div>
      <div className="text-text-secondary/50 text-xs font-medium uppercase tracking-wider">
        Fetching additional content
      </div>
    </div>
    <div className="space-y-8">
      {[...Array(count)].map((_, index) => (
        <div
          key={`scroll-skeleton-${index}`}
          className="opacity-0 animate-fadeIn"
          style={{
            animationDelay: `${index * 0.1}s`,
            animationFillMode: "forwards",
          }}
        >
          <PostCardSkeleton />
        </div>
      ))}
    </div>
  </div>
);

// Category switching loader
export const CategorySwitchLoader = ({ categoryName }) => (
  <div className="container mx-auto px-10 mb-8">
    <div className="text-center py-12">
      <LoadingSpinner
        size="large"
        type="spinner"
        message={`Loading ${categoryName || "category"} posts...`}
      />
      <div className="mt-8 space-y-8">
        {[...Array(2)].map((_, index) => (
          <PostCardSkeleton key={`category-skeleton-${index}`} />
        ))}
      </div>
    </div>
  </div>
);

// API retry loader
export const ApiRetryLoader = ({ message = "Retrying..." }) => (
  <div className="text-center py-8">
    <LoadingSpinner size="medium" type="pulse" message={message} />
  </div>
);

// Inline API loader (for small operations)
export const InlineApiLoader = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center py-2">
    <LoadingSpinner size="small" type="spinner" message={message} />
  </div>
);

// Full screen API loader (for critical operations)
export const FullScreenApiLoader = ({ message = "Please wait..." }) => (
  <LoadingSpinner
    size="xlarge"
    type="spinner"
    message={message}
    fullScreen={true}
  />
);

// Overlay loader (for content updates)
export const OverlayApiLoader = ({ message = "Updating..." }) => (
  <LoadingSpinner
    size="large"
    type="spinner"
    message={message}
    overlay={true}
  />
);

// Modern Error state with enhanced styling
export const ApiErrorState = ({
  error,
  onRetry,
  title = "Error Loading Content",
  showRetry = true,
}) => (
  <div className="text-center py-16">
    <div
      className="mb-8"
      style={{
        animation: "fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Modern error icon with gradient background */}
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg">
        <svg
          className="w-10 h-10 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      {/* Enhanced typography */}
      <h3 className="text-2xl font-bold text-text-primary mb-3 font-heading">
        {title}
      </h3>
      <p className="text-text-secondary/80 mb-8 max-w-md mx-auto leading-relaxed">
        {error ||
          "Something went wrong while loading the content. Please try again."}
      </p>

      {/* Modern retry button */}
      {showRetry && (
        <button
          onClick={onRetry}
          className="group bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-secondary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span className="flex items-center space-x-2">
            <svg
              className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Try Again</span>
          </span>
        </button>
      )}
    </div>
  </div>
);

// Modern Empty state with enhanced design
export const EmptyState = ({
  title = "No Content Found",
  message = "There's nothing to show here yet.",
  actionLabel,
  onAction,
}) => (
  <div className="text-center py-20">
    <div
      className="mb-8"
      style={{
        animation: "fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Modern empty state icon */}
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-500/5 to-gray-600/10 rounded-3xl flex items-center justify-center border border-gray-600/10 shadow-sm">
        <svg
          className="w-12 h-12 text-gray-400/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>

      {/* Enhanced typography */}
      <h3 className="text-2xl font-bold text-text-primary mb-3 font-heading">
        {title}
      </h3>
      <p className="text-text-secondary/70 mb-8 max-w-sm mx-auto leading-relaxed">
        {message}
      </p>

      {/* Modern action button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="group bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-secondary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <span className="flex items-center space-x-2">
            <span>{actionLabel}</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        </button>
      )}
    </div>
  </div>
);
