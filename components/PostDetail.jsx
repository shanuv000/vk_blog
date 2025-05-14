import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { motion, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Social_post_details";

// Lazy load Comments component to improve initial page load performance
const Comments = dynamic(() => import("./Comments"), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-20 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  ),
  ssr: false, // Don't render on server to avoid hydration issues
});

// Lazy load SocialMediaEmbedder component
const SocialMediaEmbedder = dynamic(() => import("./SocialMediaEmbedder"), {
  ssr: false, // Don't render on server to avoid hydration issues
});

import { useData } from "../store/HandleApiContext";
import ErrorBoundary from "./ErrorBoundary";
import RichTextRenderer from "./RichTextRenderer";
import {
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_FEATURED_IMAGE,
} from "./DefaultAvatar";

// Import Testing component with no SSR to avoid hydration issues
const Testing = dynamic(
  () => import("./AdditionalPosts/PostsAdditions").then((mod) => mod.Testing),
  {
    ssr: false,
  }
);

const PostDetail = ({ post }) => {
  const { data, fetchData } = useData();
  const hasFetchedData = useRef(true);
  // Add error state to track rendering errors
  const [renderError, setRenderError] = useState(null);

  // Enhanced error boundary for content rendering
  useEffect(() => {
    if (post) {
      // Check if content exists
      if (!post.content) {
        setRenderError("No content available");
        return;
      }

      // Clear any previous render errors
      setRenderError(null);
    }
  }, [post]);

  // Get data from Context
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (hasFetchedData.current == false && data == null) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Show detailed error information if there's a rendering error
  if (renderError) {
    return (
      <div className="bg-secondary rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-red-500 mb-4">
          Error Rendering Post
        </h2>
        <p className="mb-4">{renderError}</p>
        <p className="text-sm text-gray-500">
          Post ID: {post?.slug || "unknown"}
          <br />
          Title: {post?.title || "unknown"}
        </p>
      </div>
    );
  }

  // If post is null, show a friendly error message
  if (!post) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Post Not Found
        </h2>
        <p className="mb-4 text-gray-600 leading-relaxed">
          Sorry, we couldn't find the post you're looking for. It may have been
          removed or is temporarily unavailable.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <motion.div
          className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-lg mb-8 overflow-hidden w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
            style={{ scaleX }}
          />
          {/* Seo */}
          <HeadPostDetails post={post} />
          {/* Seo */}

          {/* Featured Image - No overlay */}
          <div className="relative overflow-hidden w-full">
            <motion.div className="w-full aspect-video relative">
              <div className="relative w-full h-full">
                {post.featuredImage?.url ? (
                  <Image
                    src={post.featuredImage.url}
                    alt={post.title || "Post image"}
                    fill
                    priority={true} // Explicitly mark as priority for LCP
                    loading="eager" // Force eager loading for LCP image
                    fetchPriority="high" // Use the fetchPriority attribute
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    quality={75} // Reduced quality for better performance
                    onError={() => {
                      // Silent error handling for production
                    }}
                  />
                ) : (
                  // Fallback for when no image URL is available
                  <Image
                    src={DEFAULT_FEATURED_IMAGE}
                    alt={post.title || "Post image"}
                    fill
                    priority={true} // Explicitly mark as priority for LCP
                    loading="eager" // Force eager loading for LCP image
                    fetchPriority="high" // Use the fetchPriority attribute
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    quality={75} // Reduced quality for better performance
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Title and date section - Separated from image - Optimized for mobile */}
          <div className="px-0 md:px-10 py-4 md:py-6 mb-2 w-full border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-3 md:mb-4 capitalize leading-tight tracking-tight px-3 md:px-0">
              {post.title}
            </h1>

            <div className="flex items-center text-gray-600 px-3 md:px-0 pb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span suppressHydrationWarning className="text-sm md:text-base">
                {post.createdAt
                  ? moment(post.createdAt).format("DD MMM, YYYY")
                  : "No date"}
              </span>
            </div>
          </div>

          <div className="px-0 md:px-6 lg:px-10 pt-4 pb-10 w-full">
            {/* Wrap Testing component in ErrorBoundary to prevent it from crashing the entire page */}
            <ErrorBoundary>
              {post.slug && <Testing slug={post.slug} />}
            </ErrorBoundary>

            <div className="prose prose-lg w-full max-w-none mt-4 sm:mt-8 text-gray-800 mx-auto px-3 md:px-0 sm:w-full md:w-full md:max-w-none lg:max-w-4xl">
              {post.content ? (
                <ErrorBoundary
                  fallback={
                    <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                      <h3 className="text-red-600 font-medium">
                        Error displaying content
                      </h3>
                      <p className="text-gray-700 mt-2">
                        We're having trouble displaying this content. Please try
                        refreshing the page.
                      </p>
                    </div>
                  }
                >
                  {/* Wrap RichTextRenderer in a try-catch block for additional error handling */}
                  {(() => {
                    try {
                      return (
                        <div className="article-content w-full mobile-optimized-text sm:not-mobile-optimized-text">
                          {/* Reading time estimate - Optimized for mobile */}
                          <div className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 flex items-center px-0.5">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>
                              {Math.ceil(
                                post.content.raw?.toString().split(" ").length /
                                  200
                              ) || 5}{" "}
                              min read
                            </span>
                          </div>

                          {/* First paragraph with drop cap styling - optimized for mobile */}
                          <div className="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-[0.8] first-letter:mt-1 w-full prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm article-content px-0">
                            {/* Render the content first */}
                            <RichTextRenderer
                              content={post.content}
                              references={
                                post.content &&
                                Array.isArray(post.content.references)
                                  ? post.content.references
                                  : []
                              }
                            />
                          </div>

                          {/* Add SocialMediaEmbedder as a separate component outside the article-content div */}
                          <div className="social-embeds-container mt-4 sm:mt-6 w-full overflow-hidden">
                            <SocialMediaEmbedder />
                          </div>

                          {/* Article footer - removed author section */}
                          <div className="mt-12 pt-6 border-t border-gray-200"></div>

                          {/* Share section */}
                          <Navbar_post_details post={post} />
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
                          <h3 className="text-red-600 font-medium">
                            Error displaying content
                          </h3>
                          <p className="text-gray-700 mt-2">
                            We encountered an error while rendering this
                            content. Please try refreshing the page.
                          </p>
                        </div>
                      );
                    }
                  })()}
                </ErrorBoundary>
              ) : (
                <p className="text-center text-lg text-gray-500 font-normal">
                  No content available for this post.
                </p>
              )}
            </div>

            {/* Comments Section */}
            {post.slug && (
              <div className="mt-8 px-0 sm:px-0">
                <Comments postSlug={post.slug} />
              </div>
            )}
          </div>
        </motion.div>
      </>
    </ErrorBoundary>
  );
};

export default PostDetail;
