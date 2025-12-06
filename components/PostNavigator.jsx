import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

/**
 * Post Navigator Component
 * Shows previous and next post links for easy navigation
 */
const PostNavigator = ({ prevPost, nextPost }) => {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav 
      className="mt-12 pt-8 border-t border-gray-100"
      aria-label="Post navigation"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Previous Post */}
        <div className="md:pr-4">
          {prevPost ? (
            <Link href={`/post/${prevPost.slug}`} className="group block">
              <motion.div
                className="p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-gray-50/50 transition-all duration-300"
                whileHover={{ x: -4 }}
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <FaArrowLeft className="text-xs group-hover:text-primary transition-colors" />
                  <span className="font-medium uppercase tracking-wide text-xs">
                    Previous
                  </span>
                </div>
                <h4 className="font-heading font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {prevPost.title}
                </h4>
              </motion.div>
            </Link>
          ) : (
            <div className="hidden md:block" /> // Placeholder for grid alignment
          )}
        </div>

        {/* Next Post */}
        <div className="md:pl-4 md:text-right">
          {nextPost ? (
            <Link href={`/post/${nextPost.slug}`} className="group block">
              <motion.div
                className="p-5 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-gray-50/50 transition-all duration-300"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-end gap-2 text-sm text-gray-500 mb-2">
                  <span className="font-medium uppercase tracking-wide text-xs">
                    Next
                  </span>
                  <FaArrowRight className="text-xs group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-heading font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                  {nextPost.title}
                </h4>
              </motion.div>
            </Link>
          ) : (
            <div className="hidden md:block" /> // Placeholder for grid alignment
          )}
        </div>
      </div>
    </nav>
  );
};

export default PostNavigator;
