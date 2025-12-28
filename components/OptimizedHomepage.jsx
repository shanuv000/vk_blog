/**
 * Optimized Homepage Component with SSR Pagination
 * SEO-optimized with server-side rendering and classic pagination
 */

import React, { useMemo } from "react";
import Link from "next/link";
import {
  PostCard,
  Categories,
  FeaturedCarouselGrid,
  EnhancedFeaturedPostCard,
} from "../components";
import {
  InitialPageLoader,
  ApiErrorState,
  EmptyState,
} from "../components/ApiLoadingStates";
import HomeSeo from "../components/HomeSeo";
import LoadingSpinner from "../components/LoadingSpinner";
import NewsletterCTA from "../components/NewsletterCTA";
import SchemaManager from "../components/SchemaManager";
import Pagination from "../components/Pagination";

/**
 * Optimized FeaturedPosts component
 */
const OptimizedFeaturedPosts = ({ featuredPosts = [], loading = false }) => {
  if (loading) {
    return (
      <div className="mb-12 bg-secondary-light/10 rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary-light rounded w-64 mx-auto mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-secondary-light rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!featuredPosts.length) {
    return null;
  }

  return (
    <section className="mb-12 bg-gradient-to-r from-secondary-light/10 to-transparent rounded-2xl p-6 md:p-8">
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">
          <span className="text-gradient">Featured Content</span>
        </h2>
        <div className="mt-2 w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mx-auto" />
        <p className="mt-4 text-text-secondary text-base">
          Discover our most popular and engaging articles
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredPosts.slice(0, 6).map((post, index) => (
          <EnhancedFeaturedPostCard
            key={post.slug || index}
            post={post}
            index={index}
            variant={index === 0 ? "large" : index < 3 ? "default" : "compact"}
          />
        ))}
      </div>
    </section>
  );
};

/**
 * Optimized PostWidget that uses props data with image optimization
 */
const OptimizedPostWidget = ({ recentPosts = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div className="flex items-center w-full p-2" key={item}>
            <div className="w-12 h-12 bg-secondary-light rounded-md flex-none animate-pulse" />
            <div className="flex-grow ml-3">
              <div className="h-3 bg-secondary-light rounded w-3/4 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recentPosts.slice(0, 5).map((post, index) => {
        const imageUrl =
          post.featuredImage?.thumbnailUrl || post.featuredImage?.url;

        return (
          <Link
            key={post.slug || index}
            href={`/post/${post.slug}`}
            className="flex items-center w-full p-2 rounded-lg hover:bg-secondary-light transition-colors duration-150 group"
            prefetch={false}
          >
            <div className="w-12 h-12 flex-none overflow-hidden rounded-md bg-secondary-light">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-text-secondary text-sm">📄</span>
                </div>
              )}
            </div>
            <div className="flex-grow ml-3 min-w-0">
              <h4 className="text-text-primary font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
                {post.title}
              </h4>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

/**
 * Optimized Categories component
 */
const OptimizedCategories = ({ categories = [], loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSpinner
          size="small"
          type="pulse"
          message="Loading categories..."
        />
        <div className="animate-pulse w-full">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-4 bg-secondary-light rounded mb-3"
              style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.slug} className="group">
          <a
            href={`/category/${category.slug}`}
            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary-light transition-colors duration-200 group-hover:text-primary"
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-text-secondary group-hover:text-primary">
              →
            </span>
          </a>
        </div>
      ))}
    </div>
  );
};

/**
 * Main Optimized Homepage Component with SSR Pagination
 */
export default function OptimizedHomepage({
  posts = [],
  pagination = {},
  featuredPosts = [],
  recentPosts = [],
  categories = [],
}) {
  const {
    currentPage = 1,
    totalPages = 1,
    totalCount = 0,
    hasNextPage = false,
    hasPrevPage = false,
  } = pagination;

  // Memoize featured posts to pass as stable reference to carousel
  const memoizedFeaturedPosts = useMemo(() => featuredPosts, [featuredPosts]);

  // Check if we have any data
  const hasData = posts.length > 0;
  const isPageOne = currentPage === 1;

  // Get the base path for pagination links
  const paginationBasePath = isPageOne ? "/" : "/page";

  // Show empty state if no posts
  if (!hasData && totalCount === 0) {
    return (
      <>
        <HomeSeo featuredPosts={featuredPosts.slice(0, 5)} currentPage={currentPage} totalPages={totalPages} />
        <EmptyState
          title="No Articles Found"
          message="We couldn't find any articles. Please check back later."
        />
      </>
    );
  }

  return (
    <>
      {/* SEO and Schema */}
      <HomeSeo
        featuredPosts={featuredPosts.slice(0, 5)}
        currentPage={currentPage}
        totalPages={totalPages}
      />
      <SchemaManager isHomePage posts={posts.map((post) => post.node)} />

      <div>
        {/* Featured Carousel Grid Section - only on page 1 */}
        {isPageOne && featuredPosts.length > 0 && (
          <FeaturedCarouselGrid
            featuredPosts={memoizedFeaturedPosts}
            autoplayInterval={6000}
            showStats={true}
          />
        )}

        {/* Newsletter CTA - only on page 1 */}
        {isPageOne && <NewsletterCTA />}

        {/* Main content */}
        <div className="mb-12 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Posts column */}
            <div className="lg:col-span-8 col-span-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-8 pb-4 border-b border-border">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
                  {isPageOne ? "Latest Articles" : `Articles - Page ${currentPage}`}
                </h2>
                {totalCount > 0 && (
                  <span className="text-sm font-medium text-text-secondary bg-secondary-light px-3 py-1 rounded-full">
                    {totalCount} {totalCount === 1 ? "article" : "articles"}
                  </span>
                )}
              </div>

              {/* Posts grid */}
              <div className="space-y-8">
                {posts.map((post, index) => (
                  <PostCard key={post.node.slug || index} post={post.node} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                showPageInfo={true}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 col-span-1">
              <div className="lg:sticky relative top-8 space-y-6">
                {/* Recent posts widget */}
                <div className="bg-secondary rounded-xl border border-border shadow-card overflow-hidden">
                  <h3 className="text-xl font-heading font-bold px-6 py-4 border-b border-border text-text-primary">
                    Recent Posts
                  </h3>
                  <div className="p-5">
                    <OptimizedPostWidget recentPosts={recentPosts} />
                  </div>
                </div>

                {/* Categories widget */}
                <div className="bg-secondary rounded-xl border border-border shadow-card overflow-hidden">
                  <h3 className="text-xl font-heading font-bold px-6 py-4 border-b border-border text-text-primary">
                    Categories
                  </h3>
                  <div className="p-5">
                    <OptimizedCategories categories={categories} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
