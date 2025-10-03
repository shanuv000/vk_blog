import React from "react";
import moment from "moment";
import Link from "next/link";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FaCalendarAlt, FaBookmark, FaArrowRight } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { FeaturedImageSkeleton } from "./ImageSkeletons";

const FeaturedPostCard = ({ post = {} }) => {
  // Ensure post has all required properties with defaults
  const safePost = {
    slug: post.slug || "post",
    title: post.title || "Untitled Post",
    createdAt: post.createdAt || null,
    featuredImage: post.featuredImage || { url: DEFAULT_FEATURED_IMAGE },
    categories: post.categories || [],
  };

  return (
    <Link href={`/post/${safePost.slug}`}>
      <article className="group relative h-80 sm:h-96 rounded-xl overflow-hidden bg-secondary border border-border shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer hover:-translate-y-1">
        {/* Modern Image Container */}
        <div className="relative w-full h-2/3 overflow-hidden bg-secondary-light">
          <OptimizedImage
            src={safePost.featuredImage.url || DEFAULT_FEATURED_IMAGE}
            alt={safePost.title || "Featured post"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={true}
            quality={90}
            fallbackSrc={DEFAULT_FEATURED_IMAGE}
            showSkeleton={true}
            aspectRatio="16/9"
            containerClassName="w-full h-full"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPjxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iNDc1IiBmaWxsPSJyZ2JhKDI1LCAyNSwgMjUsIDEpIi8+PC9zdmc+"
            onLoad={() => {
              // Optional: Add analytics or performance tracking
            }}
            onError={(error) => {
              console.warn("Featured image failed to load:", error);
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

          {/* Featured Badge - minimal style */}
          <div className="absolute top-3 left-3 bg-primary text-white text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 shadow-lg">
            <FaBookmark size={10} />
            FEATURED
          </div>

          {/* Categories - cleaner look */}
          {safePost.categories && safePost.categories.length > 0 && (
            <div className="absolute top-3 right-3 flex gap-1.5">
              {safePost.categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md font-medium"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content Section - better spacing */}
        <div className="p-5 h-1/3 flex flex-col justify-between bg-secondary">
          {/* Title */}
          <h3 className="font-bold text-text-primary text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-200">
            {safePost.title}
          </h3>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {/* Date */}
            {safePost.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                <FaCalendarAlt size={10} />
                <span className="font-medium">
                  {moment(safePost.createdAt).format("MMM DD, YYYY")}
                </span>
              </div>
            )}

            {/* Read More Arrow - smooth transition */}
            <div className="text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1">
              <FaArrowRight size={14} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default FeaturedPostCard;
