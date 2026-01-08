/**
 * Optimized Homepage Component with SSR Pagination
 * SEO-optimized with server-side rendering and classic pagination
 * 
 * Updated: Magazine-style layout with lighter components
 */

import React, { useMemo } from "react";
import Link from "next/link";
import { PostCard } from "../components";
import { EmptyState } from "../components/ApiLoadingStates";
import HomeSeo from "../components/HomeSeo.js";
import NewsletterCTA from "../components/NewsletterCTA";
import SchemaManager from "../components/SchemaManager";
import Pagination from "../components/Pagination";
import HeroFeatureGrid from "./HeroFeatureGrid";
import BreakingNewsStrip from "./BreakingNewsStrip";
import TopStoriesSection from "./TopStoriesSection";
import NativeBannerAd from "./NativeBannerAd";

/**
 * Optimized PostWidget that uses props data with image optimization
 */
const OptimizedPostWidget = ({ recentPosts = [] }) => {
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
 * Optimized Categories component with proper Next.js Link
 */
const OptimizedCategories = ({ categories = [] }) => {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.slug} className="group">
          <Link
            href={`/category/${category.slug}`}
            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary-light transition-colors duration-200 group-hover:text-primary"
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-text-secondary group-hover:text-primary">
              →
            </span>
          </Link>
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
  } = pagination;

  // Memoize featured posts to pass as stable reference to carousel
  const memoizedFeaturedPosts = useMemo(() => featuredPosts, [featuredPosts]);

  // Check if we have any data
  const hasData = posts.length > 0;
  const isPageOne = currentPage === 1;

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
        {/* Breaking News Strip - only on page 1, with reserved height for CLS prevention */}
        {isPageOne && (
          <div className="min-h-[44px] sm:min-h-[48px]">
            {recentPosts.length > 0 && (
              <BreakingNewsStrip posts={recentPosts} label="LATEST" />
            )}
          </div>
        )}

        {/* Hero Feature Grid - replaces heavy carousel, only on page 1 */}
        {isPageOne && featuredPosts.length > 0 && (
          <HeroFeatureGrid posts={memoizedFeaturedPosts} />
        )}

        {/* Top Stories Section - only on page 1 */}
        {isPageOne && posts.length > 3 && (
          <TopStoriesSection
            posts={posts.slice(0, 6)}
            title="Top Stories"
          />
        )}

        {/* Native Banner Ad - between Top Stories and Latest Articles */}
        {isPageOne && <NativeBannerAd />}

        {/* Main content */}
        <div className="mb-8 mt-8">
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
              <div className="lg:sticky lg:top-8 space-y-6">
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

        {/* Newsletter CTA - at the bottom, only on page 1 */}
        {isPageOne && <NewsletterCTA />}
      </div>
    </>
  );
}
