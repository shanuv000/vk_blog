/**
 * Featured Carousel - Hero carousel component
 * Shows main hero with navigation controls and autoplay
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
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
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
 * Featured Carousel Component
 * Memoized to prevent unnecessary re-renders
 * Shows a clean, impactful hero carousel for featured posts
 */
const FeaturedCarouselGrid = memo(
  ({
    featuredPosts = [],
    autoplayInterval = 6000,
    showStats = true,
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
      <section
        className="mb-12 space-y-6"
        aria-roledescription="carousel"
        aria-label="Featured articles carousel"
      >
        {/* Screen reader announcement for slide changes */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Showing article {currentIndex + 1} of {validPosts.length}:{" "}
          {currentPost.title}
        </div>

        {/* Main Hero Section */}
        <div
          className="relative w-full h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden bg-gray-900 rounded-2xl shadow-2xl touch-pan-y"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${currentIndex + 1} of ${validPosts.length}`}
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

          {/* Dot Indicators */}
          {validPosts.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {validPosts.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-6 h-2.5 bg-primary"
                      : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? "true" : "false"}
                />
              ))}
              {validPosts.length > 8 && (
                <span className="text-white/60 text-xs ml-1">
                  +{validPosts.length - 8}
                </span>
              )}
            </div>
          )}

          {/* Slide Counter */}
          {validPosts.length > 1 && (
            <div className="absolute bottom-6 left-6 z-20 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-white/90 text-sm font-medium">
                {currentIndex + 1} / {validPosts.length}
              </span>
            </div>
          )}
        </div>
      </section>
    );
  }
);

// Add display name for debugging
FeaturedCarouselGrid.displayName = "FeaturedCarouselGrid";

export default FeaturedCarouselGrid;
