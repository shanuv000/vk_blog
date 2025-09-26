import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import moment from "moment";
import {
  FaArrowRight,
  FaClock,
  FaUser,
  FaEye,
  FaExclamationTriangle,
} from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import HeroSpotlightSkeleton from "./HeroSpotlightSkeleton";
import styles from "../styles/HeroSpotlight.module.css";

// Calculate reading time with better accuracy
const calculateReadingTime = (content, title = "", excerpt = "") => {
  if (!content && !title && !excerpt) return "5 min read";

  let totalWords = 0;

  // Count words from title
  if (title) {
    totalWords += title.split(/\s+/).filter((word) => word.length > 0).length;
  }

  // Count words from excerpt
  if (excerpt) {
    totalWords += excerpt.split(/\s+/).filter((word) => word.length > 0).length;
  }

  // Count words from content
  if (content) {
    if (typeof content === "object" && content.raw) {
      try {
        const textContent = JSON.stringify(content.raw).replace(
          /[{}[\]",:]/g,
          " "
        );
        totalWords += textContent
          .split(/\s+/)
          .filter((word) => word.length > 2).length;
      } catch {
        totalWords += 200; // Default fallback
      }
    } else if (typeof content === "string") {
      totalWords += content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    }
  }

  // Average reading speed is 200-250 words per minute
  const readingTime = Math.max(1, Math.ceil(totalWords / 220));
  return `${readingTime} min read`;
};

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94], // Custom cubic-bezier easing
    },
  },
};

