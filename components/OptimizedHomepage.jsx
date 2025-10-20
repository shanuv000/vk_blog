/**
 * Optimized Homepage Component with Unified Data Loading
 * This prevents multiple Hygraph API calls by consolidating data loading
 */

import React, { createContext, useContext } from "react";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  PostCard,
  Categories,
  PostWidget,
  HeroSpotlight,
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

  if (!data.featuredPosts.length) {return null;}

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
 * Optimized PostWidget that uses shared data
 */
const OptimizedPostWidget = () => {
  const { data, loading } = useContext(HomepageDataContext);

  if (loading.recentPosts) {
    return (
      <div className="space-y-4">
        <LoadingSpinner
          size="small"
          type="dots"
          message="Loading recent posts..."
        />
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div className="flex items-center w-full" key={item}>
              <div className="w-16 h-16 bg-secondary-light rounded-md flex-none" />
              <div className="flex-grow ml-4">
                <div className="h-2 bg-secondary-light rounded w-1/4 mb-2" />
                <div className="h-4 bg-secondary-light rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.recentPosts.map((post, index) => (
        <Link
          key={post.slug || index}
          href={`/post/${post.slug}`}
          className="flex items-center w-full p-3 rounded-lg hover:bg-secondary-light transition-colors duration-200 group cursor-pointer"
        >
          <div className="w-14 h-14 flex-none overflow-hidden rounded-md">
            {post.featuredImage?.url ? (
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center bg-secondary-light h-full w-full">
                <span className="text-text-secondary text-xl">📄</span>
              </div>
            )}
          </div>
          <div className="flex-grow ml-3 min-w-0">
            <h4 className="text-text-primary font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
              {post.title}
            </h4>
          </div>
        </Link>
      ))}
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
 */
export default function OptimizedHomepage({ initialPosts }) {
  const homepageData = useHomepageData();

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
          {/* Hero Spotlight Section */}
          <HeroSpotlight
            featuredPosts={data.featuredPosts}
            isLoading={loading.featuredPosts}
            error={errors.featuredPosts}
          />

          {/* Main content */}
          <div className="mb-12 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Posts column */}
              <div className="lg:col-span-8 col-span-1">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
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
                    <div className="text-center py-8">
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
