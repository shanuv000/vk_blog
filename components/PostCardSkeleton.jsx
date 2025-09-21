import React from "react";

/**
 * Optimized Post Card Skeleton with simplified animations
 */
const PostCardSkeleton = ({ className = "" }) => {
  return (
    <article
      className={`bg-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8 ${className}`}
      role="status"
      aria-label="Loading post content"
    >
      {/* Simplified image skeleton */}
      <div className="relative overflow-hidden">
        <div className="w-full aspect-[16/9] bg-gray-300/20 animate-pulse" />

        {/* Simplified date badge skeleton */}
        <div className="absolute top-4 right-4">
          <div className="bg-gray-300/30 rounded-full h-8 w-24 animate-pulse" />
        </div>
      </div>

      <div className="p-6">
        {/* Simplified title skeleton */}
        <div className="mb-4 space-y-3">
          <div className="h-6 rounded-lg bg-gray-300/20 animate-pulse" />
          <div className="h-6 rounded-lg w-3/4 bg-gray-300/20 animate-pulse" />
        </div>

        {/* Simplified excerpt skeleton */}
        <div className="mb-6 space-y-2.5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-4 rounded-md bg-gray-300/15 animate-pulse ${
                index === 2 ? "w-2/3" : "w-full"
              }`}
            />
          ))}
        </div>

        {/* Simplified author and read more skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Author avatar skeleton */}
            <div className="rounded-full h-10 w-10 border-2 border-gray-600/20 bg-gray-300/15 animate-pulse" />
            {/* Author name skeleton */}
            <div className="h-4 rounded-md w-24 bg-gray-300/15 animate-pulse" />
          </div>

          {/* Read more button skeleton */}
          <div className="rounded-lg h-9 w-28 bg-primary/10 animate-pulse" />
        </div>
      </div>
    </article>
  );
};

export default PostCardSkeleton;
