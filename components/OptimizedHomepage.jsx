/**
 * Optimized Homepage Component with Unified Data Loading
 * This prevents multiple Hygraph API calls by consolidating data loading
 */

import React, { createContext, useContext, useMemo } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  PostCard,
  Categories,
  PostWidget,
  FeaturedCarouselGrid,
  EnhancedFeaturedPostCard,
} from "../components";
import {
  InitialPageLoader,
  InfiniteScrollLoader,
  ApiErrorState,
  EmptyState,
} from "../components/ApiLoadingStates";
import HomeSeo from "../components/HomeSeo";
import LoadingSpinner from "../components/LoadingSpinner";
import NewsletterCTA from "../components/NewsletterCTA";
import SchemaManager from "../components/SchemaManager";
import { useHomepageData } from "../hooks/useHomepageData";

// Create context for sharing homepage data across components
const HomepageDataContext = createContext(null);

/**
 * Optimized FeaturedPosts component that uses shared data
 */
const OptimizedFeaturedPosts = () => {
  const { data, loading } = useContext(HomepageDataContext);

  if (loading.featuredPosts) {
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

  if (!data.featuredPosts.length) {
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
        {data.featuredPosts.slice(0, 6).map((post, index) => (
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
 * Optimized PostWidget that uses shared data with image optimization
 */
const OptimizedPostWidget = () => {
  const { data, loading } = useContext(HomepageDataContext);

  if (loading.recentPosts) {
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
      {data.recentPosts.slice(0, 5).map((post, index) => {
        // Use pre-computed thumbnail URL from API or fallback
        const imageUrl = post.featuredImage?.thumbnailUrl || post.featuredImage?.url;
        
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
 * Optimized Categories that uses shared data
 */
const OptimizedCategories = () => {
  const { data, loading } = useContext(HomepageDataContext);

  if (loading.categories) {
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
      {data.categories.map((category) => (
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
 * Main Optimized Homepage Component
 * Memoized handlers to prevent flickering from re-renders
 */
export default function OptimizedHomepage({ initialPosts }) {
  const homepageData = useHomepageData(initialPosts);

  const {
    data,
    loading,
    isAnyLoading,
    isFullyLoaded,
    errors,
    hasAnyError,
    pagination,
    loadMoreMainPosts,
    refresh,
    mainPostsCount,
    canLoadMore,
  } = homepageData;

  // Memoize featured posts to pass as stable reference to carousel
  const memoizedFeaturedPosts = useMemo(
    () => data.featuredPosts,
    [data.featuredPosts]
  );

  // Show enhanced loading state during initial load
  if (!isFullyLoaded && isAnyLoading && data.mainPosts.length === 0) {
    return <InitialPageLoader message="Loading latest posts..." />;
  }

  // Show enhanced error state
  if (hasAnyError && data.mainPosts.length === 0) {
    return (
      <ApiErrorState
        error={errors.general || errors.mainPosts}
        onRetry={refresh}
        title="Failed to Load Homepage Data"
      />
    );
  }

  return (
    <HomepageDataContext.Provider value={homepageData}>
      <>
        {/* SEO and Schema */}
        <HomeSeo featuredPosts={data.featuredPosts.slice(0, 5)} />
        <SchemaManager
          isHomePage
          posts={data.mainPosts.map((post) => post.node)}
        />

        <div>
          {/* Featured Carousel Grid Section */}
          {!loading.featuredPosts &&
          !errors.featuredPosts &&
          data.featuredPosts.length > 0 ? (
            <FeaturedCarouselGrid
              featuredPosts={memoizedFeaturedPosts}
              autoplayInterval={6000}
              showStats={true}
              maxGridItems={6}
            />
          ) : loading.featuredPosts ? (
            <div className="mb-12 h-[70vh] min-h-[500px] bg-gray-900 rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
                <p className="text-lg">Loading featured posts...</p>
              </div>
            </div>
          ) : null}

          {/* Newsletter CTA - Engagement section */}
          <NewsletterCTA />

          {/* Main content */}
          <div className="mb-12 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Posts column */}
              <div className="lg:col-span-8 col-span-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-8 pb-4 border-b border-border">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
                    Latest Articles
                  </h2>
                  {pagination.totalCount > 0 && (
                    <span className="text-sm font-medium text-text-secondary bg-secondary-light px-3 py-1 rounded-full">
                      {mainPostsCount} of {pagination.totalCount}
                    </span>
                  )}
                </div>

                <InfiniteScroll
                  dataLength={data.mainPosts.length}
                  next={loadMoreMainPosts}
                  hasMore={canLoadMore}
                  loader={<InfiniteScrollLoader count={3} />}
                  endMessage={
                    <div className="text-center py-12 mb-8 mt-8 border-t border-border">
                      <div className="inline-flex items-center space-x-2 text-text-secondary">
                        <span>
                          🎉 You've reached the end! No more posts to load.
                        </span>
                      </div>
                    </div>
                  }
                  refreshFunction={refresh}
                  pullDownToRefresh={false}
                  className="space-y-8"
                >
                  {data.mainPosts.map((post, index) => (
                    <PostCard key={post.node.slug || index} post={post.node} />
                  ))}
                </InfiniteScroll>
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
                      <OptimizedPostWidget />
                    </div>
                  </div>

                  {/* Categories widget */}
                  <div className="bg-secondary rounded-xl border border-border shadow-card overflow-hidden">
                    <h3 className="text-xl font-heading font-bold px-6 py-4 border-b border-border text-text-primary">
                      Categories
                    </h3>
                    <div className="p-5">
                      <OptimizedCategories />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </HomepageDataContext.Provider>
  );
}

// Keep the same getStaticProps for SEO
export async function getStaticProps() {
  try {
    return {
      props: {
        initialPosts: [], // Empty since we load client-side
      },
      revalidate: 180, // 3 minutes
    };
  } catch (error) {
    console.error("Error in getStaticProps for home page:", error);
    return {
      props: { initialPosts: [] },
      revalidate: 120,
    };
  }
}
