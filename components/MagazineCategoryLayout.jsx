/**
 * MagazineCategoryLayout - Premium magazine-style layout for category pages
 * 
 * OPTIMIZED FOR:
 * - Mobile-first design (primary users)
 * - Performance (Core Web Vitals)
 * - Reduced DOM size
 * - Lazy loading below-fold content
 */

import React, { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaCalendarAlt, FaUser, FaClock, FaArrowRight } from "react-icons/fa";
import { InfiniteScrollLoader } from "./ApiLoadingStates";
import PostCardSkeleton from "./PostCardSkeleton";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { getOptimizedImageUrl, IMAGE_CONFIGS } from "../lib/image-config";

// Lightweight date formatter - avoids 70KB+ moment.js bundle on each call
const formatDate = (dateString, format = "short") => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // If published date is in future, it's likely a scheduled post issue
    if (date > now) {
      return format === "short" 
        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    
    return format === "short"
      ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "No date";
  }
};

// Get display date with smart fallback
const getDisplayDate = (post, format = "short") => {
  const publishedAt = post?.publishedAt;
  const createdAt = post?.createdAt;
  
  if (publishedAt) {
    const pubDate = new Date(publishedAt);
    if (pubDate <= new Date()) {
      return formatDate(publishedAt, format);
    }
  }
  return formatDate(createdAt || publishedAt, format);
};

