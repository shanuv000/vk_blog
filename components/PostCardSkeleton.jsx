import React from "react";

/**
 * Modern Post Card Skeleton with enhanced animations and accessibility
 */
const PostCardSkeleton = ({ className = "" }) => {
  return (
    <article
      className={`bg-secondary rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8 ${className}`}
      role="status"
      aria-label="Loading post content"
    >
      {/* Image skeleton with modern gradient */}
      <div className="relative overflow-hidden">
        <div
          className="w-full aspect-[16/9] bg-gradient-to-r from-gray-300/20 via-gray-200/40 to-gray-300/20 bg-[length:200%_100%] animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
            backgroundSize: "200% 100%",
          }}
        />

        {/* Date badge skeleton with modern styling */}
        <div className="absolute top-4 right-4">
          <div
            className="bg-gradient-to-r from-gray-300/30 via-gray-200/50 to-gray-300/30 animate-shimmer rounded-full h-8 w-24 bg-[length:200%_100%]"
            style={{
              background:
                "linear-gradient(90deg, rgba(75, 85, 99, 0.2) 25%, rgba(156, 163, 175, 0.3) 50%, rgba(75, 85, 99, 0.2) 75%)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>

      <div className="p-6">
        {/* Title skeleton with staggered animation */}
        <div className="mb-4 space-y-3">
          <div
            className="h-6 rounded-lg bg-[length:200%_100%] animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, rgba(75, 85, 99, 0.15) 25%, rgba(156, 163, 175, 0.25) 50%, rgba(75, 85, 99, 0.15) 75%)",
              backgroundSize: "200% 100%",
              animationDelay: "0.1s",
            }}
          />
          <div
            className="h-6 rounded-lg w-3/4 bg-[length:200%_100%] animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, rgba(75, 85, 99, 0.15) 25%, rgba(156, 163, 175, 0.25) 50%, rgba(75, 85, 99, 0.15) 75%)",
              backgroundSize: "200% 100%",
              animationDelay: "0.2s",
            }}
          />
        </div>

        {/* Excerpt skeleton with modern spacing */}
        <div className="mb-6 space-y-2.5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`h-4 rounded-md bg-[length:200%_100%] animate-shimmer ${
                index === 2 ? "w-2/3" : "w-full"
              }`}
              style={{
                background:
                  "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
                backgroundSize: "200% 100%",
                animationDelay: `${0.3 + index * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Author and read more skeleton with modern styling */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Author avatar skeleton with modern border */}
            <div
              className="rounded-full h-10 w-10 border-2 border-gray-600/20 bg-[length:200%_100%] animate-shimmer"
              style={{
                background:
                  "linear-gradient(90deg, rgba(75, 85, 99, 0.15) 25%, rgba(156, 163, 175, 0.25) 50%, rgba(75, 85, 99, 0.15) 75%)",
                backgroundSize: "200% 100%",
                animationDelay: "0.6s",
              }}
            />
            {/* Author name skeleton */}
            <div
              className="h-4 rounded-md w-24 bg-[length:200%_100%] animate-shimmer"
              style={{
                background:
                  "linear-gradient(90deg, rgba(75, 85, 99, 0.1) 25%, rgba(156, 163, 175, 0.2) 50%, rgba(75, 85, 99, 0.1) 75%)",
                backgroundSize: "200% 100%",
                animationDelay: "0.7s",
              }}
            />
          </div>

          {/* Read more button skeleton with modern rounded corners */}
          <div
            className="rounded-lg h-9 w-28 bg-[length:200%_100%] animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, rgba(229, 9, 20, 0.1) 25%, rgba(229, 9, 20, 0.2) 50%, rgba(229, 9, 20, 0.1) 75%)",
              backgroundSize: "200% 100%",
              animationDelay: "0.8s",
            }}
          />
        </div>
      </div>
    </article>
  );
};

export default PostCardSkeleton;
