import React from "react";

const PostCardSkeleton = () => {
  return (
    <div className="bg-secondary rounded-lg overflow-hidden shadow-lg mb-8">
      {/* Image skeleton */}
      <div className="relative overflow-hidden">
        <div className="w-full aspect-[16/9] bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 bg-[length:200%_100%] animate-shimmer"></div>

        {/* Date badge skeleton */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer rounded-full h-8 w-24"></div>
      </div>

      <div className="p-6">
        {/* Title skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-6 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded bg-[length:200%_100%] animate-shimmer"></div>
          <div className="h-6 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-3/4 bg-[length:200%_100%] animate-shimmer"></div>
        </div>

        {/* Excerpt skeleton */}
        <div className="mb-6 space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded bg-[length:200%_100%] animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded bg-[length:200%_100%] animate-shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-2/3 bg-[length:200%_100%] animate-shimmer"></div>
        </div>

        {/* Author and read more skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Author avatar skeleton */}
            <div className="rounded-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 animate-shimmer h-9 w-9 border-2 border-gray-400"></div>
            {/* Author name skeleton */}
            <div className="ml-2 h-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded w-20 bg-[length:200%_100%] animate-shimmer"></div>
          </div>

          {/* Read more button skeleton */}
          <div className="bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 rounded-md h-8 w-24 bg-[length:200%_100%] animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;
