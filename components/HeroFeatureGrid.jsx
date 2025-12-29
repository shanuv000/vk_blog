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
      <article className="relative rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-[16/9]">
        {/* Background Image */}
        <img
          src={getOptimizedImageUrl(imageUrl, "hero")}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          {/* Category Badge */}
          <Link
            href={`/category/${categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 hover:bg-primary-dark transition-colors"
          >
            {categoryName}
          </Link>

          {/* Title */}
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-heading font-bold text-white mb-4 line-clamp-3 group-hover:text-primary-light transition-colors">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-text-secondary text-sm lg:text-base mb-4 line-clamp-2 hidden sm:block">
            {post.excerpt}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-gray-300">
            {post.author?.name && (
              <div className="flex items-center gap-1.5">
                <FaUser size={12} />
                <span>{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt size={12} />
              <span suppressHydrationWarning>
                {getPostDisplayDate(post)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock size={12} />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

// Secondary feature card (smaller, for right side)
const SecondaryFeatureCard = ({ post }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="relative rounded-xl overflow-hidden aspect-[16/9]">
        {/* Background Image */}
        <img
          src={getOptimizedImageUrl(imageUrl, "postCard")}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
          {/* Category Badge */}
          <Link
            href={`/category/${categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block bg-primary/90 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3 hover:bg-primary transition-colors"
          >
            {categoryName}
          </Link>

          {/* Title */}
          <h3 className="text-lg lg:text-xl font-heading font-bold text-white line-clamp-2 group-hover:text-primary-light transition-colors">
            {post.title}
          </h3>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-2">
            <FaCalendarAlt size={10} />
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
    <section className="container mx-auto px-4 mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Main large feature - 8 columns on desktop */}
        <div className="lg:col-span-8">
          <LargeFeatureCard post={mainPost} />
        </div>

        {/* Secondary features - 4 columns, stacked */}
        {secondaryPosts.length > 0 && (
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
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
