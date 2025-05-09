import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { motion, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Social_post_details";

import { useData } from "../store/HandleApiContext";
import ErrorBoundary from "./ErrorBoundary";
import RichTextRenderer from "./RichTextRenderer";
import {
  DEFAULT_AVATAR,
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_AVATAR,
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

  // Enhanced error boundary for content rendering with more detailed logging
  useEffect(() => {
    if (post) {
      console.log(`Post ${post.slug} received for rendering`);

      // Log basic post structure
      console.log(`Post structure: ${Object.keys(post).join(", ")}`);

      // Check if content exists
      if (!post.content) {
        console.error(`Post ${post.slug} has no content`);
        setRenderError("No content available");
        return;
      }

      // Log content structure
      console.log(`Content structure: ${Object.keys(post.content).join(", ")}`);

      try {
        // Safely log a sample of the content
        const contentSample =
          JSON.stringify(post.content).substring(0, 200) + "...";
        console.log(`Content sample: ${contentSample}`);
      } catch (e) {
        console.error(`Error stringifying content: ${e.message}`);
      }

      // Check for json content
      if (post.content.json) {
        console.log(
          `Post ${post.slug} has json content type:`,
          typeof post.content.json
        );

        // Try to safely inspect the json content
        try {
          if (typeof post.content.json === "object") {
            const keys = Object.keys(post.content.json);
            console.log(`JSON content keys: ${keys.join(", ")}`);

            // Check for children array which is required by RichText renderer
            if (post.content.json.children) {
              console.log(
                `Children array: ${
                  Array.isArray(post.content.json.children)
                    ? `Array with ${post.content.json.children.length} items`
                    : "Not an array"
                }`
              );
            } else {
              console.warn(`JSON content missing children array`);
            }
          } else {
            console.log(
              `JSON content is not an object but ${typeof post.content.json}`
            );
          }
        } catch (e) {
          console.error(`Error inspecting json content: ${e.message}`);
        }
      }

      // Check for raw content
      if (post.content.raw) {
        console.log(
          `Post ${post.slug} has raw content type:`,
          typeof post.content.raw
        );

        // Try to safely inspect the raw content
        try {
          if (typeof post.content.raw === "object") {
            const keys = Object.keys(post.content.raw);
            console.log(`Raw content keys: ${keys.join(", ")}`);

            // Check for children array which is required by RichText renderer
            if (post.content.raw.children) {
              console.log(
                `Children array: ${
                  Array.isArray(post.content.raw.children)
                    ? `Array with ${post.content.raw.children.length} items`
                    : "Not an array"
                }`
              );
            } else {
              console.warn(`Raw content missing children array`);
            }
          } else if (typeof post.content.raw === "string") {
            // Try to parse string content as JSON
            try {
              const parsedContent = JSON.parse(post.content.raw);
              console.log(
                `Parsed raw content keys: ${Object.keys(parsedContent).join(
                  ", "
                )}`
              );
            } catch (parseError) {
              console.log(`Raw content is a string but not valid JSON`);
            }
          } else {
            console.log(`Raw content is ${typeof post.content.raw}`);
          }
        } catch (e) {
          console.error(`Error inspecting raw content: ${e.message}`);
        }
      }

      // Check for references
      if (post.content.references) {
        console.log(
          `Post ${post.slug} has references:`,
          typeof post.content.references,
          Array.isArray(post.content.references),
          post.content.references.length || 0
        );

        // Log first reference for debugging
        if (
          Array.isArray(post.content.references) &&
          post.content.references.length > 0
        ) {
          const firstRef = post.content.references[0];
          console.log(`First reference: ${JSON.stringify(firstRef)}`);
        }
      } else {
        console.log(`Post ${post.slug} has no references`);
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
      <div className="bg-secondary rounded-lg shadow-lg p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Post Not Found</h2>
        <p className="mb-4 text-text-primary">
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
          className="bg-secondary rounded-lg shadow-lg mb-8 overflow-hidden"
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

          <div className="relative overflow-hidden mb-6">
            <motion.div className="w-full aspect-video relative">
              <motion.img
                src={post.featuredImage?.url || DEFAULT_FEATURED_IMAGE}
                alt={post.title || "Post image"}
                className="object-cover w-full h-full"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  console.log("Image load error, using local fallback");
                  // Use local fallback image instead of external placeholder
                  e.target.src = FALLBACK_FEATURED_IMAGE;
                  // If that fails too, use inline SVG as ultimate fallback
                  e.target.onerror = () => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.style.display = "none";
                    const parent = e.target.parentNode;
                    if (parent) {
                      const fallbackDiv = document.createElement("div");
                      fallbackDiv.className =
                        "w-full h-full flex items-center justify-center bg-gray-200";
                      fallbackDiv.innerHTML = `
                        <div class="text-center p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="mt-2 text-gray-600">${
                            post.title || "urTechy Blogs"
                          }</p>
                        </div>
                      `;
                      parent.appendChild(fallbackDiv);
                    }
                  };
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-60"></div>

              {/* Title overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white text-shadow mb-4 capitalize">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-white">
                  <div className="flex items-center">
                    <img
                      src={post.author?.photo?.url || DEFAULT_AVATAR}
                      alt={post.author?.name || "Author"}
                      height={40}
                      width={40}
                      className="rounded-full border-2 border-primary"
                      onError={(e) => {
                        e.target.src = FALLBACK_AVATAR;
                      }}
                    />
                    <span className="ml-2 font-medium">
                      {post.author?.name || "Anonymous"}
                    </span>
                  </div>

                  <div className="flex items-center">
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
              </div>
            </motion.div>
          </div>

          <div className="px-6 lg:px-10 pb-10">
            <Navbar_post_details post={post} />

            {/* Wrap Testing component in ErrorBoundary to prevent it from crashing the entire page */}
            <ErrorBoundary>
              {post.slug && <Testing slug={post.slug} />}
            </ErrorBoundary>

            <div className="prose prose-lg max-w-none mt-8 text-text-primary">
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
                      // Log content structure for debugging
                      console.log(`Rendering content for post: ${post.slug}`);
                      console.log(`Content type: ${typeof post.content}`);

                      // Determine which content format to use
                      const contentToUse =
                        post.content.json || post.content.raw || post.content;

                      return (
                        <RichTextRenderer
                          content={contentToUse}
                          references={post.content.references || []}
                        />
                      );
                    } catch (error) {
                      console.error(
                        `Error rendering post content: ${error.message}`
                      );
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
                          <p>
                            Content Structure:{" "}
                            {post.content.json
                              ? `JSON keys: ${Object.keys(
                                  post.content.json
                                ).join(", ")}`
                              : post.content.raw
                              ? `RAW keys: ${Object.keys(post.content.raw).join(
                                  ", "
                                )}`
                              : "Unknown structure"}
                          </p>
                        </div>
                      </details>
                    </div>
                  )}
                </ErrorBoundary>
              ) : (
                <p className="text-center text-lg text-text-secondary font-normal">
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
