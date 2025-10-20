import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import moment from "moment";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";


const AdjacentPostCard = ({ post, position }) => (
  <>
    <motion.div
      className="absolute rounded-lg bg-center bg-no-repeat bg-cover shadow-md inline-block w-full h-72"
      style={{
        backgroundImage: `url('${
          post.featuredImage?.url || DEFAULT_FEATURED_IMAGE
        }')`,
      }}
      initial={{
        opacity: 0,
        x: position === "LEFT" ? -50 : 50,
      }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    />
    <motion.div
      className="absolute rounded-lg bg-center bg-gradient-to-b opacity-50 from-gray-400 via-gray-700 to-black w-full h-72"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />
    <motion.div
      className="flex flex-col rounded-lg p-4 items-center justify-center absolute w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.p
        className="text-white text-shadow font-semibold text-xs"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        suppressHydrationWarning
      >
        {post.createdAt
          ? moment(post.createdAt).format("MMM DD, YYYY")
          : "No date"}
      </motion.p>
      <motion.p
        className="text-white text-shadow font-semibold text-2xl text-center"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        {post.title || "Untitled Post"}
      </motion.p>
    </motion.div>
    <Link href={`/post/${post.slug}`}>
      <span className="z-10 cursor-pointer absolute w-full h-full" />
    </Link>
    {position === "LEFT" && (
      <motion.div
        className="absolute arrow-btn bottom-5 text-center py-3 cursor-pointer bg-pink-600 left-4 rounded-full"
        whileHover={{
          scale: 1.1,
          backgroundColor: "#ec4899",
          boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.3)",
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </motion.div>
    )}
    {position === "RIGHT" && (
      <motion.div
        className="absolute arrow-btn bottom-5 text-center py-3 cursor-pointer bg-pink-600 right-4 rounded-full"
        whileHover={{
          scale: 1.1,
          backgroundColor: "#ec4899",
          boxShadow: "0 10px 15px -3px rgba(236, 72, 153, 0.3)",
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </motion.div>
    )}
  </>
);

export default AdjacentPostCard;
