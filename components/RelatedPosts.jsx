import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import OptimizedImage from "./OptimizedImage";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";

/**
 * Related Posts Component
 * Displays posts from the same category at the end of an article
 */
const RelatedPosts = ({ currentPost, posts = [], maxPosts = 3 }) => {
  // Filter related posts - same category, different slug
  const relatedPosts = posts
    .filter((post) => {
      // Don't include current post
      if (post.slug === currentPost?.slug) {
        return false;
      }
      // Check if any category matches
      const currentCategories = currentPost?.categories?.map((c) => c.slug) || [];
      const postCategories = post.categories?.map((c) => c.slug) || [];
      return postCategories.some((cat) => currentCategories.includes(cat));
    })
    .slice(0, maxPosts);

  // If no related posts by category, show recent posts
  const displayPosts = relatedPosts.length > 0 
    ? relatedPosts 
    : posts.filter((p) => p.slug !== currentPost?.slug).slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-10 border-t border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-heading font-bold text-gray-900">
          You might also like
        </h3>
        <Link
          href="/"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1 group"
        >
          View all
          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayPosts.map((post, index) => (
          <RelatedPostCard key={post.slug} post={post} index={index} />
        ))}
      </div>
    </section>
  );
};

/**
 * Related Post Card Component
 */
const RelatedPostCard = ({ post, index }) => {
  const imageUrl = post.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const category = post.categories?.[0]?.name || "Article";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/post/${post.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gray-100">
          <OptimizedImage
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <h4 className="font-heading font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {post.title}
        </h4>
        
        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>
    </motion.article>
  );
};

export default RelatedPosts;