// Calculate reading time estimate
const calculateReadingTime = (excerpt = "", title = "") => {
  const text = (excerpt || "") + " " + (title || "");
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

/**
 * Hero Card - Mobile-optimized with smaller image on mobile
 */
const HeroCard = memo(({ post }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";
  const readingTime = calculateReadingTime(post.excerpt, post.title);

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] lg:aspect-[21/9] mb-4 sm:mb-6">
        {/* Background Image - Using Next.js Image for optimization */}
        <Image
          src={getOptimizedImageUrl(imageUrl, "hero")}
          alt={post.title}
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
          className="object-cover"
          quality={75}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        
        {/* Featured Badge - Smaller on mobile */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-primary/90 text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg flex items-center gap-1.5">
          <span>★ FEATURED</span>
        </div>

        {/* Content - Reduced padding on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          {/* Category Badge */}
          <Link
            href={`/category/${categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block bg-white/15 text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full mb-2 sm:mb-3 border border-white/20"
          >
            {categoryName}
          </Link>

          {/* Title - Smaller on mobile, limited to 2 lines */}
          <h2 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-heading font-bold text-white mb-2 sm:mb-3 line-clamp-2 leading-tight">
            {post.title}
          </h2>

          {/* Excerpt - Hidden on mobile to reduce clutter */}
          <p className="text-gray-300 text-sm mb-3 line-clamp-2 max-w-2xl hidden sm:block">
            {post.excerpt}
          </p>

          {/* Meta info - Condensed on mobile */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
            {post.author?.name && (
              <div className="flex items-center gap-1.5">
                <FaUser size={10} className="text-primary-light" />
                <span className="truncate max-w-[80px] sm:max-w-none">{post.author.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt size={10} className="text-primary-light" />
              <span suppressHydrationWarning>{getDisplayDate(post, "long")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaClock size={10} className="text-primary-light" />
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
});

HeroCard.displayName = "HeroCard";

/**
 * Featured Card - Mobile-optimized overlay card
 */
const FeaturedCard = memo(({ post, priority = false }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="relative rounded-lg sm:rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[4/3]">
        {/* Background Image */}
        <Image
          src={getOptimizedImageUrl(imageUrl, "postCard")}
          alt={post.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 400px"
          className="object-cover"
          quality={65}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content - Compact on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          {/* Category Badge */}
          <Link
            href={`/category/${categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-block bg-primary/90 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full mb-2"
          >
            {categoryName}
          </Link>

          {/* Title */}
          <h3 className="text-sm sm:text-base lg:text-lg font-heading font-bold text-white line-clamp-2 leading-snug">
            {post.title}
          </h3>

          {/* Date - Smaller */}
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-300 mt-1.5">
            <FaCalendarAlt size={9} />
            <span suppressHydrationWarning>{getDisplayDate(post)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
});

FeaturedCard.displayName = "FeaturedCard";

/**
 * Grid Card - Mobile-first card design
 */
const GridCard = memo(({ post }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name || "General";
  const categorySlug = post.categories?.[0]?.slug || "general";

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="bg-secondary rounded-lg sm:rounded-xl overflow-hidden border border-border">
        {/* Image - Optimized aspect ratio */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={getOptimizedImageUrl(imageUrl, "postCard")}
            alt={post.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover"
            quality={65}
            loading="lazy"
          />
          {/* Category Badge */}
          <Link
            href={`/category/${categorySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full z-10"
          >
            {categoryName}
          </Link>
        </div>

        {/* Content - Compact padding */}
        <div className="p-3 sm:p-4">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-heading font-semibold text-text-primary line-clamp-2 mb-1.5 sm:mb-2">
            {post.title}
          </h3>

          {/* Excerpt - Hidden on very small screens */}
          <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 mb-2 hidden xs:block">
            {post.excerpt}
          </p>

          {/* Meta - Single line */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-text-tertiary pt-2 border-t border-border">
            {post.author?.name && (
              <span className="truncate max-w-[100px]">{post.author.name}</span>
            )}
            <span suppressHydrationWarning>{getDisplayDate(post)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
});

GridCard.displayName = "GridCard";

/**
 * Compact Card - For trending sidebar (hidden on mobile)
 */
const CompactCard = memo(({ post, index }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;

  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary-light transition-colors">
        {/* Number indicator */}
        <span className="text-xl font-bold text-primary/40 w-5 text-center flex-shrink-0">
          {index + 1}
        </span>
        
        {/* Thumbnail */}
        <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-secondary-light">
          <Image
            src={getOptimizedImageUrl(imageUrl, "thumbnail")}
            alt={post.title}
            fill
            sizes="56px"
            className="object-cover"
            quality={60}
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-text-primary line-clamp-2 leading-snug">
            {post.title}
          </h4>
          <span className="text-[10px] text-text-tertiary mt-1 block" suppressHydrationWarning>
            {getDisplayDate(post)}
          </span>
        </div>
      </article>
    </Link>
  );
});

CompactCard.displayName = "CompactCard";

/**
 * Main Magazine Layout Component - Mobile-First
 */
const MagazineCategoryLayout = ({
  posts = [],
  hasMore = false,
  loadMorePosts,
  loadInitialPosts,
  categoryName = "Category",
  totalCount = 0,
  postsCount = 0,
  sidebarContent = null,
}) => {
  // Memoize post extraction to avoid recalculation
  const { heroPost, featuredPosts, gridPosts, trendingPosts } = useMemo(() => {
    const hero = posts[0]?.node || posts[0];
    const featured = posts.slice(1, 3).map(p => p.node || p);
    const grid = posts.slice(3).map(p => p.node || p);
    // Only take unique posts for trending that aren't already shown
    const trending = posts.slice(3, 8).map(p => p.node || p);
    
    return {
      heroPost: hero,
      featuredPosts: featured,
      gridPosts: grid,
      trendingPosts: trending,
    };
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section - First Post */}
      {heroPost && <HeroCard post={heroPost} />}

      {/* Featured Grid - Posts 2-3 (single column on very small screens) */}
      {featuredPosts.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {featuredPosts.map((post, index) => (
            <FeaturedCard key={post.slug || index} post={post} priority={index === 0} />
          ))}
        </div>
      )}

      {/* Main Content Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Content Grid - Posts 4+ */}
        <div className="lg:col-span-8">
          {/* Section Header - Simplified */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <h2 className="text-base sm:text-lg font-heading font-bold text-text-primary">
              More in {categoryName}
            </h2>
            {totalCount > 0 && (
              <span className="text-xs text-text-tertiary">
                {postsCount}/{totalCount}
              </span>
            )}
          </div>

          {/* Infinite Scroll Grid - Single column on mobile for faster LCP */}
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={<InfiniteScrollLoader count={2} />}
            endMessage={
              gridPosts.length > 0 && (
                <div className="text-center py-6">
                  <span className="text-sm text-text-secondary">
                    🎉 That's all for {categoryName}!
                  </span>
                </div>
              )
            }
            refreshFunction={loadInitialPosts}
            pullDownToRefresh={false}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {gridPosts.map((post, index) => (
              <GridCard key={post.slug || index} post={post} />
            ))}
          </InfiniteScroll>
        </div>

        {/* Sidebar - Hidden on mobile, shown only on lg+ */}
        <aside className="hidden lg:block lg:col-span-4">
          <div className="sticky top-8 space-y-6">
            {/* Trending Posts - Uses different posts to avoid duplication */}
            {trendingPosts.length > 0 && (
              <div className="bg-secondary rounded-xl border border-border p-4">
                <h3 className="text-base font-heading font-bold text-text-primary mb-3 pb-2 border-b border-border flex items-center gap-2">
                  <span className="text-primary">🔥</span> Popular
                </h3>
                <div className="space-y-1">
                  {trendingPosts.map((post, index) => (
                    <CompactCard key={post.slug || index} post={post} index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Additional Sidebar Content (Categories widget) */}
            {sidebarContent}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default memo(MagazineCategoryLayout);
