/**
 * TopStoriesSection - Premium horizontal scrolling story cards
 * Mobile-first magazine-style curated content section
 */

import React, { memo, useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FaCalendarAlt, FaFire, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getOptimizedImageUrl } from "../lib/image-config";
import { getPostDisplayDate } from "../lib/date-utils";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";

// Compact story card - overlay style with explicit height
const StoryCard = memo(({ post, index }) => {
  if (!post) return null;

  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const categoryName = post.categories?.[0]?.name;

  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex-shrink-0 block w-[180px] sm:w-[220px] lg:w-[260px]"
    >
      <article className="relative rounded-xl overflow-hidden h-[240px] sm:h-[280px] lg:h-[320px] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        {/* Full background image */}
        <img
          src={getOptimizedImageUrl(imageUrl, "postCard")}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading={index < 2 ? "eager" : "lazy"}
        />
        
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        
        {/* Category badge */}
        {categoryName && (
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md shadow-lg z-10">
            {categoryName}
          </span>
        )}
        
        {/* Trending indicator for first 2 */}
        {index < 2 && (
          <span className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg z-10">
            <FaFire size={8} />
            TRENDING
          </span>
        )}

        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-heading font-bold text-white line-clamp-2 mb-2 leading-snug group-hover:text-primary-light transition-colors duration-200 drop-shadow-lg">
            {post.title}
          </h3>

          {/* Date */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-200">
            <FaCalendarAlt size={9} />
            <span suppressHydrationWarning>{getPostDisplayDate(post)}</span>
          </div>
        </div>
      </article>
    </Link>
  );
});

StoryCard.displayName = "StoryCard";

// Main section component with working scroll controls
const TopStoriesSection = memo(({ posts = [], title = "Top Stories" }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Need at least 3 posts
  if (!posts || posts.length < 3) return null;

  // Use 6-8 posts for this section
  const storyPosts = posts.slice(0, 8);

  // Check scroll position - memoized
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 20);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
    }
  }, []);

  // Initialize scroll state on mount
  useEffect(() => {
    checkScroll();
    // Small delay to ensure layout is complete
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [checkScroll, storyPosts]);

  // Scroll handlers with larger scroll distance
  const handleScrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  }, [checkScroll]);

  const handleScrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
      setTimeout(checkScroll, 350);
    }
  }, [checkScroll]);

  return (
    <section className="mb-8 sm:mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
          <FaFire className="text-orange-500" size={20} />
          {title}
        </h2>
        
        {/* Scroll controls - always visible on desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
              canScrollLeft 
                ? "border-border bg-secondary hover:border-primary hover:bg-primary hover:text-white cursor-pointer" 
                : "border-border/30 bg-secondary/50 text-text-tertiary/50 cursor-not-allowed"
            }`}
            aria-label="Scroll left"
            type="button"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
              canScrollRight 
                ? "border-border bg-secondary hover:border-primary hover:bg-primary hover:text-white cursor-pointer" 
                : "border-border/30 bg-secondary/50 text-text-tertiary/50 cursor-not-allowed"
            }`}
            aria-label="Scroll right"
            type="button"
          >
            <FaChevronRight size={14} />
          </button>
        </div>

        {/* Mobile swipe hint */}
        <span className="sm:hidden text-xs text-text-tertiary flex items-center gap-1">
          Swipe <FaChevronRight size={10} />
        </span>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div className="relative">
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide overscroll-x-contain -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {storyPosts.map((post, index) => {
            const postData = post.node || post;
            return (
              <div key={postData.slug || index} className="snap-start">
                <StoryCard post={postData} index={index} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom scrollbar hide */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
});

TopStoriesSection.displayName = "TopStoriesSection";

export default TopStoriesSection;


