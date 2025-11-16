import React from "react";
import Link from "next/link";
import moment from "moment";
import { FaCalendarAlt, FaBookmark, FaArrowRight } from "react-icons/fa";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FeaturedImageSkeleton } from "./ImageSkeletons";
import OptimizedImage from "./OptimizedImage";
import {
  IMAGE_CONFIGS,
  getOptimizedImageUrl,
  shouldPrioritizeImage,
} from "../lib/image-config";

const FeaturedPostCard = ({ post = {}, priority = false, index = 0 }) => {
  // Ensure post has all required properties with defaults
  const safePost = {
    slug: post.slug || "post",
    title: post.title || "Untitled Post",
    excerpt: post.excerpt || "",
    createdAt: post.createdAt || null,
    featuredImage: post.featuredImage || { url: DEFAULT_FEATURED_IMAGE },
    categories: post.categories || [],
    author: post.author || { name: "Anonymous" },
  };

  // First card gets special treatment
  const isHero = index === 0;

  return (
    <Link href={`/post/${safePost.slug}`}>
      <article
        className={`group relative rounded-2xl overflow-hidden bg-secondary border border-border shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer hover:-translate-y-2 ${
          isHero ? "h-[500px] sm:h-[550px]" : "h-[380px] sm:h-[420px]"
        }`}
      >
        {/* Enhanced Image Container with better overlay */}
        <div className="relative w-full h-full overflow-hidden">
          <OptimizedImage
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 3}
            onError={(error) => {
              if (process.env.NODE_ENV === "development") {
                console.warn("Featured image failed to load:", error);
              }
            }}
          />

          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-200" />

          {/* Featured Badge - refined design */}
          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 shadow-glow-sm border border-primary-light/20">
            <FaBookmark size={10} />
            <span>FEATURED</span>
          </div>

          {/* Categories - improved visibility */}
          {safePost.categories && safePost.categories.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-wrap gap-2 max-w-[60%] justify-end">
              {safePost.categories
                .slice(0, isHero ? 3 : 2)
                .map((category, idx) => (
                  <span
                    key={idx}
                    className="bg-secondary-light/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg font-medium border border-border shadow-sm"
                  >
                    {category.name}
                  </span>
                ))}
            </div>
          )}

          {/* Content Overlay - positioned at bottom */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-6 ${
              isHero ? "sm:p-8" : "sm:p-6"
            }`}
          >
            {/* Title - larger for hero */}
            <h3
              className={`font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-primary-light transition-colors duration-200 ${
                isHero
                  ? "text-2xl sm:text-3xl md:text-4xl"
                  : "text-lg sm:text-xl"
              }`}
            >
              {safePost.title}
            </h3>

            {/* Excerpt - only for hero card */}
            {isHero && safePost.excerpt && (
              <p className="text-gray-300 text-sm sm:text-base mb-4 line-clamp-2 leading-relaxed">
                {safePost.excerpt}
              </p>
            )}

            {/* Bottom Meta Section */}
            <div className="flex items-center justify-between">
              {/* Date & Author */}
              <div className="flex items-center gap-3">
                {safePost.createdAt && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                    <FaCalendarAlt size={12} className="text-primary-light" />
                    <span className="font-medium">
                      {moment(safePost.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                )}
                {isHero && safePost.author?.name && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs sm:text-sm text-gray-300 font-medium">
                      {safePost.author.name}
                    </span>
                  </>
                )}
              </div>

              {/* Read More Button */}
              <div className="flex items-center gap-2 text-primary-light opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-2">
                <span className="text-sm font-semibold hidden sm:inline">
                  Read More
                </span>
                <FaArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default FeaturedPostCard;
