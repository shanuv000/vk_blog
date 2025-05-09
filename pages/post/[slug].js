import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// Import components using the organization's established pattern
import {
  PostDetail,
  Categories,
  PostWidget,
  Author,
  Loader,
  SchemaManager,
} from "../../components";

// Import data hooks instead of direct service calls
import { usePostDetails } from "../../hooks/useApolloQueries";
import { getPosts, getPostDetails } from "../../services";
import { AdjacentPosts } from "../../sections";

// Import post validation utilities
import {
  hasValidContent,
  getContentDebugInfo,
  ensureValidContent,
  processPostContent,
} from "../../utils/postValidation";
// import Footer from "../../components/footer/Footer";

const PostDetails = ({ post, error, lastFetched }) => {
  const router = useRouter();

  // With fallback: 'blocking', we don't need to handle isFallback
  // But keeping this for backward compatibility
  if (router.isFallback) {
    return <Loader />;
  }

  // If we have an error object, display it for debugging in development
  const isDevEnvironment = process.env.NODE_ENV === "development";

  // Handle case where post might be null or undefined
  if (!post) {
    const slug = router.query.slug;

    return (
      <div className="sm:container mx-auto px-4 lg:px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <p className="text-gray-600 mb-8">
          URL: {router.asPath}
          <br />
          Slug: {slug}
        </p>

        {/* Show error details in development environment */}
        {isDevEnvironment && error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8 text-left">
            <h3 className="text-red-800 font-semibold mb-2">Error Details:</h3>
            <p className="text-red-700 mb-1">Type: {error.type}</p>
            <p className="text-red-700 mb-1">Message: {error.message}</p>
            {lastFetched && (
              <p className="text-gray-500 text-sm mt-2">
                Last attempted fetch: {new Date(lastFetched).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Debugging tools - visible in all environments */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8 mx-auto max-w-2xl">
          <h3 className="text-blue-800 font-semibold mb-2">
            Troubleshooting Options:
          </h3>
          <p className="text-blue-700 mb-4">
            This post might not exist in our content management system or there
            might be an issue with the connection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a
              href={`/api/debug-post?slug=${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              Debug Post Data
            </a>

            <a
              href={`/api/check-post?slug=${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-center"
            >
              Check Similar Posts
            </a>

            <a
              href={`/api/hygraph-schema`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
            >
              Validate Schema
            </a>

            <a
              href="https://app.hygraph.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-center"
            >
              Open Hygraph CMS
            </a>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Return to Home
          </button>
          <button
            onClick={() => router.reload()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle case where post content is missing using our utility function
  if (!hasValidContent(post)) {
    return (
      <div className="sm:container mx-auto px-4 lg:px-10 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="col-span-1 lg:col-span-8">
            <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
              <h1 className="text-3xl font-semibold mb-4">{post.title}</h1>
              <div className="border-b border-gray-200 mb-4 pb-4">
                {post.excerpt && (
                  <p className="text-lg text-gray-700">{post.excerpt}</p>
                )}
              </div>
              <div className="text-center py-10">
                <p className="text-red-500 mb-4">
                  We're having trouble loading the content for this post.
                </p>

                {isDevEnvironment && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8 text-left">
                    <h3 className="text-yellow-800 font-semibold mb-2">
                      Content Debug Info:
                    </h3>
                    {(() => {
                      // Use our utility function to get detailed content debug info
                      const debugInfo = getContentDebugInfo(post);
                      return (
                        <>
                          <p className="text-yellow-700 mb-1">
                            Content object:{" "}
                            {debugInfo.hasContent ? "exists" : "missing"}
                          </p>
                          {debugInfo.hasContent && (
                            <>
                              <p className="text-yellow-700 mb-1">
                                Content keys: {debugInfo.contentKeys.join(", ")}
                              </p>
                              <p className="text-yellow-700 mb-1">
                                Raw:{" "}
                                {debugInfo.hasRaw
                                  ? `${debugInfo.rawType} (${
                                      debugInfo.rawType === "string"
                                        ? "needs parsing"
                                        : "ready to use"
                                    })`
                                  : "missing"}
                              </p>
                              <p className="text-yellow-700 mb-1">
                                JSON:{" "}
                                {debugInfo.hasJson
                                  ? `${debugInfo.jsonType} (${
                                      debugInfo.jsonType === "string"
                                        ? "needs parsing"
                                        : "ready to use"
                                    })`
                                  : "missing"}
                              </p>
                              <p className="text-yellow-700 mt-2 font-semibold">
                                Status:{" "}
                                {debugInfo.isValid
                                  ? "Valid content available"
                                  : "No valid content found"}
                              </p>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.reload()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Try Refreshing
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/api/debug-post?slug=${post.slug}`)
                    }
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Debug Post
                  </button>
                </div>
              </div>
            </div>
            {post.author && <Author author={post.author} />}
          </div>
          <div className="col-span-1 lg:col-span-4">
            <div className="relative lg:sticky top-8">
              <PostWidget
                slug={post.slug || ""}
                categories={
                  post.categories?.map((category) => category.slug) || []
                }
              />
              <Categories />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        {/* Add structured data */}
        <SchemaManager post={post} />
      </Head>
      <div className="sm:container mx-auto px-4 lg:px-10 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 ">
          <div className="col-span-1 lg:col-span-8">
            <PostDetail post={post} />
            {/* Only render Author component if post.author exists */}
            {post.author && <Author author={post.author} />}
            {/* Ensure slug and createdAt exist before passing to AdjacentPosts */}
            {post.slug && post.createdAt && (
              <AdjacentPosts slug={post.slug} createdAt={post.createdAt} />
            )}
          </div>
          <div className="col-span-1 lg:col-span-4">
            <div className="relative lg:sticky top-8">
              <PostWidget
                slug={post.slug || ""}
                categories={
                  post.categories?.map((category) => category.slug) || []
                }
              />
              <Categories />
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </>
  );
};
export default PostDetails;

// Fetch data at build time
export async function getStaticProps({ params }) {
  try {
    console.log(`[getStaticProps] Called for slug: ${params.slug}`);

    // Special handling for known problematic slugs
    const isProblematicSlug =
      params.slug === "nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram";
    if (isProblematicSlug) {
      console.log(
        `[getStaticProps] Using special handling for problematic slug: ${params.slug}`
      );
    }

    // Add a try/catch around getPostDetails to get more detailed error information
    let data;
    try {
      // First attempt with standard getPostDetails
      data = await getPostDetails(params.slug);

      // If this is a problematic slug and we didn't get data, try a direct API call
      if (isProblematicSlug && !data) {
        console.log(
          `[getStaticProps] First attempt failed for problematic slug, trying direct API call`
        );

        // Import the direct API client
        const { gql, fetchFromCDN } = require("../services/hygraph");

        // Use a simplified query that avoids potential schema issues
        const directQuery = gql`
          query GetPostDirectly($slug: String!) {
            post(where: { slug: $slug }) {
              title
              excerpt
              featuredImage {
                url
              }
              author {
                name
                bio
                photo {
                  url
                }
              }
              createdAt
              publishedAt
              slug
              content {
                raw
              }
              categories {
                name
                slug
              }
            }
          }
        `;

        const result = await fetchFromCDN(directQuery, { slug: params.slug });
        if (result && result.post) {
          console.log(
            `[getStaticProps] Successfully fetched data directly for problematic slug`
          );
          data = result.post;
        }
      }
    } catch (fetchError) {
      console.error(
        `[getStaticProps] Error in getPostDetails for ${params.slug}:`,
        fetchError.message
      );
      console.error(`[getStaticProps] Error stack:`, fetchError.stack);

      // For problematic slugs, try one more approach with a different query structure
      if (isProblematicSlug) {
        try {
          console.log(
            `[getStaticProps] Trying fallback approach for problematic slug`
          );

          // Import the direct API client
          const { gql, fetchFromCDN } = require("../services/hygraph");

          // Use an even more simplified query as a last resort
          const fallbackQuery = gql`
            query GetPostFallback($slug: String!) {
              posts(where: { slug: $slug }, first: 1) {
                title
                excerpt
                featuredImage {
                  url
                }
                author {
                  name
                  bio
                  photo {
                    url
                  }
                }
                createdAt
                publishedAt
                slug
                content {
                  raw
                }
                categories {
                  name
                  slug
                }
              }
            }
          `;

          const result = await fetchFromCDN(fallbackQuery, {
            slug: params.slug,
          });
          if (result && result.posts && result.posts.length > 0) {
            console.log(
              `[getStaticProps] Successfully fetched data with fallback approach`
            );
            data = result.posts[0];
          }
        } catch (fallbackError) {
          console.error(
            `[getStaticProps] Fallback approach also failed:`,
            fallbackError.message
          );
        }
      }

      // If we still don't have data, return the error
      if (!data) {
        return {
          props: {
            post: null,
            error: {
              message: fetchError.message,
              type: "FETCH_ERROR",
            },
          },
          // Shorter revalidation time for error cases
          revalidate: 30,
        };
      }
    }

    // Log detailed information about the result
    if (!data) {
      console.error(
        `[getStaticProps] No post data returned for slug: ${params.slug}`
      );

      return {
        props: {
          post: null,
          error: {
            message: "No data returned from API",
            type: "NO_DATA",
          },
        },
        // Shorter revalidation time for missing posts
        revalidate: 30,
      };
    }

    console.log(
      `[getStaticProps] Successfully fetched post data for slug: ${
        params.slug
      }, title: ${data.title || "NO TITLE"}`
    );

    // Log the structure of the post data
    const dataKeys = Object.keys(data);
    console.log(`[getStaticProps] Post data structure: ${dataKeys.join(", ")}`);

    // Log the structure of the post data
    const debugInfo = getContentDebugInfo(data);
    console.log(`[getStaticProps] Post content debug info:`, debugInfo);

    // Ensure the post has valid content structure
    data = ensureValidContent(data);

    // Add default featured image if missing
    if (!data.featuredImage) {
      console.warn(
        `[getStaticProps] Post for slug: ${params.slug} is missing featuredImage`
      );
      // Add a default featured image to prevent errors
      data.featuredImage = {
        url: "/default-image.jpg",
      };
    }

    // Process post content (parse strings if needed)
    data = processPostContent(data, (message) => {
      console.log(`[getStaticProps] ${message}`);
    });

    return {
      props: {
        post: data,
        lastFetched: new Date().toISOString(),
      },
      // Add revalidation to refresh the page every 1 minute
      revalidate: 60,
    };
  } catch (error) {
    console.error(
      `[getStaticProps] Unhandled error for ${params.slug}:`,
      error.message
    );
    console.error(`[getStaticProps] Error stack: ${error.stack}`);

    // Return null post instead of failing
    return {
      props: {
        post: null,
        error: {
          message: error.message,
          type: "UNHANDLED_ERROR",
        },
      },
      // Shorter revalidation time for error cases
      revalidate: 30,
    };
  }
}

// Specify dynamic routes to pre-render pages based on data.
// The HTML is generated at build time and will be reused on each request.
export async function getStaticPaths() {
  try {
    console.log(
      "[getStaticPaths] Optimized post fetching for build performance"
    );

    // Define a maximum number of posts to fetch for static generation
    // This significantly improves build time while still pre-rendering the most important content
    const POST_LIMIT = 30; // Increased from 15 to include more posts in the static build

    // We're using the optimized getPosts function with caching built-in
    // This is much faster than fetching all posts with full content

    // Get post slugs with the optimized getPosts function
    const posts = await getPosts({
      limit: POST_LIMIT,
      fields: "minimal",
      forStaticPaths: true,
    });

    // Extract just the slugs from the posts
    const allSlugs = posts
      .filter((post) => post.node && post.node.slug)
      .map((post) => post.node.slug);

    console.log(`[getStaticPaths] Found ${allSlugs.length} valid posts`);

    // Add specific slugs that we know should exist but might be missing from the API response
    // Include the problematic slug explicitly
    const knownSlugs = [
      "marvel-benedict-cumberbatch-mcu-anchor",
      "ipl-media-rights-cofused-about-packages",
      "ipl-2025-riyan-parag-six-consecutive-sixes-kkr-vs-rr",
      "nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram", // The problematic slug
      // Add any other known slugs here
    ];

    // Create a set of existing slugs from the API
    const existingSlugs = new Set(allSlugs);

    // Add missing known slugs to our paths
    const additionalSlugs = knownSlugs.filter(
      (slug) => !existingSlugs.has(slug)
    );

    if (additionalSlugs.length > 0) {
      console.log(
        `[getStaticPaths] Adding ${
          additionalSlugs.length
        } known slugs that were missing from API response: ${additionalSlugs.join(
          ", "
        )}`
      );
    }

    // For better performance, we'll pre-render all known slugs plus a subset of recent posts
    // This ensures important pages are pre-rendered while keeping build times reasonable
    const recentSlugs = allSlugs.slice(0, POST_LIMIT); // Pre-render limited number of posts

    // Combine API posts with additional known slugs
    const pathsFromPosts = recentSlugs.map((slug) => ({
      params: { slug },
    }));
    const pathsFromKnownSlugs = additionalSlugs.map((slug) => ({
      params: { slug },
    }));
    const allPaths = [...pathsFromPosts, ...pathsFromKnownSlugs];

    console.log(`[getStaticPaths] Pre-rendering ${allPaths.length} posts`);

    // Explicitly log the problematic slug to confirm it's included
    const isProblematicSlugIncluded = allPaths.some(
      (path) =>
        path.params.slug ===
        "nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram"
    );
    console.log(
      `[getStaticPaths] Is problematic slug included? ${
        isProblematicSlugIncluded ? "YES" : "NO"
      }`
    );

    return {
      paths: allPaths,
      // Use 'blocking' to wait for the page to be generated on-demand
      // This is crucial for pages not included in the static build
      fallback: "blocking",
    };
  } catch (error) {
    console.error("[getStaticPaths] Error:", error);

    // If we can't fetch posts, at least pre-render the known problematic slugs
    const fallbackSlugs = [
      "marvel-benedict-cumberbatch-mcu-anchor",
      "ipl-media-rights-cofused-about-packages",
      "ipl-2025-riyan-parag-six-consecutive-sixes-kkr-vs-rr",
      "nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram", // The problematic slug
    ];

    console.log(
      `[getStaticPaths] Using fallback slugs due to error: ${fallbackSlugs.join(
        ", "
      )}`
    );

    return {
      paths: fallbackSlugs.map((slug) => ({ params: { slug } })),
      fallback: "blocking",
    };
  }
}
