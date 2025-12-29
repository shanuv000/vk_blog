/**
 * PostCardCompact - Medium-sized card for grid sections
 * Features image with overlay, category badge, title and date
 */

import React from "react";
import Link from "next/link";
import moment from "moment";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { getOptimizedImageUrl } from "../lib/image-config";

const PostCardCompact = ({ post, variant = "default", priority = false }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";

  // Smart date logic: use publishedAt unless it's in the future, then fallback to createdAt
  const getDisplayDate = () => {
    const now = moment();
    const publishedDate = post.publishedAt ? moment(post.publishedAt) : null;
    const createdDate = post.createdAt ? moment(post.createdAt) : null;

    if (publishedDate && publishedDate.isAfter(now)) {
      return createdDate || publishedDate;
    }
    return publishedDate || createdDate;
  };

  // Overlay variant - image with text overlay
  if (variant === "overlay") {
    return (
      <Link href={`/post/${post.slug}`} className="block group">
        <article className="relative aspect-[4/3] rounded-xl overflow-hidden">
          {/* Background Image */}
          <img
            src={getOptimizedImageUrl(imageUrl, "postCard")}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Category Badge */}
            <Link
              href={`/category/${categorySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block bg-primary/90 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2 hover:bg-primary transition-colors"
            >
              {categoryName}
            </Link>

            {/* Title */}
            <h3 className="text-base lg:text-lg font-heading font-bold text-white line-clamp-2 group-hover:text-primary-light transition-colors">
              {post.title}
            </h3>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-2">
              <FaCalendarAlt size={10} />
              <span suppressHydrationWarning>
                {getDisplayDate()?.format("MMM DD, YYYY") || "No date"}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default variant - card with separate image and content
  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="bg-secondary rounded-xl overflow-hidden border border-border shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={getOptimizedImageUrl(imageUrl, "postCard")}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
          />
          {/* Category Badge */}
          <Link
            href={`/category/${categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full hover:bg-primary-dark transition-colors z-10"
          >
            {categoryName}
          </Link>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-base lg:text-lg font-heading font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>

          {/* Excerpt */}
          <p className="text-text-secondary text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            {post.author?.name && (
              <div className="flex items-center gap-1.5">
                <FaUser size={10} />
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt size={10} />
              <span suppressHydrationWarning>
                {getDisplayDate()?.format("MMM DD") || "No date"}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCardCompact;
