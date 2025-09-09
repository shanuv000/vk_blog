import React from "react";
import Image from "next/image";
import moment from "moment";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { DEFAULT_AVATAR, DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const PostCard = ({ post = {} }) => {
  // Ensure post has all required properties with defaults
  const safePost = {
    slug: post.slug || "post",
    title: post.title || "Untitled Post",
    excerpt: post.excerpt || "Read this article to learn more...",
    createdAt: post.createdAt || null,
    publishedAt: post.publishedAt || null,
    featuredImage: post.featuredImage || { url: DEFAULT_FEATURED_IMAGE },
    author: post.author || {
      name: "Anonymous",
      photo: { url: DEFAULT_AVATAR },
    },
  };

  return (
    <motion.div
      className="bg-secondary rounded-lg overflow-hidden shadow-lg mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        y: -5,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        transition: { duration: 0.3 },
      }}
    >
      <div className="relative overflow-hidden">
        {safePost.featuredImage?.url ? (
          <Link href={`/post/${safePost.slug}`}>
            <motion.div
              className="w-full aspect-[16/9]"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={safePost.featuredImage.url}
                alt={safePost.title || "Featured image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={75}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4="
                onError={() => {
                  console.log(
                    "Image load error in PostCard, using local fallback"
                  );
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-50"></div>
            </motion.div>
          </Link>
        ) : (
          <div className="w-full aspect-[16/9] bg-secondary-light flex items-center justify-center">
            <p className="text-text-secondary">No image available</p>
          </div>
        )}

        {/* Date badge */}
        <div className="absolute top-4 right-4 bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md flex items-center">
          <FaCalendarAlt className="mr-1" size={12} />
          <span suppressHydrationWarning>
            {safePost.createdAt
              ? moment(safePost.createdAt).format("MMM DD, YYYY")
              : safePost.publishedAt
              ? moment(safePost.publishedAt).format("MMM DD, YYYY")
              : "No date"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <Link href={`/post/${safePost.slug}`}>
          <motion.h2
            className="text-xl md:text-2xl font-heading font-semibold mb-4 text-text-primary hover:text-primary transition-colors duration-200"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            {safePost.title}
          </motion.h2>
        </Link>

        <p className="text-text-secondary mb-6 line-clamp-3">
          {safePost.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {safePost.author?.photo?.url ? (
              <Image
                alt={safePost.author.name || "Author"}
                height={36}
                width={36}
                className="rounded-full border-2 border-primary"
                src={safePost.author.photo.url}
                onError={() => {
                  console.log(
                    "Author image load error in PostCard, using fallback"
                  );
                  // Next.js Image component will use the fallback defined in next.config.js
                }}
              />
            ) : (
              <div className="flex items-center justify-center bg-secondary-light rounded-full h-[36px] w-[36px] border-2 border-primary">
                <FaUser className="text-text-secondary" size={16} />
              </div>
            )}
            <p className="ml-2 text-text-secondary font-medium">
              {safePost.author?.name || "Anonymous"}
            </p>
          </div>

          <Link href={`/post/${safePost.slug}`}>
            <motion.span
              className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium text-sm"
              whileHover={{
                scale: 1.05,
                backgroundColor: "#B81D24",
                boxShadow: "0 10px 15px -3px rgba(229, 9, 20, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Read More
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
