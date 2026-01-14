import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { Categories, Loader } from "../../components";
import MagazineCategoryLayout from "../../components/MagazineCategoryLayout";
import {
  CategorySwitchLoader,
  ApiErrorState,
  EmptyState,
} from "../../components/ApiLoadingStates";
import SchemaManager from "../../components/SchemaManager";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { getCategories } from "../../services";
import {
  getCategoryInfo,
  getCategoryBreadcrumb,
} from "../../utils/categoryHierarchy";


// Enhanced loading components

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
    hasAttemptedLoad,
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

  // Get category name for loading states
  const categoryName = categorySlug
    ? categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
    : "Category";

  // Show enhanced loading state during initial load
  if (isInitialLoad && loading) {
    return <CategorySwitchLoader categoryName={categoryName} />;
  }

  // Show enhanced error state (only after we've attempted to load)
  if (error && posts.length === 0 && hasAttemptedLoad) {
    return (
      <ApiErrorState
        error={error}
        onRetry={loadInitialPosts}
        title={`Failed to Load ${categoryName} Posts`}
      />
    );
  }

  // Handle case where no posts found after loading (only after we've attempted to load)
  if (!loading && posts.length === 0 && !error && hasAttemptedLoad) {
    return (
      <EmptyState
        title={`No ${categoryName} Posts Found`}
        message="There are no posts in this category or the category doesn't exist."
        actionLabel="Return to Home"
        onAction={() => router.push("/")}
      />
    );
  }

  // Get actual category name from the first post (override the capitalized slug)
  const actualCategoryName =
    posts.length > 0 && posts[0].node.categories
      ? posts[0].node.categories.find((cat) => cat.slug === categorySlug)?.name
      : categoryName;

  // Map posts to a simpler format for structured data
  const postsForSchema = posts.map((post) => post.node);

  // SEO configuration
  const rootUrl = "https://blog.urtechy.com";
  const categoryUrl = `${rootUrl}/category/${router.query.slug}`;
  const title = actualCategoryName
    ? `${actualCategoryName} Articles - urTechy Blogs`
    : "Category - urTechy Blogs";
  const description = `Browse our collection of ${actualCategoryName || "articles"
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
              alt: `${actualCategoryName || "Category"} - urTechy Blogs`,
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
            content: `${actualCategoryName || "articles"
              }, urTechy, blogs, technology, news, ${actualCategoryName ? actualCategoryName.toLowerCase() : "category"
              }`,
          },
          {
            name: "author",
            content: "urTechy Blogs",
          },
        ]}
      />

      {/* Add structured data */}
      <SchemaManager posts={postsForSchema} categoryName={actualCategoryName} />
      <div className="container mx-auto px-10 mb-8">
        {/* Breadcrumb Navigation */}
        {categorySlug &&
          (() => {
            const breadcrumb = getCategoryBreadcrumb(categorySlug);
            const categoryInfo = getCategoryInfo(categorySlug);

            return breadcrumb && breadcrumb.length > 0 ? (
              <nav className="flex items-center space-x-2 text-sm mb-6 py-3">
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <svg
                        className="w-4 h-4 text-text-secondary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {index === breadcrumb.length - 1 ? (
                      <span className="text-primary font-medium flex items-center">
                        {categoryInfo?.icon && (
                          <span className="mr-1.5">{categoryInfo.icon}</span>
                        )}
                        {item.name}
                      </span>
                    ) : (
                      <a
                        href={item.href}
                        className="text-text-secondary hover:text-primary transition-colors duration-150"
                      >
                        {item.name}
                      </a>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            ) : null;
          })()}



        {/* Magazine-Style Layout */}
        <MagazineCategoryLayout
          posts={posts}
          hasMore={hasMore}
          loadMorePosts={loadMorePosts}
          loadInitialPosts={loadInitialPosts}
          categoryName={actualCategoryName || categoryName}
          totalCount={totalCount}
          postsCount={postsCount}
          sidebarContent={<Categories />}
        />
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

    if (process.env.NODE_ENV === 'development') {


      if (process.env.NODE_ENV === 'development') {



        console.log(`Pre-rendering ${validCategories.length} category pages`);



      }


    }

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