const HeroSpotlight = ({
  featuredPosts = [],
  isLoading = false,
  error = null,
}) => {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [imageError, setImageError] = useState(false);

  // Enhanced parallax transforms
  const y = useTransform(scrollY, [0, 800], [0, -200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.6]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.1]);

  // Mouse movement parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  // Handle mouse movement for subtle 3D effect
  const handleMouseMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(event.clientX - centerX);
    mouseY.set(event.clientY - centerY);
  };

  // Show loading skeleton
  if (isLoading || !featuredPosts || featuredPosts.length === 0) {
    return <HeroSpotlightSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center text-white z-10">
          <FaExclamationTriangle className="text-6xl text-primary mb-4 mx-auto" />
          <h2 className="text-3xl font-bold mb-2">
            Unable to Load Featured Content
          </h2>
          <p className="text-gray-300 mb-6">
            There was an error loading the featured posts.
          </p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 rounded-full text-white font-semibold ${styles.ctaButton}`}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // Get the main hero post and auxiliary posts
  const heroPost = featuredPosts[0];
  const auxiliaryPosts = featuredPosts.slice(1, 3);

  // Safe access to post properties
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

  const heroData = getPostData(heroPost);
  const readingTime = calculateReadingTime(
    heroData.content,
    heroData.title,
    heroData.excerpt
  );

  return (
    <section
      ref={containerRef}
      className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black ${styles.heroContainer}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* Hero Background Image with Enhanced Parallax */}
      <motion.div
        style={{ y, opacity, scale }}
        className={`absolute inset-0 z-0 ${styles.parallaxImage}`}
      >
        <OptimizedImage
          src={heroData.featuredImage}
          alt={heroData.title}
          fill
          className="object-cover"
          priority={true}
          quality={95}
          fallbackSrc={DEFAULT_FEATURED_IMAGE}
        />
        {/* Enhanced Gradient Overlays */}
        <div className={`absolute inset-0 ${styles.heroGradientOverlay}`} />
        <div
          className={`absolute inset-0 ${styles.heroGradientOverlayBottom}`}
        />
        <div className={`absolute inset-0 ${styles.heroRadialOverlay}`} />

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPC9zdmc+')] opacity-15" />
      </motion.div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16 min-h-[85vh] items-center py-8 lg:py-16">
          {/* Hero Content - Left Side */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ rotateX, rotateY }}
            className={`lg:col-span-2 space-y-6 lg:space-y-8 ${styles.contentGlow}`}
          >
            {/* Enhanced Category Pill */}
            {heroData.categories.length > 0 && (
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className={`inline-block ${styles.floatingElement}`}
              >
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-primary ${styles.categoryPill}`}
                >
                  <FaEye className="mr-2 text-xs" />
                  {heroData.categories[0].name}
                </span>
              </motion.div>
            )}

            {/* Enhanced Hero Title */}
            <motion.h1
              variants={itemVariants}
              className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight ${styles.heroTitle}`}
            >
              {heroData.title}
            </motion.h1>

            {/* Enhanced Excerpt/Dek */}
            <motion.p
              variants={itemVariants}
              className={`text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl ${styles.heroExcerpt}`}
            >
              {heroData.excerpt}
            </motion.p>

            {/* Meta Information */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-gray-400"
            >
              {/* Author */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                <FaUser className="text-primary" />
                <span className="font-medium">{heroData.author.name}</span>
              </div>

              {/* Enhanced Reading Time Chip */}
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full ${styles.readingTimeChip}`}
              >
                <FaClock className="text-primary" />
                <span className="font-medium">{readingTime}</span>
              </div>

              {/* Date */}
              {heroData.createdAt && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
                  <span className="text-gray-300 font-medium">
                    {moment(heroData.createdAt).format("MMM DD, YYYY")}
                  </span>
                </div>
              )}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <Link href={`/post/${heroData.slug}`}>
                <motion.button
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-full group ${styles.ctaButton}`}
                >
                  <span>Read Full Article</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Auxiliary Posts - Right Side / Bottom on Mobile */}
          {auxiliaryPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`lg:col-span-1 ${styles.auxiliaryPostsContainer}`}
            >
              <div className="mb-6 lg:mb-8">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                  Next Up
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full shadow-lg shadow-primary/30" />
              </div>

              {/* Mobile: Horizontal scroll, Desktop: Vertical stack */}
              <div className="lg:space-y-4 lg:block">
                {/* Mobile horizontal scroll container */}
                <div className="lg:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                  {auxiliaryPosts.map((post, index) => {
                    const auxData = getPostData(post);
                    return (
                      <motion.div
                        key={auxData.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                        className="flex-shrink-0 w-80 snap-start"
                      >
                        <Link href={`/post/${auxData.slug}`}>
                          <article
                            className={`group rounded-xl p-4 cursor-pointer ${styles.glassCard} h-full`}
                          >
                            <div className="flex gap-4 h-full">
                              {/* Mobile optimized image */}
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/30 transition-all duration-300">
                                <OptimizedImage
                                  src={auxData.featuredImage}
                                  alt={auxData.title}
                                  width={80}
                                  height={80}
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                  fallbackSrc={DEFAULT_FEATURED_IMAGE}
                                />
                              </div>

                              {/* Mobile optimized content */}
                              <div className="flex-1 min-w-0 flex flex-col">
                                {auxData.categories.length > 0 && (
                                  <div className="mb-2">
                                    <span className="text-xs text-primary font-medium uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-md">
                                      {auxData.categories[0].name}
                                    </span>
                                  </div>
                                )}

                                <h4 className="text-white font-semibold text-base leading-tight line-clamp-3 group-hover:text-primary transition-colors duration-300 mb-2 flex-grow">
                                  {auxData.title}
                                </h4>

                                <div className="flex items-center text-xs text-gray-400 mt-auto">
                                  <FaClock className="mr-1" />
                                  <span>
                                    {calculateReadingTime(
                                      auxData.content,
                                      auxData.title,
                                      auxData.excerpt
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </article>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Desktop vertical layout */}
                <div className="hidden lg:block space-y-6">
                  {auxiliaryPosts.map((post, index) => {
                    const auxData = getPostData(post);
                    return (
                      <motion.div
                        key={auxData.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                      >
                        <Link href={`/post/${auxData.slug}`}>
                          <article
                            className={`group rounded-xl p-5 cursor-pointer ${styles.glassCard}`}
                          >
                            <div className="flex gap-4">
                              {/* Desktop Mini Image */}
                              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ring-2 ring-white/10 group-hover:ring-primary/30 transition-all duration-300">
                                <OptimizedImage
                                  src={auxData.featuredImage}
                                  alt={auxData.title}
                                  width={80}
                                  height={80}
                                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                                  fallbackSrc={DEFAULT_FEATURED_IMAGE}
                                />
                              </div>

                              {/* Desktop Content */}
                              <div className="flex-1 min-w-0 flex flex-col">
                                {/* Category */}
                                {auxData.categories.length > 0 && (
                                  <div className="mb-2">
                                    <span className="text-xs text-primary font-medium uppercase tracking-wider bg-primary/10 px-2 py-1 rounded-md">
                                      {auxData.categories[0].name}
                                    </span>
                                  </div>
                                )}

                                {/* Title */}
                                <h4 className="text-white font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 mb-2 flex-grow">
                                  {auxData.title}
                                </h4>

                                {/* Reading time */}
                                <div className="flex items-center text-xs text-gray-400 mt-auto">
                                  <FaClock className="mr-1" />
                                  <span>
                                    {calculateReadingTime(
                                      auxData.content,
                                      auxData.title,
                                      auxData.excerpt
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </article>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Enhanced Scroll Indicator - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden lg:block ${styles.scrollIndicator}`}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center backdrop-blur-sm bg-white/5"
        >
          <motion.div
            animate={{ y: [0, 12, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
          />
        </motion.div>
        <div className="text-center mt-2">
          <span className="text-xs text-white/60 font-medium">Scroll</span>
        </div>
      </motion.div>

      {/* Mobile-specific swipe indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 lg:hidden"
      >
        <div className="text-center">
          <div className="w-12 h-1 bg-white/40 rounded-full mb-2 mx-auto"></div>
          <span className="text-xs text-white/60 font-medium">Swipe up</span>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSpotlight;
