import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";

// Import components using the organization's established pattern
import {
  PostDetail,
  Loader,
  SchemaManager,
} from "../../components";
import LazySidebar from "../../components/LazySidebar";

// Import data hooks instead of direct service calls
import { usePostDetails } from "../../hooks/useApolloQueries";
import { AdjacentPosts } from "../../sections";
import { getPosts, getPostDetails } from "../../services";

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
              href="/api/hygraph-schema"
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
          </div>
          <div className="col-span-1 lg:col-span-4">
            <LazySidebar
              slug={post.slug || ""}
              categories={
                post.categories?.map((category) => category.slug) || []
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add structured data */}
      <SchemaManager post={post} />
      <div className="sm:container mx-auto px-0 sm:px-4 lg:px-10 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12">
          <div className="col-span-1 lg:col-span-8">
            <PostDetail post={post} />
            {/* Ensure slug and createdAt exist before passing to AdjacentPosts */}
            {post.slug && post.createdAt && (
              <AdjacentPosts slug={post.slug} createdAt={post.createdAt} />
            )}
          </div>
          <div className="col-span-1 lg:col-span-4">
            <LazySidebar
              slug={post.slug || ""}
              categories={
                post.categories?.map((category) => category.slug) || []
              }
            />
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
    if (process.env.NODE_ENV === "development") {
      console.log(`[getStaticProps] Called for slug: ${params.slug}`);
    }

    // IMPORTANT: We're now treating ALL posts as potentially problematic
    // This ensures maximum compatibility and resilience
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getStaticProps] Using optimized data fetching for: ${params.slug}`
      );
    }

    // We'll try multiple approaches to fetch the post data
    // This ensures we get the data even if one approach fails
    let data = null;
    const fetchErrors = [];

    // For Vercel production, we'll use a more direct approach
    // This helps reduce build time and avoid timeouts

    // Approach 1: Standard getPostDetails function
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Attempt 1: Using standard getPostDetails`
        );
      }
      data = await getPostDetails(params.slug);

      if (data) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[getStaticProps] Attempt 1 succeeded for: ${params.slug}`
          );
        }

        // Early return for successful fetch to optimize build time
        // Process the data minimally before returning
        data = ensureValidContent(data);
        data = processPostContent(data, (message) => {
          if (process.env.NODE_ENV === "development") {
            console.log(`[getStaticProps] ${message}`);
          }
        });

        return {
          props: {
            post: data,
            lastFetched: new Date().toISOString(),
          },
          // Use a longer revalidation time for successful fetches
          revalidate: 60 * 60, // 1 hour
        };
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[getStaticProps] Attempt 1 returned no data for: ${params.slug}`
          );
        }
      }
    } catch (error1) {
      console.error(`[getStaticProps] Attempt 1 failed:`, error1.message);
      fetchErrors.push({ approach: "standard", error: error1.message });
    }

    // Approach 2: Direct API call with simplified query
    if (!data) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[getStaticProps] Attempt 2: Using direct API call with simplified query`
          );
        }

        // Import the direct API client
        const { gql, fetchFromCDN } = require("../../services/hygraph");

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
              recentUpdates
            }
          }
        `;

        const result = await fetchFromCDN(directQuery, { slug: params.slug });
        if (result && result.post) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[getStaticProps] Attempt 2 succeeded for: ${params.slug}`
            );
          }
          data = result.post;

          // Early return for successful fetch to optimize build time
          data = ensureValidContent(data);
          data = processPostContent(data, (message) => {
            if (process.env.NODE_ENV === "development") {
              console.log(`[getStaticProps] ${message}`);
            }
          });

          return {
            props: {
              post: data,
              lastFetched: new Date().toISOString(),
            },
            // Use a longer revalidation time for successful fetches
            revalidate: 60 * 60, // 1 hour
          };
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[getStaticProps] Attempt 2 returned no data for: ${params.slug}`
            );
          }
        }
      } catch (error2) {
        console.error(`[getStaticProps] Attempt 2 failed:`, error2.message);
        fetchErrors.push({ approach: "direct", error: error2.message });
      }
    }

    // Approach 3: Collection query instead of single post query
    if (!data) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[getStaticProps] Attempt 3: Using posts collection query`
          );
        }

        // Import the direct API client
        const { gql, fetchFromCDN } = require("../../services/hygraph");

        // Use a query that fetches from the posts collection instead of a single post
        const collectionQuery = gql`
          query GetPostFromCollection($slug: String!) {
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
              recentUpdates
            }
          }
        `;

        const result = await fetchFromCDN(collectionQuery, {
          slug: params.slug,
        });
        if (result && result.posts && result.posts.length > 0) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[getStaticProps] Attempt 3 succeeded for: ${params.slug}`
            );
          }
          data = result.posts[0];
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[getStaticProps] Attempt 3 returned no data for: ${params.slug}`
            );
          }
        }
      } catch (error3) {
        console.error(`[getStaticProps] Attempt 3 failed:`, error3.message);
        fetchErrors.push({ approach: "collection", error: error3.message });
      }
    }

    // Approach 4: Minimal query with only essential fields
    if (!data) {
      try {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[getStaticProps] Attempt 4: Using minimal query with essential fields only`
          );
        }

        // Import the direct API client
        const { gql, fetchFromCDN } = require("../../services/hygraph");

        // Use an extremely minimal query with only the most essential fields
        const minimalQuery = gql`
          query GetPostMinimal($slug: String!) {
            post(where: { slug: $slug }) {
              title
              slug
              content {
                raw
              }
            }
          }
        `;

        const result = await fetchFromCDN(minimalQuery, { slug: params.slug });
        if (result && result.post) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[getStaticProps] Attempt 4 succeeded for: ${params.slug}`
            );
          }
          // This will be a partial post object, but we'll fill in defaults later
          data = result.post;
        } else {
          if (process.env.NODE_ENV === "development") {
            console.log(
              `[getStaticProps] Attempt 4 returned no data for: ${params.slug}`
            );
          }
        }
      } catch (error4) {
        console.error(`[getStaticProps] Attempt 4 failed:`, error4.message);
        fetchErrors.push({ approach: "minimal", error: error4.message });
      }
    }

    // If we still don't have data after all attempts, return an error
    if (!data) {
      console.error(
        `[getStaticProps] All attempts failed for slug: ${params.slug}`
      );
      console.error(
        `[getStaticProps] Errors:`,
        JSON.stringify(fetchErrors, null, 2)
      );

      return {
        props: {
          post: null,
          error: {
            message: "Failed to fetch post data after multiple attempts",
            type: "ALL_ATTEMPTS_FAILED",
            details: fetchErrors,
          },
        },
        // Use a shorter revalidation time for error cases
        // This will try again sooner in case the issue is temporary
        revalidate: 30,
      };
    }

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getStaticProps] Successfully fetched post data for slug: ${
          params.slug
        }, title: ${data.title || "NO TITLE"}`
      );
    }

    // Log the structure of the post data
    const dataKeys = Object.keys(data);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getStaticProps] Post data structure: ${dataKeys.join(", ")}`
      );
    }

    // Ensure the post has all required fields with defaults if missing

    // Add default excerpt if missing
    if (!data.excerpt) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Adding default excerpt for: ${params.slug}`
        );
      }
      data.excerpt = data.title || "Read this interesting post";
    }

    // Add default featured image if missing
    if (!data.featuredImage) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Adding default featuredImage for: ${params.slug}`
        );
      }
      data.featuredImage = {
        url: "/default-image.jpg",
      };
    }

    // Author section has been removed from the UI
    // but we'll keep the data for schema purposes
    if (!data.author) {
      if (process.env.NODE_ENV === "development") {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[getStaticProps] Adding default author for schema: ${params.slug}`
          );
        }
      }
      data.author = {
        name: "urTechy",
        bio: "Tech enthusiast and blogger",
        photo: {
          url: "/images/placeholder-author.jpg",
        },
      };
    }

    // Add default categories if missing
    if (!data.categories || !data.categories.length) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Adding default category for: ${params.slug}`
        );
      }
      data.categories = [
        {
          name: "Uncategorized",
          slug: "uncategorized",
        },
      ];
    }

    // Add default dates if missing
    if (!data.createdAt) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Adding default createdAt for: ${params.slug}`
        );
      }
      data.createdAt = new Date().toISOString();
    }

    if (!data.publishedAt) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Adding default publishedAt for: ${params.slug}`
        );
      }
      data.publishedAt = data.createdAt || new Date().toISOString();
    }

    // Ensure the post has valid content structure
    data = ensureValidContent(data);

    // Process post content (parse strings if needed)
    data = processPostContent(data, (message) => {
      if (process.env.NODE_ENV === "development") {
        if (process.env.NODE_ENV === "development") {
          console.log(`[getStaticProps] ${message}`);
        }
      }
    });

    // Log debug info after processing
    const debugInfo = getContentDebugInfo(data);
    if (process.env.NODE_ENV === "development") {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticProps] Post content debug info after processing:`,
          debugInfo
        );
      }
    }

    return {
      props: {
        post: data,
        lastFetched: new Date().toISOString(),
      },
      // Use a longer revalidation time for successful fetches
      // This reduces the load on your CMS while still keeping content fresh
      revalidate: 60 * 60, // 1 hour
    };
  } catch (error) {
    console.error(
      `[getStaticProps] Unhandled error for ${params.slug}:`,
      error.message
    );
    console.error(`[getStaticProps] Error stack:`, error.stack);

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
    if (process.env.NODE_ENV === "development") {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[getStaticPaths] Using minimal static generation approach for Vercel"
        );
      }
    }

    // Define a list of critical posts that must be pre-rendered
    // Keep this list very small to avoid build timeouts
    const criticalSlugs = [
      // Known problematic slugs that must be pre-rendered
      "nvidia-rtx-5060-ti-8gb-performance-issues-pcie-4-0-vram",
      "marvel-benedict-cumberbatch-mcu-anchor",
      "ipl-media-rights-cofused-about-packages",
      "ipl-2025-riyan-parag-six-consecutive-sixes-kkr-vs-rr",
    ];

    if (process.env.NODE_ENV === "development") {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getStaticPaths] Pre-rendering only ${criticalSlugs.length} critical posts`
        );
      }
    }

    // Create paths array for Next.js with just these critical slugs
    const paths = criticalSlugs.map((slug) => ({
      params: { slug },
    }));

    // IMPORTANT: We're returning a minimal paths array and relying entirely on
    // fallback: 'blocking' to handle all pages. This ensures that:
    // 1. Build times are extremely fast
    // 2. All pages will work, even if not explicitly included
    // 3. The first request to any page will generate the static HTML
    // 4. Subsequent requests will use the cached HTML

    return {
      // Only include the critical slugs in the static build
      paths,

      // CRITICAL: Use 'blocking' to ensure all other posts are generated on-demand
      // This means the first request to any post not in the paths array will be server-rendered
      // and then cached for subsequent visitors
      fallback: "blocking",
    };
  } catch (error) {
    console.error("[getStaticPaths] Unhandled error:", error);

    // Even in case of a complete failure, we'll still return a valid configuration
    // with fallback: 'blocking' to ensure all posts can be generated on-demand
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}
