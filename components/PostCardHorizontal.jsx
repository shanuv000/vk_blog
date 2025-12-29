/**
 * PostCardHorizontal - Compact horizontal card for lists and sidebars
 * Shows small thumbnail on left with title and date on right
 */

import React from "react";
import Link from "next/link";
import moment from "moment";
import { FaCalendarAlt } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { getOptimizedImageUrl } from "../lib/image-config";

const PostCardHorizontal = ({ post, index = 0, showCategory = false }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name;
  const categorySlug = post.categories?.[0]?.slug;

  // Smart date logic: use publishedAt unless it's in the future, then fallback to createdAt
  const getDisplayDate = () => {
    const now = moment();
    const publishedDate = post.publishedAt ? moment(post.publishedAt) : null;
    const createdDate = post.createdAt ? moment(post.createdAt) : null;

    // If publishedAt is in the future, use createdAt instead
    if (publishedDate && publishedDate.isAfter(now)) {
      return createdDate || publishedDate;
    }
    return publishedDate || createdDate;
  };

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="flex items-start gap-4 p-3 rounded-xl hover:bg-secondary-light transition-colors duration-200">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-secondary-light">
          <img
            src={getOptimizedImageUrl(imageUrl, "thumbnail")}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading={index < 3 ? "eager" : "lazy"}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category badge (optional) */}
          {showCategory && categoryName && (
            <Link
              href={`/category/${categorySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block text-primary text-xs font-semibold mb-1 hover:text-primary-light transition-colors"
            >
              {categoryName}
            </Link>
          )}

          {/* Title */}
          <h4 className="text-sm font-semibold text-text-primary line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {post.title}
          </h4>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-2">
            <FaCalendarAlt size={10} />
            <span suppressHydrationWarning>
              {getDisplayDate()?.format("MMM DD, YYYY") || "No date"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PostCardHorizontal;
