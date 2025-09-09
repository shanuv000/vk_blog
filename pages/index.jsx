import { FeaturedPosts } from "../sections/index";
import { PostCard, Categories, PostWidget } from "../components";
import PostCardSkeleton from "../components/PostCardSkeleton";
import { getPosts } from "../services";
// import Footer from "../components/footer/Footer";
import { useEffect, useState } from "react";
import Head from "next/head";
import HomeSeo from "../components/HomeSeo";
import InfiniteScroll from "react-infinite-scroll-component";

import { ClipLoader } from "react-spinners";

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

  // Show loading spinner during initial load
  if (isInitialLoad && loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <ClipLoader color="#007bff" loading={true} size={150} />
      </div>
    );
  }

  // Show error state
  if (error && posts.length === 0) {
    return (
      <div className="container mx-auto px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Error Loading Posts
        </h1>
        <p className="mb-8 text-text-secondary">{error}</p>
        <button
          onClick={loadInitialPosts}
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
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
              loader={
                <div className="space-y-8">
                  {[...Array(3)].map((_, index) => (
                    <PostCardSkeleton key={`skeleton-${index}`} />
                  ))}
                </div>
              }
              endMessage={
                <div className="text-center py-8">
                  <p className="text-text-secondary">
                    🎉 You've reached the end! No more posts to load.
                  </p>
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
