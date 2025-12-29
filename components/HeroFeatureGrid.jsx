/**
 * HeroFeatureGrid - Magazine-style hero section with featured posts
 * Shows a large featured post on the left and 2 smaller posts stacked on the right
 */

import React from "react";
import Link from "next/link";
import { FaCalendarAlt, FaUser, FaClock } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { getOptimizedImageUrl } from "../lib/image-config";
import { getPostDisplayDate } from "../lib/date-utils";

// Calculate reading time estimate
const calculateReadingTime = (content = "", title = "") => {
  const text = content + " " + title;
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};



// Large featured card component
const LargeFeatureCard = ({ post }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";
  const readingTime = calculateReadingTime(post.excerpt, post.title);

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-[16/9] shadow-2xl">
        {/* Background Image */}
        <img
          src={getOptimizedImageUrl(imageUrl, "hero")}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
        {/* Gradient overlay - deeper for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />

        {/* Content - Mobile-first spacing */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          {/* Category Badge - Using span to avoid nested Link error */}
          <span className="inline-block bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4 shadow-lg">
            {categoryName}
          </span>

          {/* Title - Responsive sizing */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-heading font-bold text-white mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-tight group-hover:text-primary-light transition-colors">
            {post.title}
          </h2>

          {/* Excerpt - Hidden on mobile to reduce clutter */}
          <p className="text-gray-300 text-sm lg:text-base mb-3 sm:mb-4 line-clamp-2 hidden sm:block">
            {post.excerpt}
          </p>

          {/* Meta info - Compact on mobile */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
            {post.author?.name && (
              <div className="flex items-center gap-1.5">
                <FaUser size={10} className="text-primary/80" />
                <span className="truncate max-w-[80px] sm:max-w-none">{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt size={10} className="text-primary/80" />
              <span suppressHydrationWarning>
                {getPostDisplayDate(post)}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <FaClock size={10} className="text-primary/80" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Secondary feature card (smaller, for right side) - Mobile optimized
const SecondaryFeatureCard = ({ post }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-[16/10] shadow-lg">
        {/* Background Image */}
        <img
          src={getOptimizedImageUrl(imageUrl, "postCard")}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5">
          {/* Category Badge - Using span to avoid nested Link error */}
          <span className="inline-block bg-primary text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full mb-2 sm:mb-3 shadow-md">
            {categoryName}
          </span>

          {/* Title */}
          <h3 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-white line-clamp-2 group-hover:text-primary-light transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-300 mt-1.5 sm:mt-2">
            <FaCalendarAlt size={9} className="text-primary/80" />
            <span suppressHydrationWarning>
              {getPostDisplayDate(post)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Main HeroFeatureGrid component
const HeroFeatureGrid = ({ posts = [] }) => {
  // Need at least 1 post
  if (!posts || posts.length === 0) return null;

  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);

  return (
    <section className="mb-6 sm:mb-8 lg:mb-10 mt-4 sm:mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6">
        {/* Main large feature - 8 columns on desktop */}
        <div className="lg:col-span-8">
          <LargeFeatureCard post={mainPost} />
        </div>

        {/* Secondary features - 4 columns, stacked. 2 cols on tablet, 1 col on desktop */}
        {secondaryPosts.length > 0 && (
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-4">
            {secondaryPosts.map((post, index) => (
              <SecondaryFeatureCard key={post.slug || index} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroFeatureGrid;
