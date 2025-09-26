/**
 * Optimized Homepage Component with Unified Data Loading
 * This prevents multiple Hygraph API calls by consolidating data loading
 */

import React, { createContext, useContext } from 'react';
import { PostCard, Categories, PostWidget } from "../components";
import InfiniteScroll from "react-infinite-scroll-component";
import HomeSeo from "../components/HomeSeo";
import SchemaManager from "../components/SchemaManager";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  InitialPageLoader,
  InfiniteScrollLoader,
  ApiErrorState,
  EmptyState,
} from "../components/ApiLoadingStates";
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
          <div className="h-8 bg-secondary-light rounded w-64 mx-auto mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-secondary-light rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data.featuredPosts.length) return null;

  return (
    <section className="mb-12 bg-gradient-to-r from-secondary-light/5 to-secondary-light/10 rounded-2xl p-8">
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">
          <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
            Featured Content
          </span>
        </h2>
        <div className="mt-2 w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mx-auto"></div>
        <p className="mt-4 text-text-secondary/80 text-lg font-medium">
          Discover our most popular and engaging articles
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.featuredPosts.slice(0, 6).map((post, index) => (
          <div
            key={post.slug || index}
            className="bg-secondary rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-video bg-secondary-light relative overflow-hidden">
              {post.featuredImage?.url && (
                <img
                  src={post.featuredImage.url}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading={index < 3 ? "eager" : "lazy"}
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-heading font-semibold text-lg text-text-primary line-clamp-2 mb-2">
                {post.title}
              </h3>
              {post.author && (
                <div className="flex items-center text-sm text-text-secondary">
                  <span>By {post.author.name}</span>
                </div>
              )}
            </div>
          </div>
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
        <LoadingSpinner size="small" type="dots" message="Loading recent posts..." />
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(item => (
            <div className="flex items-center w-full" key={item}>
              <div className="w-16 h-16 bg-secondary-light rounded-md flex-none"></div>
              <div className="flex-grow ml-4">
                <div className="h-2 bg-secondary-light rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-secondary-light rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.recentPosts.map((post, index) => (
        <div
          key={post.slug || index}
          className="flex items-center w-full p-2 rounded-lg hover:bg-secondary-light transition-colors duration-200"
        >
          <div className="w-16 h-16 flex-none overflow-hidden rounded-md">
            {post.featuredImage?.url ? (
              <img
                src={post.featuredImage.url}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center bg-secondary-light h-full w-full">
                <span className="text-text-secondary">📄</span>
              </div>
            )}
          </div>
          <div className="flex-grow ml-4">
            <h4 className="text-text-primary font-medium line-clamp-2">
              {post.title}
            </h4>
          </div>
        </div>
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
        <LoadingSpinner size="small" type="pulse" message="Loading categories..." />
        <div className="animate-pulse w-full">
          {[1, 2, 3, 4, 5].map(item => (
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
      {data.categories.map(category => (
        <div key={category.slug} className="group">
          <a
            href={`/category/${category.slug}`}
            className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary-light transition-colors duration-200 group-hover:text-primary"
          >
            <span className="font-medium">{category.name}</span>
            <span className="text-text-secondary group-hover:text-primary">→</span>
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
        <SchemaManager isHomePage={true} posts={data.mainPosts.map(post => post.node)} />

        <div className="mb-12">
          {/* Hero section with optimized featured posts */}
          <OptimizedFeaturedPosts />

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Posts column */}
            <div className="lg:col-span-8 col-span-1">
              <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8 text-text-primary border-b border-secondary-light pb-4">
                Latest Articles
                {pagination.totalCount > 0 && (
                  <span className="text-sm font-normal text-text-secondary ml-2">
                    ({mainPostsCount} of {pagination.totalCount})
                  </span>
                )}
              </h2>

              <InfiniteScroll
                dataLength={data.mainPosts.length}
                next={loadMoreMainPosts}
                hasMore={canLoadMore}
                loader={<InfiniteScrollLoader count={3} />}
                endMessage={
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-2 text-text-secondary">
                      <span>🎉 You've reached the end! No more posts to load.</span>
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
              <div className="lg:sticky relative top-8 space-y-8">
                {/* Recent posts widget */}
                <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
                  <h3 className="text-xl font-heading font-semibold px-6 py-4 border-b border-secondary-light text-text-primary">
                    Recent Posts
                  </h3>
                  <div className="p-4">
                    <OptimizedPostWidget />
                  </div>
                </div>

                {/* Categories widget */}
                <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
                  <h3 className="text-xl font-heading font-semibold px-6 py-4 border-b border-secondary-light text-text-primary">
                    Categories
                  </h3>
                  <div className="p-4">
                    <OptimizedCategories />
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