import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import PostCardSkeleton from "./PostCardSkeleton";

/**
 * API Loading States Component
 * Provides different loading states for API operations
 */

// Initial page load with skeleton posts
export const InitialPageLoader = ({ message = "Loading latest posts..." }) => (
  <div className="container mx-auto px-10 mb-8">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main content area */}
      <div className="lg:col-span-8 col-span-1">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-64 bg-[length:200%_100%] animate-shimmer mb-4"></div>
          <div className="h-px bg-secondary-light"></div>
        </div>

        {/* Loading message */}
        <div className="text-center py-8">
          <LoadingSpinner size="large" type="spinner" message={message} />
        </div>

        {/* Skeleton posts */}
        <div className="space-y-8">
          {[...Array(3)].map((_, index) => (
            <PostCardSkeleton key={`initial-skeleton-${index}`} />
          ))}
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="lg:col-span-4 col-span-1">
        <div className="space-y-8">
          {/* Widget skeleton */}
          <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
            <div className="h-12 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded bg-[length:200%_100%] animate-shimmer"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Infinite scroll loader
export const InfiniteScrollLoader = ({ count = 3 }) => (
  <div className="space-y-8 py-4">
    <div className="text-center py-4">
      <LoadingSpinner size="medium" type="dots" message="Loading more posts..." />
    </div>
    {[...Array(count)].map((_, index) => (
      <PostCardSkeleton key={`scroll-skeleton-${index}`} />
    ))}
  </div>
);

// Category switching loader
export const CategorySwitchLoader = ({ categoryName }) => (
  <div className="container mx-auto px-10 mb-8">
    <div className="text-center py-12">
      <LoadingSpinner 
        size="large" 
        type="spinner" 
        message={`Loading ${categoryName || 'category'} posts...`} 
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

// Error state with retry option
export const ApiErrorState = ({ 
  error, 
  onRetry, 
  title = "Error Loading Content",
  showRetry = true 
}) => (
  <div className="text-center py-12">
    <div className="mb-6">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6">{error}</p>
      {showRetry && (
        <button
          onClick={onRetry}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Empty state
export const EmptyState = ({ 
  title = "No Content Found", 
  message = "There's nothing to show here yet.",
  actionLabel,
  onAction 
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary mb-6">{message}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-200"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
