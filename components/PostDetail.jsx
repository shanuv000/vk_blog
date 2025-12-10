import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useSpring } from "framer-motion";
import moment from "moment";
import Link from "next/link";
import { FaArrowLeft, FaRegClock, FaRegCalendarAlt } from "react-icons/fa";
import { FaXTwitter, FaFacebook, FaLink, FaCheck } from "react-icons/fa6";
import { DEFAULT_FEATURED_IMAGE, DEFAULT_AVATAR } from "./DefaultAvatar";
import ErrorBoundary from "./ErrorBoundary";
import FloatingShareBar from "./FloatingShareBar";
import HeadPostDetails from "./HeadPostDetails";
import OptimizedImage from "./OptimizedImage";
import RichTextRenderer from "./RichTextRenderer";
import Navbar_post_details from "./Social_post_details";
import TagList from "./TagList";

// Lazy load Comments component to improve initial page load performance
const Comments = dynamic(() => import("./Comments"), {
  loading: () => (
    <div className="max-w-3xl mx-auto mt-16 animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-24 bg-gray-100 rounded mb-3" />
      <div className="h-3 w-40 bg-gray-200 rounded" />
    </div>
  ),
  ssr: false,
});

// Lazy load SocialMediaEmbedder component with optimized loading
const SocialMediaEmbedder = dynamic(() => import("./SocialMediaEmbedder"), {
  loading: () => (
    <div className="max-w-3xl mx-auto mt-12 space-y-8">
      {/* Twitter embed skeleton */}
      <div className="flex justify-center">
        <div className="w-full max-w-[550px] bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-gray-100 rounded" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="h-48 bg-gray-100 rounded-lg mb-3" />
          <div className="flex justify-between text-gray-300">
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

// Lazy load FAQ component - SSR enabled for SEO (reads faQs from Hygraph)
const FAQ = dynamic(() => import("./FAQ"), {
  loading: () => (
    <div className="mt-16 p-6 bg-gray-50 rounded-2xl animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl mb-3" />
      ))}
    </div>
  ),
});

import { useData } from "../store/HandleApiContext";

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
  const [copied, setCopied] = useState(false);

  const readingTime = post?.content?.raw
    ? Math.max(
        1,
        Math.ceil(post.content.raw.toString().split(/\s+/).length / 200)
      )
    : null;
  const heroImage = post?.featuredImage?.url || DEFAULT_FEATURED_IMAGE;
  const postUrl = `https://blog.urtechy.com/post/${post?.slug || ""}`;

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
        <Link
          href="/"
          className="mt-8 inline-flex items-center text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main className="bg-white min-h-screen pb-20">
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
          style={{ scaleX }}
        />

        <HeadPostDetails post={post} />

        {/* Floating Share Bar - Desktop Only */}
        <FloatingShareBar post={post} showThreshold={500} />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Enhanced Breadcrumb Navigation */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              {post.categories?.[0] && (
                <>
                  <li>
                    <Link 
                      href={`/category/${post.categories[0].slug}`}
                      className="text-gray-500 hover:text-primary transition-colors"
                    >
                      {post.categories[0].name}
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                </>
              )}
              <li className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-[300px]">
                {post.title}
              </li>
            </ol>
          </nav>

          <header className="mb-10 sm:mb-14 text-center max-w-3xl mx-auto">
            {/* Categories/Tags Badge */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex justify-center gap-2 mb-6">
                {post.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary tracking-wide uppercase"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500 font-medium">
              <div className="flex items-center">
                <FaRegCalendarAlt className="mr-2 text-gray-400" />
                <span suppressHydrationWarning>
                  {post.createdAt
                    ? moment(post.createdAt).format("MMMM D, YYYY")
                    : "Date unavailable"}
                </span>
              </div>
              {readingTime && (
                <div className="flex items-center">
                  <FaRegClock className="mr-2 text-gray-400" />
                  <span>{readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Inline Share Buttons */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">Share</span>
              <div className="flex items-center gap-1">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}&via=Onlyblogs_`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-black transition-all"
                  title="Share on Twitter"
                  aria-label="Share on Twitter"
                >
                  <FaXTwitter size={16} />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                >
                  <FaFacebook size={16} />
                </a>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(postUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch (error) {
                      console.error("Copy failed:", error);
                    }
                  }}
                  className={`p-2.5 rounded-full transition-all ${
                    copied 
                      ? "bg-green-100 text-green-600" 
                      : "text-gray-400 hover:bg-gray-100 hover:text-primary"
                  }`}
                  title={copied ? "Copied!" : "Copy link"}
                  aria-label="Copy link"
                >
                  {copied ? <FaCheck size={16} /> : <FaLink size={16} />}
                </button>
              </div>
            </div>
          </header>

          {heroImage && (
            <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl shadow-xl mb-12 sm:mb-16">
              <OptimizedImage
                src={heroImage}
                alt={post.title || "Post hero image"}
                fill
                priority
                quality={90}
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                fallbackSrc={DEFAULT_FEATURED_IMAGE}
                showSkeleton
                aspectRatio="16/9"
                containerClassName="w-full h-full"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2NzUiIHZpZXdCb3g9IjAgMCAxMjAwIDY3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjc1IiBmaWxsPSJyZ2JhKDE1NiwgMTYzLCAxNzUsIDAuMSkiLz4KPHN2Zz4K"
                onError={(error) => {
                  console.warn("Hero image failed to load:", error);
                }}
              />
              <figcaption className="sr-only">{post.title}</figcaption>
            </figure>
          )}

          <div className="max-w-3xl mx-auto">
            {/* Author Info Section */}
            {post.author && (
              <motion.div 
                className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl mb-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <OptimizedImage
                    src={post.author.photo?.url || DEFAULT_AVATAR}
                    alt={post.author.name || "Author"}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-gray-900 truncate">
                    {post.author.name}
                  </p>
                  {post.author.bio && (
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                      {post.author.bio}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            <ErrorBoundary>
              {post.slug && (
                <motion.div
                  className="mb-10"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Testing slug={post.slug} />
                </motion.div>
              )}
            </ErrorBoundary>

            <section className="mb-12">
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
                        <div className="prose prose-lg prose-slate max-w-none prose-p:leading-[1.8] prose-li:leading-relaxed prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-md prose-blockquote:border-l-primary prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
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
                <p className="text-sm text-gray-500 italic">
                  No content is available for this post.
                </p>
              )}
            </section>

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                  Related Topics
                </h3>
                <TagList tags={post.tags} title="" size="md" />
              </div>
            )}

            {/* AI-Generated FAQ Section */}
            <ErrorBoundary
              fallback={
                <div className="mt-12 p-6 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">FAQs unavailable</p>
                </div>
              }
            >
              <FAQ post={post} />
            </ErrorBoundary>

            <section className="mt-12">
              <ErrorBoundary
                fallback={
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Social media embeds are temporarily unavailable
                    </p>
                  </div>
                }
              >
                <SocialMediaEmbedder key={post.slug} />
              </ErrorBoundary>
            </section>

            <section className="mt-16 pt-10 border-t border-gray-100">
              <Navbar_post_details post={post} />
            </section>

            {post.slug && (
              <section className="mt-16">
                <Comments postSlug={post.slug} />
              </section>
            )}
          </div>
        </article>
      </main>
    </ErrorBoundary>
  );
};

export default PostDetail;
