/**
 * Featured Hero Carousel - Premium full-width slider showcasing best content
 * Combines the impact of a hero section with carousel functionality
 * Enhanced with grid layout support and Hygraph integration
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
  FaExpand,
  FaCompress,
  FaShareAlt,
  FaEye,
} from "react-icons/fa";

import OptimizedImage from "./OptimizedImage";
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
const getPostData = (post) => ({
  slug: post?.slug || "post",
  title: post?.title || "Untitled Post",
  excerpt:
    post?.excerpt || "Discover amazing content in this featured article.",
  createdAt: post?.createdAt || post?.publishedAt || null,
  featuredImage: post?.featuredImage?.url || DEFAULT_FEATURED_IMAGE,
  categories: post?.categories || [],
  author: post?.author || {
    name: "Anonymous",
    photo: { url: DEFAULT_FEATURED_IMAGE },
  },
  content: post?.content || null,
});

/**
 * Featured Hero Carousel Component
 * Enhanced with grid layout and additional features
 * Memoized to prevent unnecessary re-renders
 */
const FeaturedHeroCarousel = memo(
  ({
    featuredPosts = [],
    autoplayInterval = 6000,
    showThumbnails = true,
    enableFullscreen = true,
    showViewCount = true,
    layout = "hero", // "hero" or "grid"
  }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const validPostsLengthRef = useRef(0);

    // Filter valid posts - memoized
    const validPosts = React.useMemo(
      () => featuredPosts.filter((post) => post?.slug && post?.title),
      [featuredPosts]
    );

    // Update ref when posts change
    useEffect(() => {
      validPostsLengthRef.current = validPosts.length;
    }, [validPosts.length]);

    // Navigation functions - memoized
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

    // Autoplay logic - fixed dependencies
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

    // Fullscreen toggle - memoized
    const toggleFullscreen = useCallback(() => {
      setIsFullscreen((prev) => !prev);
    }, []);

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
        if (e.key === "f" && enableFullscreen) {
          e.preventDefault();
          toggleFullscreen();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide, enableFullscreen, toggleFullscreen]);

    // Share functionality - memoized
    const handleShare = useCallback(async (post) => {
      const shareData = {
        title: post.title,
        text: post.excerpt,
        url: `${window.location.origin}/post/${post.slug}`,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // User cancelled share - this is normal, no action needed
          if (process.env.NODE_ENV === "development") {
            console.log("Share cancelled");
          }
        }
      } else {
        // Fallback - copy to clipboard
        try {
          await navigator.clipboard.writeText(shareData.url);
          alert("Link copied to clipboard!");
        } catch (err) {
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to copy:", err);
          }
        }
      }
    }, []);

    // Image preloading - memoized
    useEffect(() => {
      const preloadImage = (url) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setLoadedImages((prev) => new Set([...prev, url]));
        };
      };

      // Preload current and next image
      if (validPosts[currentIndex]?.featuredImage?.url) {
        preloadImage(validPosts[currentIndex].featuredImage.url);
      }
      if (validPosts[currentIndex + 1]?.featuredImage?.url) {
        preloadImage(validPosts[currentIndex + 1].featuredImage.url);
      }
    }, [currentIndex, validPosts]);

    if (!validPosts.length) return null;

    const currentPost = getPostData(validPosts[currentIndex]);
    const readingTime = calculateReadingTime(
      currentPost.content,
      currentPost.title,
      currentPost.excerpt
    );

    // Animation variants
    const slideVariants = {
      enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.95,
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.7,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
      exit: (direction) => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.5,
        },
      }),
    };

    const contentVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.15,
          duration: 0.6,
          ease: "easeOut",
        },
      }),
    };

    return (
      <section
        className={`relative w-full overflow-hidden bg-gray-900 mb-12 rounded-2xl shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none mb-0"
            : "h-[85vh] min-h-[600px] max-h-[900px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Featured articles hero carousel"
      >
        {/* Background Image Slider */}
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={`hero-${currentIndex}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
            style={{ willChange: "transform, opacity" }}
          >
            <OptimizedImage
              src={currentPost.featuredImage}
              alt={currentPost.title}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="100vw"
              fallbackSrc={DEFAULT_FEATURED_IMAGE}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content Container */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
            <div className="max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`hero-content-${currentIndex}`}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Featured Badge */}
                  <motion.div
                    custom={0}
                    variants={contentVariants}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2 bg-primary/90 backdrop-blur-md px-4 py-2 rounded-full">
                      <FaBookmark className="text-white text-sm" />
                      <span className="text-white font-bold text-sm uppercase tracking-wide">
                        Featured
                      </span>
                    </div>
                    {currentPost.categories.length > 0 && (
                      <span className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {currentPost.categories[0].name}
                      </span>
                    )}
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    custom={1}
                    variants={contentVariants}
                    className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight"
                  >
                    {currentPost.title}
                  </motion.h1>

                  {/* Excerpt */}
                  <motion.p
                    custom={2}
                    variants={contentVariants}
                    className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-2xl"
                  >
                    {currentPost.excerpt}
                  </motion.p>

                  {/* Meta Information */}
                  <motion.div
                    custom={3}
                    variants={contentVariants}
                    className="flex flex-wrap items-center gap-6 text-gray-300"
                  >
                    {/* Author */}
                    <div className="flex items-center gap-2">
                      <FaUser className="text-primary" />
                      <span className="font-medium">
                        {currentPost.author.name}
                      </span>
                    </div>

                    {/* Reading Time */}
                    <div className="flex items-center gap-2">
                      <FaClock className="text-primary" />
                      <span className="font-medium">{readingTime}</span>
                    </div>

                    {/* Date */}
                    {currentPost.createdAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {moment(currentPost.createdAt).format("MMM DD, YYYY")}
                        </span>
                      </div>
                    )}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div custom={4} variants={contentVariants}>
                    <Link href={`/post/${currentPost.slug}`}>
                      <motion.button
                        whileHover={{ scale: 1.05, x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <span>Read Full Article</span>
                        <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {validPosts.length > 1 && (
          <>
            {/* Previous Button */}
            <motion.button
              whileHover={{ scale: 1.1, x: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300"
              aria-label="Previous slide"
            >
              <FaChevronLeft className="text-xl" />
            </motion.button>

            {/* Next Button */}
            <motion.button
              whileHover={{ scale: 1.1, x: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300"
              aria-label="Next slide"
            >
              <FaChevronRight className="text-xl" />
            </motion.button>

            {/* Dot Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
              {validPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentIndex
                      ? "w-12 h-3 bg-primary rounded-full"
                      : "w-3 h-3 bg-white/40 hover:bg-white/60 rounded-full"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Autoplay Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAutoplay(!isAutoplay)}
              className="absolute bottom-8 right-8 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300"
              aria-label={isAutoplay ? "Pause autoplay" : "Resume autoplay"}
            >
              {isAutoplay ? (
                <FaPause className="text-sm" />
              ) : (
                <FaPlay className="text-sm ml-1" />
              )}
            </motion.button>

            {/* Fullscreen Toggle */}
            {enableFullscreen && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="absolute bottom-8 right-24 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <FaCompress className="text-sm" />
                ) : (
                  <FaExpand className="text-sm" />
                )}
              </motion.button>
            )}

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleShare(currentPost)}
              className="absolute bottom-8 right-40 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300"
              aria-label="Share this post"
            >
              <FaShareAlt className="text-sm" />
            </motion.button>

            {/* Progress Bar */}
            {isAutoplay && !isHovered && (
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
          </>
        )}

        {/* Slide Counter */}
        <div className="absolute top-8 right-8 z-20 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <span className="text-white font-bold text-sm">
            {currentIndex + 1} / {validPosts.length}
          </span>
        </div>

        {/* Thumbnail Grid (Bottom) */}
        {showThumbnails && validPosts.length > 1 && !isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 hidden lg:flex gap-3 max-w-4xl overflow-x-auto px-4 py-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
          >
            {validPosts.map((post, idx) => {
              const postData = getPostData(post);
              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToSlide(idx)}
                  className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                    idx === currentIndex
                      ? "border-primary shadow-lg shadow-primary/50"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <OptimizedImage
                    src={postData.featuredImage}
                    alt={postData.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                    fallbackSrc={DEFAULT_FEATURED_IMAGE}
                  />
                  {idx === currentIndex && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <FaEye className="text-white text-xl" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </section>
    );
  }
);

// Add display name for debugging
FeaturedHeroCarousel.displayName = "FeaturedHeroCarousel";

export default FeaturedHeroCarousel;
