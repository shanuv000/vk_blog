import { FeaturedPosts } from "../sections/index";
import { PostCard, Categories, PostWidget } from "../components";
import PostCardSkeleton from "../components/PostCardSkeleton";
import { getPosts } from "../services";
// import Footer from "../components/footer/Footer";
import { useEffect, useState } from "react";
import Head from "next/head";
import HomeSeo from "../components/HomeSeo";
import InfiniteScroll from "react-infinite-scroll-component";

// Enhanced loading components
import LoadingSpinner from "../components/LoadingSpinner";
import {
  InitialPageLoader,
  InfiniteScrollLoader,
  ApiErrorState,
  EmptyState,
} from "../components/ApiLoadingStates";

// Fisher-Yates shuffle algorithm
import { useMediaQuery } from "react-responsive"; // Import for media query
import SchemaManager from "../components/SchemaManager";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Home({ initialPosts }) {
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" }); // Detect mobile

  // Use infinite scroll hook
  const {
    posts,
    loading,
    hasMore,
    error,
    totalCount,
    isInitialLoad,
    hasAttemptedLoad,
    loadInitialPosts,
    loadMorePosts,
    postsCount,
  } = useInfiniteScroll({
    type: "homepage",
    initialCount: 7,
    loadMoreCount: 3,
  });

  // Initialize posts on component mount
  useEffect(() => {
    if (isInitialLoad) {
      loadInitialPosts();
    }
  }, [isInitialLoad, loadInitialPosts]);

  // Show enhanced loading state during initial load
  if (isInitialLoad && loading) {
    return <InitialPageLoader message="Loading latest posts..." />;
  }

  // Show enhanced error state
  if (error && posts.length === 0 && hasAttemptedLoad) {
    return (
      <ApiErrorState
        error={error}
        onRetry={loadInitialPosts}
        title="Failed to Load Posts"
      />
    );
  }

  // Show empty state if no posts found (only after we've attempted to load)
  if (!loading && posts.length === 0 && !error && hasAttemptedLoad) {
    return (
      <EmptyState
        title="No Posts Available"
        message="There are no posts to display at the moment. Please check back later."
        actionLabel="Refresh"
        onAction={loadInitialPosts}
      />
    );
  }
  return (
    <>
      {/* Add SEO optimization */}
      <HomeSeo featuredPosts={posts.slice(0, 5).map((post) => post.node)} />

      {/* Add structured data for homepage */}
      <SchemaManager isHomePage={true} posts={posts.map((post) => post.node)} />
      <div className="mb-12">
        {/* Hero section with featured posts */}
        <div className="mb-12">
          <FeaturedPosts />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Posts column */}
          <div className="lg:col-span-8 col-span-1">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8 text-text-primary border-b border-secondary-light pb-4">
              Latest Articles
              {totalCount > 0 && (
                <span className="text-sm font-normal text-text-secondary ml-2">
                  ({postsCount} of {totalCount})
                </span>
              )}
            </h2>

            <InfiniteScroll
              dataLength={posts.length}
              next={loadMorePosts}
              hasMore={hasMore}
              loader={<InfiniteScrollLoader count={3} />}
              endMessage={
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2 text-text-secondary">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      🎉 You've reached the end! No more posts to load.
                    </span>
                  </div>
                </div>
              }
              refreshFunction={loadInitialPosts}
              pullDownToRefresh={false}
              className="space-y-8"
            >
              {posts.map((post, index) => (
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
                  <PostWidget />
                </div>
              </div>

              {/* Categories widget */}
              <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
                <h3 className="text-xl font-heading font-semibold px-6 py-4 border-b border-secondary-light text-text-primary">
                  Categories
                </h3>
                <div className="p-4">
                  <Categories />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Fetch data at build time - now only used for SEO and initial page structure
export async function getStaticProps() {
  try {
    // We don't need to fetch posts here anymore since we're using client-side infinite scroll
    // But we keep this for SEO purposes and to maintain the page structure
    return {
      props: {
        initialPosts: [], // Empty array since we load posts client-side
      },
      // Reduce revalidation time to ensure latest posts are shown
      revalidate: 180, // 3 minutes - balance between performance and freshness
    };
  } catch (error) {
    console.error("Error in getStaticProps for home page:", error);

    // Return empty posts array instead of failing
    return {
      props: {
        initialPosts: [],
      },
      // Shorter revalidation time for error cases
      revalidate: 120,
    };
  }
}
