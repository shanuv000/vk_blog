import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import { motion, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Social_post_details";
import OptimizedImage from "./OptimizedImage";

// Lazy load Comments component to improve initial page load performance
const Comments = dynamic(() => import("./Comments"), {
  loading: () => (
    <div className="max-w-3xl mx-auto mt-16 animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-4"></div>
      <div className="h-24 bg-gray-100 rounded mb-3"></div>
      <div className="h-3 w-40 bg-gray-200 rounded"></div>
    </div>
  ),
  ssr: false,
});

// Lazy load SocialMediaEmbedder component
const SocialMediaEmbedder = dynamic(() => import("./SocialMediaEmbedder"), {
  ssr: false,
});

import { useData } from "../store/HandleApiContext";
import ErrorBoundary from "./ErrorBoundary";
import RichTextRenderer from "./RichTextRenderer";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";

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
  const [renderError, setRenderError] = useState(null);

  const readingTime = post?.content?.raw
    ? Math.max(
        1,
        Math.ceil(post.content.raw.toString().split(/\s+/).length / 200)
      )
    : null;
  const heroImage = post?.featuredImage?.url || DEFAULT_FEATURED_IMAGE;

  // Enhanced error boundary for content rendering
  useEffect(() => {
    if (post) {
      if (!post.content) {
        setRenderError("No content available");
        return;
      }
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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">
            Unable to display this post
          </h2>
          <p className="mt-2 text-sm text-red-700">{renderError}</p>
          <dl className="mt-4 space-y-1 text-xs text-red-600">
            <div>
              <dt className="inline font-medium">Slug:</dt>{" "}
              <dd className="inline">{post?.slug || "unknown"}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Title:</dt>{" "}
              <dd className="inline">{post?.title || "unknown"}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  // If post is null, show a friendly error message
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Post not found</h2>
        <p className="mt-4 text-sm text-gray-600">
          The article you are looking for might have been removed or is
          temporarily unavailable.
        </p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main className="bg-white min-h-screen">
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-gray-900 origin-left z-50"
          style={{ scaleX }}
        />

        <HeadPostDetails post={post} />

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {heroImage && (
            <figure className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-gray-100">
              <OptimizedImage
                src={heroImage}
                alt={post.title || "Post hero image"}
                fill
                priority
                quality={85}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
                fallbackSrc={DEFAULT_FEATURED_IMAGE}
                showSkeleton
                aspectRatio="3/2"
                containerClassName="w-full h-full"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHZpZXdCb3g9IjAgMCAxMjAwIDY3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjc1IiBmaWxsPSJyZ2JhKDE1NiwgMTYzLCAxNzUsIDAuMSkiLz4KPHN2Zz4K"
                onError={(error) => {
                  console.warn("Hero image failed to load:", error);
                }}
              />
              <figcaption className="sr-only">{post.title}</figcaption>
            </figure>
          )}

          <header className="mt-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-semibold tracking-tight text-gray-900">
              {post.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
              <span suppressHydrationWarning>
                {post.createdAt
                  ? moment(post.createdAt).format("MMMM D, YYYY")
                  : "Date unavailable"}
              </span>
              {readingTime && <span>·</span>}
              {readingTime && <span>{readingTime} min read</span>}
            </div>
          </header>

          <ErrorBoundary>
            {post.slug && (
              <motion.div
                className="mt-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Testing slug={post.slug} />
              </motion.div>
            )}
          </ErrorBoundary>

          <section className="mt-12">
            {post.content ? (
              <ErrorBoundary
                fallback={
                  <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    We had trouble showing this article. Please refresh the
                    page.
                  </p>
                }
              >
                {(() => {
                  try {
                    return (
                      <div className="prose prose-lg prose-slate max-w-none leading-relaxed prose-table:border prose-table:border-gray-200 prose-td:border-t prose-td:border-gray-200 prose-th:bg-gray-50 prose-th:text-gray-800 prose-th:font-semibold prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:text-gray-700">
                        <RichTextRenderer
                          content={post.content}
                          references={
                            Array.isArray(post.content?.references)
                              ? post.content.references
                              : []
                          }
                        />
                      </div>
                    );
                  } catch (error) {
                    return (
                      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        We encountered an error while rendering the article.
                        Please try again.
                      </p>
                    );
                  }
                })()}
              </ErrorBoundary>
            ) : (
              <p className="text-sm text-gray-500">
                No content is available for this post.
              </p>
            )}
          </section>

          <section className="mt-12">
            <SocialMediaEmbedder key={post.slug} />
          </section>

          <section className="mt-16 pt-12 border-t border-gray-200">
            <Navbar_post_details post={post} />
          </section>

          {post.slug && (
            <section className="mt-16">
              <Comments postSlug={post.slug} />
            </section>
          )}
        </article>
      </main>
    </ErrorBoundary>
  );
};

export default PostDetail;
