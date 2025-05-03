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
      className="relative h-72"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.03 }}
    >
      <motion.div
        className="absolute rounded-lg shadow-md inline-block w-full h-72 overflow-hidden"
        whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
      >
        <Image
          src={safePost.featuredImage.url || DEFAULT_FEATURED_IMAGE}
          alt={safePost.title || "Featured post"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover"
          priority={true}
          quality={75}
          style={{ width: "100%", height: "100%" }} // Set both width and height to fix the warning
        />
      </motion.div>
      <div className="absolute rounded-lg bg-center bg-gradient-to-b opacity-50 from-gray-400 via-gray-700 to-black w-full h-72" />
      <motion.div
        className="flex flex-col rounded-lg p-4 items-center justify-center absolute w-full h-full"
        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
      >
        <motion.p
          className="text-white mb-4 text-shadow font-semibold text-xs"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {safePost.createdAt
            ? moment(safePost.createdAt).format("MMM DD, YYYY")
            : "No date"}
        </motion.p>
        <motion.p
          className="text-white mb-4 text-shadow font-semibold text-2xl text-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {safePost.title || "Untitled Post"}
        </motion.p>
        <motion.div
          className="flex items-center absolute bottom-5 w-full justify-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {safePost.author?.photo?.url ? (
            <Image
              alt={safePost.author.name || "Author"}
              height={30}
              width={30}
              className="align-middle drop-shadow-lg rounded-full"
              src={safePost.author.photo.url}
              style={{ width: "30px", height: "30px" }} // Set both width and height to fix the warning
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-200 rounded-full h-[30px] w-[30px]">
              <FaUser className="text-gray-500" size={16} />
            </div>
          )}
          <p className="inline align-middle text-white text-shadow ml-2 font-medium">
            {safePost.author?.name || "Anonymous"}
          </p>
        </motion.div>
      </motion.div>
      <Link href={`/post/${safePost.slug}`}>
        <span className="cursor-pointer absolute w-full h-full" />
      </Link>
    </motion.div>
  );
};

export default FeaturedPostCard;
