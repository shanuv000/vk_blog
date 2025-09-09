import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextSeo } from "next-seo";
import InfiniteScroll from "react-infinite-scroll-component";

import { getCategories, getCategoryPost } from "../../services";
import { PostCard, Categories, Loader } from "../../components";
import PostCardSkeleton from "../../components/PostCardSkeleton";
import SchemaManager from "../../components/SchemaManager";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";

const CategoryPost = ({ initialPosts }) => {
  const router = useRouter();
  const categorySlug = router.query.slug;

  // Use infinite scroll hook for category posts
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
    reset,
  } = useInfiniteScroll({
    type: "category",
    categorySlug: categorySlug,
    initialCount: 7,
    loadMoreCount: 3,
  });

  // Initialize posts when category slug changes
  useEffect(() => {
    if (categorySlug && isInitialLoad) {
      loadInitialPosts();
    }
  }, [categorySlug, isInitialLoad, loadInitialPosts]);

  // Reset and reload when category changes
  useEffect(() => {
    if (categorySlug) {
      reset();
    }
  }, [categorySlug, reset]);

  // With fallback: 'blocking', we don't need to handle isFallback
  // But keeping this for backward compatibility
  if (router.isFallback) {
    return <Loader />;
  }

  // Show loading spinner during initial load
  if (isInitialLoad && loading) {
    return <Loader />;
  }

  // Show error state
  if (error && posts.length === 0) {
    return (
      <div className="container mx-auto px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Error Loading Posts
        </h1>
        <p className="mb-8 text-text-secondary">{error}</p>
        <div className="space-x-4">
          <button
            onClick={loadInitialPosts}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Handle case where no posts found after loading
  if (!loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">No Posts Found</h1>
        <p className="mb-8">
          There are no posts in this category or the category doesn't exist.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Get category name from the first post
  const categoryName =
    posts.length > 0 && posts[0].node.categories
      ? posts[0].node.categories.find((cat) => cat.slug === categorySlug)?.name
      : categorySlug;

  // Map posts to a simpler format for structured data
  const postsForSchema = posts.map((post) => post.node);

  // SEO configuration
  const rootUrl = "https://blog.urtechy.com";
  const categoryUrl = `${rootUrl}/category/${router.query.slug}`;
  const title = categoryName
    ? `${categoryName} Articles - urTechy Blogs`
    : "Category - urTechy Blogs";
  const description = `Browse our collection of ${
    categoryName || "articles"
  } on urTechy Blogs. Stay updated with the latest insights and expert analysis.`;

  return (
    <>
      {/* Enhanced SEO with NextSeo */}
      <NextSeo
        title={title}
        description={description}
        canonical={categoryUrl}
        openGraph={{
          type: "website",
          url: categoryUrl,
          title: title,
          description: description,
          images: [
            {
              url: `${rootUrl}/logo/logo4.png`,
              width: 573,
              height: 600,
              alt: `${categoryName || "Category"} - urTechy Blogs`,
            },
          ],
          site_name: "urTechy Blogs",
        }}
        twitter={{
          handle: "@shanuv000",
          site: "@Onlyblogs_",
          cardType: "summary",
        }}
        additionalMetaTags={[
          {
            name: "keywords",
            content: `${
              categoryName || "articles"
            }, urTechy, blogs, technology, news, ${
              categoryName ? categoryName.toLowerCase() : "category"
            }`,
          },
          {
            name: "author",
            content: "urTechy Blogs",
          },
        ]}
      />

      {/* Add structured data */}
      <SchemaManager posts={postsForSchema} categoryName={categoryName} />
      <div className="container mx-auto px-10 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="col-span-1 lg:col-span-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-8 text-text-primary border-b border-secondary-light pb-4">
              {categoryName || "Category"} Articles
              {totalCount > 0 && (
                <span className="text-sm font-normal text-text-secondary ml-2">
                  ({postsCount} of {totalCount})
                </span>
              )}
            </h1>

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
                    🎉 You've reached the end! No more posts in this category.
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
          <div className="col-span-1 lg:col-span-4">
            <div className="relative lg:sticky top-8">
              <Categories />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default CategoryPost;

// Fetch data at build time - now only used for SEO and initial page structure
export async function getStaticProps({ params }) {
  try {
    // We don't need to fetch posts here anymore since we're using client-side infinite scroll
    // But we keep this for SEO purposes and to maintain the page structure
    return {
      props: {
        initialPosts: [], // Empty array since we load posts client-side
      },
      // Add revalidation to refresh the page every 1 minute
      revalidate: 60,
    };
  } catch (error) {
    console.error(
      `Error in getStaticProps for category ${params.slug}:`,
      error
    );

    // Return empty posts array instead of failing
    return {
      props: {
        initialPosts: [],
      },
      // Shorter revalidation time for error cases
      revalidate: 60,
    };
  }
}

// Specify dynamic routes to pre-render pages based on data.
// The HTML is generated at build time and will be reused on each request.
export async function getStaticPaths() {
  try {
    const categories = await getCategories();

    if (!categories || categories.length === 0) {
      console.warn("No categories found for getStaticPaths");
      return {
        paths: [],
        fallback: "blocking",
      };
    }

    // Filter out categories without slugs
    const validCategories = categories.filter(
      (category) => category && category.slug
    );

    console.log(`Pre-rendering ${validCategories.length} category pages`);

    return {
      paths: validCategories.map(({ slug }) => ({ params: { slug } })),
      // Use 'blocking' to wait for the page to be generated on-demand
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error in getStaticPaths for categories:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}
