import React from "react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { DEFAULT_AVATAR, DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import { FaUser } from "react-icons/fa";
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
  };

  return (
    <motion.div
      className="relative h-80 sm:h-96"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute rounded-lg shadow-lg inline-block w-full h-full overflow-hidden"
        whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
      >
        <Image
          src={safePost.featuredImage.url || DEFAULT_FEATURED_IMAGE}
          alt={safePost.title || "Featured post"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover"
          priority={true}
          quality={85}
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute rounded-lg bg-center bg-gradient-to-b from-transparent via-secondary/70 to-secondary w-full h-full" />

      {/* Content */}
      <motion.div
        className="flex flex-col rounded-lg p-6 items-center justify-end absolute w-full h-full"
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
      >
        {/* Featured badge */}
        <div className="absolute top-4 left-4 bg-primary text-white text-xs px-3 py-1 rounded-full shadow-md">
          Featured
        </div>

        {/* Date */}
        <motion.p
          className="text-text-primary mb-2 text-shadow text-sm"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {safePost.createdAt
            ? moment(safePost.createdAt).format("MMM DD, YYYY")
            : "No date"}
        </motion.p>

        {/* Title */}
        <motion.h3
          className="text-white mb-4 text-shadow font-heading font-bold text-xl sm:text-2xl md:text-3xl text-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {safePost.title || "Untitled Post"}
        </motion.h3>

        {/* Author */}
        <motion.div
          className="flex items-center w-full justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {safePost.author?.photo?.url ? (
            <Image
              alt={safePost.author.name || "Author"}
              height={36}
              width={36}
              className="rounded-full border-2 border-primary"
              src={safePost.author.photo.url}
              style={{ width: "36px", height: "36px" }}
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

        {/* Read more button */}
        <motion.div
          className="mt-4 w-full flex justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.span
            className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium text-sm"
            whileHover={{
              scale: 1.05,
              backgroundColor: "#B81D24",
              boxShadow: "0 10px 15px -3px rgba(229, 9, 20, 0.3)",
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
