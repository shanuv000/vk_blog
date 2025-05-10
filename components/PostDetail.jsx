import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { motion, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Social_post_details";

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
          className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden w-full"
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

          <div className="relative overflow-hidden mb-6 w-full">
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
                    quality={85} // Slightly higher quality for featured images
                    onError={() => {
                      // This will be called if Next.js Image fails to load
                      console.error(
                        "Failed to load image:",
                        post.featuredImage.url
                      );
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
                    quality={85} // Slightly higher quality for featured images
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>

              {/* Title overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 w-full">
                <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-2 sm:mb-4 capitalize leading-tight tracking-tight">
                  {post.title}
                </h1>

                <div className="flex items-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
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
                  <span suppressHydrationWarning>
                    {post.createdAt
                      ? moment(post.createdAt).format("DD MMM, YYYY")
                      : "No date"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="px-4 sm:px-6 lg:px-10 pb-10 w-full">
            {/* Wrap Testing component in ErrorBoundary to prevent it from crashing the entire page */}
            <ErrorBoundary>
              {post.slug && <Testing slug={post.slug} />}
            </ErrorBoundary>

            <div className="prose prose-lg w-full max-w-none mt-8 text-gray-800 mx-auto sm:w-full md:w-full md:max-w-none lg:max-w-4xl">
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
                        <div className="article-content w-full">
                          {/* Reading time estimate */}
                          <div className="text-gray-500 text-sm mb-6 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
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
                            {Math.ceil(
                              post.content.raw?.toString().split(" ").length /
                                200
                            ) || 5}{" "}
                            min read
                          </div>

                          {/* First paragraph with drop cap styling */}
                          <div className="first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:text-primary first-letter:mr-1 first-letter:float-left w-full">
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
                          {process.env.NODE_ENV === "development" && (
                            <p className="text-xs text-red-500 mt-2">
                              Error: {error.message}
                            </p>
                          )}
                        </div>
                      );
                    }
                  })()}

                  {/* Add debug information in development */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md text-xs">
                      <details>
                        <summary className="cursor-pointer font-medium text-gray-700">
                          Debug Information
                        </summary>
                        <div className="mt-2 overflow-auto max-h-40">
                          <p>
                            Content Format:{" "}
                            {post.content.json
                              ? "JSON"
                              : post.content.raw
                              ? "RAW"
                              : "Unknown"}
                          </p>
                          <p>
                            References:{" "}
                            {post.content.references
                              ? post.content.references.length
                              : "None"}
                          </p>
                          <p>Post ID: {post.slug}</p>
                        </div>
                      </details>
                    </div>
                  )}
                </ErrorBoundary>
              ) : (
                <p className="text-center text-lg text-gray-500 font-normal">
                  No content available for this post.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </ErrorBoundary>
  );
};

export default PostDetail;
