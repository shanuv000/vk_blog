import React from "react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_AVATAR, DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FaUser, FaCalendarAlt, FaBookmark } from "react-icons/fa";
import { motion } from "framer-motion";

const FeaturedPostCard = ({ post = {} }) => {
  // Ensure post has all required properties with defaults
  const safePost = {
    slug: post.slug || "post",
    title: post.title || "Untitled Post",
    createdAt: post.createdAt || null,
    featuredImage: post.featuredImage || { url: DEFAULT_FEATURED_IMAGE },
    author: post.author || {
      name: "Anonymous",
      photo: { url: DEFAULT_AVATAR },
    },
    categories: post.categories || [],
  };

  return (
    <motion.div
      className="relative h-80 sm:h-96"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div
        className="absolute rounded-lg shadow-lg inline-block w-full h-full overflow-hidden"
        whileHover={{
          boxShadow: "0 25px 50px -12px rgba(229, 9, 20, 0.3)",
          borderColor: "rgba(229, 9, 20, 0.5)",
        }}
        style={{ border: "1px solid transparent" }}
      >
        <Image
          src={safePost.featuredImage.url || DEFAULT_FEATURED_IMAGE}
          alt={safePost.title || "Featured post"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover"
          priority={true}
          loading="eager"
          fetchPriority="high"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
          style={{ width: "100%", height: "100%" }}
          onError={() => {
            console.log(
              "Image load error in FeaturedPostCard, using local fallback"
            );
            // Next.js Image component handles errors automatically, but we can log them
            // The component will use the fallback image defined in DEFAULT_FEATURED_IMAGE
          }}
        />
      </motion.div>

      {/* Enhanced gradient overlay for better text readability */}
      <div className="absolute rounded-lg bg-center bg-gradient-to-b from-transparent via-secondary/80 to-secondary w-full h-full" />

      {/* Content */}
      <motion.div
        className="flex flex-col rounded-lg p-6 items-center justify-end absolute w-full h-full"
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.15)" }}
      >
        {/* Featured badge - redesigned */}
        <motion.div
          className="absolute top-4 left-4 bg-gradient-to-r from-primary to-urtechy-orange text-white text-xs px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5"
          whileHover={{ scale: 1.05 }}
        >
          <FaBookmark className="text-xs" />
          <span className="font-medium">Featured</span>
        </motion.div>

        {/* Categories if available */}
        {safePost.categories && safePost.categories.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
            {safePost.categories.slice(0, 2).map((category, index) => (
              <motion.span
                key={index}
                className="bg-secondary-light/80 text-text-primary text-xs px-2.5 py-1 rounded-full backdrop-blur-sm"
                whileHover={{ backgroundColor: "rgba(31, 31, 31, 0.9)" }}
              >
                {category.name}
              </motion.span>
            ))}
          </div>
        )}

        {/* Date with icon */}
        <motion.div
          className="text-text-primary mb-2 text-shadow text-sm flex items-center gap-1.5"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <FaCalendarAlt className="text-primary-light" />
          <span suppressHydrationWarning>
            {safePost.createdAt
              ? moment(safePost.createdAt).format("MMM DD, YYYY")
              : "No date"}
          </span>
        </motion.div>

        {/* Title - enhanced with better typography */}
        <motion.h3
          className="text-white mb-4 text-shadow font-heading font-bold text-xl sm:text-2xl md:text-3xl text-center leading-tight"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {safePost.title || "Untitled Post"}
        </motion.h3>

        {/* Author with enhanced styling */}
        <motion.div
          className="flex items-center justify-center bg-secondary-light/50 px-3 py-1.5 rounded-full backdrop-blur-sm"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ backgroundColor: "rgba(31, 31, 31, 0.7)" }}
        >
          {safePost.author?.photo?.url ? (
            <Image
              alt={safePost.author.name || "Author"}
              height={36}
              width={36}
              className="rounded-full border-2 border-primary"
              src={safePost.author.photo.url}
              style={{ width: "36px", height: "36px" }}
              onError={() => {
                console.log(
                  "Author image load error in FeaturedPostCard, using fallback"
                );
                // Next.js Image component will use the fallback defined in next.config.js
              }}
            />
          ) : (
            <div className="flex items-center justify-center bg-secondary-light rounded-full h-[36px] w-[36px] border-2 border-primary">
              <FaUser className="text-text-secondary" size={16} />
            </div>
          )}
          <p className="inline align-middle text-white text-shadow ml-2 font-medium">
            {safePost.author?.name || "Anonymous"}
          </p>
        </motion.div>

        {/* Enhanced Read more button */}
        <motion.div
          className="mt-4 w-full flex justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.span
            className="inline-block bg-gradient-to-r from-primary to-urtechy-orange text-white px-5 py-2.5 rounded-md font-medium text-sm shadow-lg"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(229, 9, 20, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Read Article
          </motion.span>
        </motion.div>
      </motion.div>

      <Link href={`/post/${safePost.slug}`}>
        <span className="cursor-pointer absolute w-full h-full" />
      </Link>
    </motion.div>
  );
};

export default FeaturedPostCard;
