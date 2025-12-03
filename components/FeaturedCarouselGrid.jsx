/**
 * Featured Carousel Grid - Hybrid carousel with grid preview
 * Shows main hero with thumbnails grid below
 * Optimized for Hygraph MVP data structure
 */

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import {
  FaArrowRight,
  FaClock,
  FaUser,
  FaBookmark,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
  FaEye,
  FaFire,
  FaTrophy,
} from "react-icons/fa";

import SimpleImage from "../components/SimpleImage";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";

/**
 * Calculate reading time from content
 */
const calculateReadingTime = (content, title = "", excerpt = "") => {
  if (!content && !title && !excerpt) return "5 min read";

  let totalWords = 0;
  if (title)
    totalWords += title.split(/\s+/).filter((w) => w.length > 0).length;
  if (excerpt)
    totalWords += excerpt.split(/\s+/).filter((w) => w.length > 0).length;

  if (content) {
    if (typeof content === "object" && content.raw) {
      try {
        const textContent = JSON.stringify(content.raw).replace(
          /[{}[\]",:]/g,
          " "
        );
        totalWords += textContent
          .split(/\s+/)
          .filter((w) => w.length > 2).length;
      } catch {
        totalWords += 200;
      }
    } else if (typeof content === "string") {
      totalWords += content.split(/\s+/).filter((w) => w.length > 0).length;
    }
  }

  const readingTime = Math.max(1, Math.ceil(totalWords / 220));
  return `${readingTime} min read`;
};

/**
 * Safe post data extraction
 */
const getPostData = (post) => {
  // Handle both direct post and post with originalIndex wrapper
  const actualPost = post?.originalIndex !== undefined ? post : post;

  return {
    slug: actualPost?.slug || "post",
    title: actualPost?.title || "Untitled Post",
    excerpt:
      actualPost?.excerpt ||
      "Discover amazing content in this featured article.",
    createdAt: actualPost?.createdAt || actualPost?.publishedAt || null,
    featuredImage:
      actualPost?.featuredImage?.url ||
      actualPost?.featuredImage ||
      DEFAULT_FEATURED_IMAGE,
    categories: actualPost?.categories || [],
    author: actualPost?.author || {
      name: "Anonymous",
      photo: { url: DEFAULT_FEATURED_IMAGE },
    },
    content: actualPost?.content || null,
  };
};

/**
 * Featured Carousel Grid Component
 * Memoized to prevent unnecessary re-renders
 * Shows a clean, limited selection in grid for better UX
 */
const FeaturedCarouselGrid = memo(
  ({
    featuredPosts = [],
    autoplayInterval = 6000,
    showStats = true,
    maxGridItems = 6, // Limit grid items for cleaner UX
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const validPostsLengthRef = useRef(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    // Filter valid posts - memoized
    const validPosts = React.useMemo(
      () => featuredPosts.filter((post) => post?.slug && post?.title),
      [featuredPosts]
    );

    // Limit posts for grid display - show current post + next items up to maxGridItems
    const gridPosts = React.useMemo(() => {
      if (validPosts.length <= maxGridItems) {
        return validPosts;
      }

      // Show current post and next items, wrapping around if needed
      const posts = [];
      for (let i = 0; i < maxGridItems; i++) {
        const index = (currentIndex + i) % validPosts.length;
        posts.push({ ...validPosts[index], originalIndex: index });
      }
      return posts;
    }, [validPosts, currentIndex, maxGridItems]);

    // Update ref when posts change
    useEffect(() => {
      validPostsLengthRef.current = validPosts.length;
    }, [validPosts.length]);

    // Navigation functions - memoized to prevent recreating on each render
    const nextSlide = useCallback(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % validPostsLengthRef.current);
    }, []);

    const prevSlide = useCallback(() => {
      setDirection(-1);
      setCurrentIndex(
        (prev) =>
          (prev - 1 + validPostsLengthRef.current) % validPostsLengthRef.current
      );
    }, []);

    const goToSlide = useCallback(
      (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
      },
      [currentIndex]
    );

    // Autoplay logic - fixed dependencies to prevent infinite loops
    useEffect(() => {
      if (isAutoplay && !isHovered && validPosts.length > 1) {
        intervalRef.current = setInterval(() => {
          setDirection(1);
          setCurrentIndex((prev) => (prev + 1) % validPostsLengthRef.current);
        }, autoplayInterval);

        return () => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        };
      }
    }, [isAutoplay, isHovered, validPosts.length, autoplayInterval]);

    // Keyboard navigation - memoized handler
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSlide();
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          nextSlide();
        }
        if (e.key === " ") {
          e.preventDefault();
          setIsAutoplay((prev) => !prev);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Touch/Swipe support for mobile
    const handleTouchStart = useCallback((e) => {
      touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e) => {
      touchEndX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
      if (!touchStartX.current || !touchEndX.current) return;

      const difference = touchStartX.current - touchEndX.current;
      const threshold = 50; // Minimum swipe distance

      if (Math.abs(difference) > threshold) {
        if (difference > 0) {
          // Swiped left - go to next
          nextSlide();
        } else {
          // Swiped right - go to previous
          prevSlide();
        }
      }

      // Reset
      touchStartX.current = 0;
      touchEndX.current = 0;
    }, [nextSlide, prevSlide]);

    if (!validPosts.length) return null;

    const currentPost = getPostData(validPosts[currentIndex]);
    const readingTime = calculateReadingTime(
      currentPost.content,
      currentPost.title,
      currentPost.excerpt
    );

    // Animation variants - memoized to prevent recreation
    const slideVariants = React.useMemo(
      () => ({
        enter: (direction) => ({
          x: direction > 0 ? 1000 : -1000,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
        exit: (direction) => ({
          x: direction < 0 ? 1000 : -1000,
          opacity: 0,
          transition: {
            duration: 0.3,
          },
        }),
      }),
      []
    );

    return (
      <section className="mb-12 space-y-6">
        {/* Main Hero Section */}
        <div
          className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden bg-gray-900 rounded-2xl shadow-2xl touch-pan-y"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          aria-label="Featured article hero"
          role="region"
        >
          {/* Background Image */}
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.div
              key={`carousel-${currentIndex}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
              style={{ willChange: "transform, opacity" }}
            >
              <SimpleImage
                src={currentPost.featuredImage}
                alt={currentPost.title}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                sizes="100vw"
                fallbackSrc={DEFAULT_FEATURED_IMAGE}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
              <div className="max-w-3xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${currentIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    {/* Badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full">
                        <FaTrophy className="text-white text-sm" />
                        <span className="text-white font-bold text-sm uppercase tracking-wide">
                          Featured
                        </span>
                      </div>
                      {currentPost.categories.length > 0 && (
                        <span className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {currentPost.categories[0].name}
                        </span>
                      )}
                      {showStats && (
                        <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-md text-orange-300 px-4 py-2 rounded-full text-sm font-semibold">
                          <FaFire className="text-orange-400" />
                          <span>Trending</span>
                        </div>
                      )}
                    </div>

                    {/* Title - Optimized for readability */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight line-clamp-3">
                      {currentPost.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-5 text-gray-300 text-sm">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-primary" />
                        <span className="font-medium">
                          {currentPost.author.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-primary" />
                        <span className="font-medium">{readingTime}</span>
                      </div>
                      {currentPost.createdAt && (
                        <span className="font-medium" suppressHydrationWarning>
                          {moment(currentPost.createdAt).format("MMM DD, YYYY")}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div>
                      <Link href={`/post/${currentPost.slug}`}>
                        <motion.button
                          whileHover={{ scale: 1.05, x: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="group flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                          <span>Read Article</span>
                          <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          {validPosts.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 touch-manipulation"
                aria-label="Previous slide"
              >
                <FaChevronLeft />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 touch-manipulation"
                aria-label="Next slide"
              >
                <FaChevronRight />
              </button>

              {/* Autoplay Toggle */}
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className="absolute bottom-6 right-6 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 active:scale-95 touch-manipulation"
                aria-label={isAutoplay ? "Pause autoplay" : "Start autoplay"}
              >
                {isAutoplay ? (
                  <FaPause className="text-xs" />
                ) : (
                  <FaPlay className="text-xs ml-0.5" />
                )}
              </button>
            </>
          )}

          {/* Progress Bar */}
          {isAutoplay && !isHovered && validPosts.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-30">
              <motion.div
                key={currentIndex}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: autoplayInterval / 1000,
                  ease: "linear",
                }}
                className="h-full bg-primary"
              />
            </div>
          )}
        </div>

        {/* Thumbnail Grid - Limited & Clean */}
        <div className="relative">
          {/* Grid Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <FaFire className="text-primary text-lg" />
              <h3 className="text-lg font-bold text-text-primary">
                More Featured Posts
              </h3>
              <span className="text-sm text-gray-500">
                ({currentIndex + 1} of {validPosts.length})
              </span>
            </div>

            {validPosts.length > maxGridItems && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="hidden sm:inline">
                  Showing {maxGridItems} of {validPosts.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={prevSlide}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                    title="Previous posts"
                    aria-label="Previous posts"
                  >
                    <FaChevronLeft className="text-xs" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                    title="Next posts"
                    aria-label="Next posts"
                  >
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Grid - Responsive & Clean */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {gridPosts.map((post, idx) => {
              const postData = getPostData(post);
              const isActive = post.originalIndex === currentIndex;
              const displayIndex =
                post.originalIndex !== undefined ? post.originalIndex : idx;

              return (
                <motion.div
                  key={`grid-${post.originalIndex || idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    goToSlide(
                      post.originalIndex !== undefined
                        ? post.originalIndex
                        : displayIndex
                    )
                  }
                  className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-lg transition-all duration-300 touch-manipulation ${
                    isActive
                      ? "ring-4 ring-primary shadow-2xl shadow-primary/30"
                      : "hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600"
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${postData.title}`}
                >
                  {/* Image Container with Fixed Aspect Ratio */}
                  <div className="relative w-full aspect-video bg-gray-800">
                      <SimpleImage
                      src={postData.featuredImage}
                      alt={postData.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className={`object-cover transition-all duration-300 ${
                        isActive ? "" : "group-hover:scale-110"
                      }`}
                      fallbackSrc={DEFAULT_FEATURED_IMAGE}
                      priority={idx < 3}
                    />

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        isActive
                          ? "bg-primary/30"
                          : "bg-black/40 group-hover:bg-black/20"
                      }`}
                    />

                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-10"
                      >
                        <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-xl">
                          <FaEye className="text-white text-xl" />
                        </div>
                      </motion.div>
                    )}

                    {/* Number Badge */}
                    {!isActive && (
                      <div className="absolute top-2 left-2 w-8 h-8 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 z-10">
                        <span className="text-white font-bold text-sm">
                          {displayIndex + 1}
                        </span>
                      </div>
                    )}

                    {/* Trending Badge for top 3 */}
                    {displayIndex < 3 && !isActive && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                          <FaFire className="text-white text-xs" />
                          <span className="text-white text-xs font-bold">
                            Hot
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Title - Cleaner layout */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
                      <h3
                        className={`text-white font-semibold leading-tight line-clamp-2 transition-all duration-300 ${
                          isActive ? "text-sm" : "text-xs group-hover:text-sm"
                        }`}
                      >
                        {postData.title}
                      </h3>
                      {isActive && postData.categories.length > 0 && (
                        <span className="inline-block mt-1 text-xs text-primary-light font-medium">
                          {postData.categories[0].name}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend - Simplified */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-xs sm:text-sm">Currently Viewing</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <FaFire className="text-red-500" />
            <span className="text-xs sm:text-sm">Trending Posts</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-gray-400">Space</span>
            <span className="text-xs sm:text-sm">Pause/Play</span>
          </div>
        </div>
      </section>
    );
  }
);

// Add display name for debugging
FeaturedCarouselGrid.displayName = "FeaturedCarouselGrid";

export default FeaturedCarouselGrid;
