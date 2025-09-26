import React from "react";
import moment from "moment";
import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import {
  FaCalendarAlt,
  FaBookmark,
  FaArrowRight,
  FaClock,
  FaEye,
  FaHeart,
} from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";

const EnhancedFeaturedPostCard = ({
  post = {},
  index = 0,
  variant = "default",
}) => {
  // Ensure post has all required properties with defaults
  const safePost = {
    slug: post.slug || "post",
    title: post.title || "Untitled Post",
    excerpt:
      post.excerpt || "Discover amazing content in this featured article.",
    createdAt: post.createdAt || null,
    featuredImage: post.featuredImage || { url: DEFAULT_FEATURED_IMAGE },
    categories: post.categories || [],
    author: post.author || {
      name: "Anonymous",
      photo: { url: DEFAULT_FEATURED_IMAGE },
    },
  };

  // Calculate reading time
  const calculateReadingTime = (content) => {
    if (!content) return "5 min read";
    const words =
      typeof content === "string" ? content.split(/\s+/).length : 250;
    return `${Math.ceil(words / 200)} min read`;
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const imageVariants = {
    hover: { scale: 1.08 },
    tap: { scale: 0.98 },
  };

  // Variant styles
  const variantStyles = {
    default: {
      container:
        "group relative h-96 sm:h-[28rem] lg:h-96 rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer",
      imageHeight: "h-3/5",
      contentPadding: "p-6",
    },
    compact: {
      container:
        "group relative h-80 sm:h-84 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-400 cursor-pointer",
      imageHeight: "h-2/3",
      contentPadding: "p-5",
    },
    large: {
      container:
        "group relative h-[32rem] sm:h-[36rem] lg:h-[32rem] rounded-3xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all duration-600 cursor-pointer",
      imageHeight: "h-3/5",
      contentPadding: "p-8",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/post/${safePost.slug}`}>
        <article className={currentVariant.container}>
          {/* Enhanced Image Container */}
          <div
            className={`relative w-full ${currentVariant.imageHeight} overflow-hidden`}
          >
            <motion.div
              variants={imageVariants}
              whileHover="hover"
              whileTap="tap"
              className="w-full h-full"
            >
              <OptimizedImage
                src={safePost.featuredImage.url || DEFAULT_FEATURED_IMAGE}
                alt={safePost.title || "Featured post"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-all duration-700 ease-out"
                priority={index < 3}
                quality={90}
                fallbackSrc={DEFAULT_FEATURED_IMAGE}
                showSkeleton={true}
                aspectRatio="16/10"
              />
            </motion.div>

            {/* Enhanced overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Featured Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="absolute top-4 left-4 bg-gradient-to-r from-primary to-primary-light text-white text-xs px-3 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg backdrop-blur-sm"
            >
              <FaBookmark className="text-xs" />
              FEATURED
            </motion.div>

            {/* Categories */}
            {safePost.categories && safePost.categories.length > 0 && (
              <div className="absolute top-4 right-4 flex gap-2">
                {safePost.categories.slice(0, 2).map((category, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 + idx * 0.1 }}
                    className="bg-black/70 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm border border-white/20"
                  >
                    {category.name}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Hover overlay with quick actions */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.div
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                className="bg-white/90 backdrop-blur-sm text-gray-900 p-3 rounded-full shadow-lg"
              >
                <FaArrowRight className="text-lg" />
              </motion.div>
            </div>

            {/* Reading stats overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                <FaClock />
                <span>{calculateReadingTime(safePost.excerpt)}</span>
              </div>
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                <FaEye />
                <span>{Math.floor(Math.random() * 1000) + 100}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Content Section */}
          <div
            className={`${currentVariant.contentPadding} h-2/5 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50 group-hover:from-gray-50 group-hover:to-white transition-colors duration-300`}
          >
            {/* Title and Excerpt */}
            <div className="flex-1">
              <motion.h3
                className="font-bold text-gray-900 text-lg sm:text-xl line-clamp-2 mb-3 group-hover:text-primary transition-colors duration-300 leading-tight"
                whileHover={{ scale: 1.02 }}
              >
                {safePost.title}
              </motion.h3>

              {safePost.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {safePost.excerpt}
                </p>
              )}
            </div>

            {/* Bottom Section with Author and Date */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                {safePost.author?.photo?.url && (
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-primary/30 transition-all duration-300">
                    <OptimizedImage
                      src={safePost.author.photo.url}
                      alt={safePost.author.name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                      fallbackSrc={DEFAULT_FEATURED_IMAGE}
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-900 group-hover:text-primary transition-colors duration-300">
                    {safePost.author?.name}
                  </span>
                  {safePost.createdAt && (
                    <span className="text-xs text-gray-500">
                      {moment(safePost.createdAt).format("MMM DD, YYYY")}
                    </span>
                  )}
                </div>
              </div>

              {/* Read More Indicator */}
              <motion.div
                className="text-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
                whileHover={{ x: 3 }}
              >
                <FaArrowRight className="text-sm" />
              </motion.div>
            </div>
          </div>

          {/* Subtle border highlight */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300" />
        </article>
      </Link>
    </motion.div>
  );
};

export default EnhancedFeaturedPostCard;
