import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { motion, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Social_post_details";
import { getContentFragment } from "./Code_blocks/PostCodeBlocks";
import { useData } from "../store/HandleApiContext";
import ErrorBoundary from "./ErrorBoundary";
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

  // Add error boundary for content rendering
  useEffect(() => {
    if (
      post &&
      (!post.content || !post.content.raw || !post.content.raw.children)
    ) {
      console.error(
        `Post ${post.slug} has invalid content structure:`,
        post.content
      );
      setRenderError("Invalid content structure");
    } else {
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
              {post.content?.raw?.children ? (
                post.content.raw.children.map((typeObj, index) => {
                  const children = typeObj.children.map((item, itemindex) =>
                    getContentFragment(itemindex, item.text, item)
                  );

                  return getContentFragment(
                    index,
                    children,
                    typeObj,
                    typeObj.type
                  );
                })
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
