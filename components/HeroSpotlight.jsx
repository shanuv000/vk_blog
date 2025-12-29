import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  FaArrowRight,
  FaClock,
  FaUser,
  FaEye,
  FaExclamationTriangle,
} from "react-icons/fa";

import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import HeroSpotlightSkeleton from "./HeroSpotlightSkeleton";
import OptimizedImage from "./OptimizedImage";
import { IMAGE_CONFIGS, getOptimizedImageUrl } from "../lib/image-config";
import { formatDate } from "../lib/date-utils";
import styles from "../styles/HeroSpotlight.module.css";

// Calculate reading time with better accuracy
const calculateReadingTime = (content, title = "", excerpt = "") => {
  if (!content && !title && !excerpt) {return "5 min read";}

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
    if (!containerRef.current) {return;}
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
      className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden ${styles.minimalistHero}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0);
        mouseY.set(0);
      }}
    >
      {/* Minimalist Background - Subtle Image with Clean Overlay */}
      <motion.div
        style={{ opacity }}
        className={`absolute inset-0 z-0 ${styles.minimalistBackground}`}
      >
        <OptimizedImage
          src={getOptimizedImageUrl(heroData.featuredImage, "hero")}
          alt={heroData.title}
          fill
          className="object-cover"
          {...IMAGE_CONFIGS.hero}
          fallbackSrc={DEFAULT_FEATURED_IMAGE}
        />
        {/* Clean minimalist overlay */}
        <div className={`absolute inset-0 ${styles.minimalistOverlay}`} />
      </motion.div>

      {/* Minimalist Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 min-h-[90vh] items-center justify-center py-16 lg:py-20">
          {/* Hero Content - Clean & Focused */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-3xl space-y-8"
          >
            {/* Minimalist Category Badge */}
            {heroData.categories.length > 0 && (
              <motion.div variants={itemVariants}>
                <span className={`${styles.minimalistBadge}`}>
                  {heroData.categories[0].name}
                </span>
              </motion.div>
            )}

            {/* Clean Hero Title - Maximum Readability */}
            <motion.h1
              variants={itemVariants}
              className={`${styles.minimalistTitle}`}
              title={heroData.title} // Tooltip for full title on hover
            >
              {heroData.title}
            </motion.h1>

            {/* Clean Excerpt */}
            <motion.p
              variants={itemVariants}
              className={`${styles.minimalistExcerpt}`}
            >
              {heroData.excerpt}
            </motion.p>

            {/* Minimal Meta Information */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-6 pt-2"
            >
              {/* Author */}
              <div className={`${styles.metaItem}`}>
                <FaUser className="text-primary w-4 h-4" />
                <span>{heroData.author.name}</span>
              </div>

              {/* Reading Time */}
              <div className={`${styles.metaItem}`}>
                <FaClock className="text-primary w-4 h-4" />
                <span>{readingTime}</span>
              </div>

              {/* Date */}
              {heroData.createdAt && (
                <div className={`${styles.metaItem}`}>
                  <span>
                    {formatDate(heroData.createdAt)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Clean CTA Button */}
            <motion.div variants={itemVariants} className="pt-6">
              <Link href={`/post/${heroData.slug}`}>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${styles.minimalistCTA} group`}
                >
                  <span>Read Article</span>
                  <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Minimalist Auxiliary Posts */}
          {auxiliaryPosts.length > 0 && (
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="w-full lg:w-80 flex-shrink-0"
            >
              <div className="mb-8">
                <h3 className={`${styles.auxiliaryHeading}`}>
                  Continue Reading
                </h3>
              </div>

              {/* Clean Stack Layout */}
              <div className="space-y-4">
                {auxiliaryPosts.map((post, index) => {
                  const auxData = getPostData(post);
                  return (
                    <motion.div
                      key={auxData.slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    >
                      <Link href={`/post/${auxData.slug}`}>
                        <article className={`${styles.minimalistCard} group`}>
                          <div className="flex gap-4 items-start">
                            {/* Clean Image - Fixed Aspect Ratio */}
                            <OptimizedImage
                              src={auxData.featuredImage}
                              alt={auxData.title}
                              fill
                              sizes="80px"
                              containerClassName={`${styles.minimalistImageWrapper}`}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              fallbackSrc={DEFAULT_FEATURED_IMAGE}
                            />

                            {/* Clean Content */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                              {/* Category Tag */}
                              {auxData.categories.length > 0 && (
                                <span className={`${styles.minimalistTag}`}>
                                  {auxData.categories[0].name}
                                </span>
                              )}

                              {/* Title with tooltip for long text */}
                              <h4
                                className={`${styles.auxiliaryTitle}`}
                                title={auxData.title} // Full title on hover
                              >
                                {auxData.title}
                              </h4>

                              {/* Reading time */}
                              <div className={`${styles.auxiliaryMeta}`}>
                                <FaClock className="w-3 h-3 flex-shrink-0" />
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
            </motion.aside>
          )}
        </div>
      </div>

      {/* Minimalist Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className={`${styles.minimalistScrollIndicator}`}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-transparent via-white/40 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default HeroSpotlight;
