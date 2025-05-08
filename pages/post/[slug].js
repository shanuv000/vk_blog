import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  PostDetail,
  Categories,
  PostWidget,
  Author,
  Loader,
} from "../../components";
import SchemaManager from "../../components/SchemaManager";
import { getPosts, getPostDetails } from "../../services";
import { AdjacentPosts } from "../../sections";
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
    return (
      <div className="sm:container mx-auto px-4 lg:px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-8">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <p className="text-gray-600 mb-8">
          URL: {router.asPath}
          <br />
          Slug: {router.query.slug}
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

  // Handle case where post content is missing
  if (!post.content || (!post.content.raw && !post.content.json)) {
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
                    <p className="text-yellow-700 mb-1">
                      Content object: {post.content ? "exists" : "missing"}
                    </p>
                    {post.content && (
                      <>
                        <p className="text-yellow-700 mb-1">
                          Content keys: {Object.keys(post.content).join(", ")}
                        </p>
                        <p className="text-yellow-700 mb-1">
                          Raw:{" "}
                          {post.content.raw
                            ? typeof post.content.raw === "string"
                              ? "string"
                              : "object"
                            : "missing"}
                        </p>
                        <p className="text-yellow-700 mb-1">
                          JSON:{" "}
                          {post.content.json
                            ? typeof post.content.json === "string"
                              ? "string"
                              : "object"
                            : "missing"}
                        </p>
                      </>
                    )}
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
                      (window.location.href = `/api/debug-post?slug=${post.slug}`)
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

    // Add a try/catch around getPostDetails to get more detailed error information
    let data;
    try {
      data = await getPostDetails(params.slug);
    } catch (fetchError) {
      console.error(
        `[getStaticProps] Error in getPostDetails for ${params.slug}:`,
        fetchError.message
      );
      console.error(`[getStaticProps] Error stack:`, fetchError.stack);

      // Return null post instead of failing
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

    // Check for critical fields
    if (!data.content) {
      console.warn(
        `[getStaticProps] Post for slug: ${params.slug} is missing content property entirely`
      );

      // Create a minimal content object to prevent errors
      data.content = { raw: null };
    } else {
      const contentKeys = Object.keys(data.content);
      console.log(
        `[getStaticProps] Content structure: ${contentKeys.join(", ")}`
      );

      // Check for raw content
      if (!data.content.raw) {
        console.warn(
          `[getStaticProps] Post for slug: ${params.slug} is missing content.raw`
        );

        // Create an empty raw content to prevent errors
        data.content.raw = null;
      }
    }

    if (!data.featuredImage) {
      console.warn(
        `[getStaticProps] Post for slug: ${params.slug} is missing featuredImage`
      );
      // Add a default featured image to prevent errors
      data.featuredImage = {
        url: "/default-image.jpg",
      };
    }

    // Ensure the content structure is valid
    if (data.content) {
      // Handle raw content
      if (data.content.raw) {
        // If we have raw content but it's a string, try to parse it
        if (typeof data.content.raw === "string") {
          try {
            data.content.raw = JSON.parse(data.content.raw);
            console.log(
              `[getStaticProps] Successfully parsed content.raw string to object`
            );
          } catch (parseError) {
            console.error(
              `[getStaticProps] Failed to parse content.raw string:`,
              parseError.message
            );
            // Keep as string if parsing fails - don't set to null
            console.log(`[getStaticProps] Keeping raw content as string`);
          }
        }
      }

      // Handle json content
      if (data.content.json) {
        // If we have json content but it's a string, try to parse it
        if (typeof data.content.json === "string") {
          try {
            data.content.json = JSON.parse(data.content.json);
            console.log(
              `[getStaticProps] Successfully parsed content.json string to object`
            );
          } catch (parseError) {
            console.error(
              `[getStaticProps] Failed to parse content.json string:`,
              parseError.message
            );
            // Keep as string if parsing fails - don't set to null
            console.log(`[getStaticProps] Keeping json content as string`);
          }
        }
      }

      // If neither raw nor json content is available, create a minimal content object
      if (!data.content.raw && !data.content.json) {
        console.warn(
          `[getStaticProps] Post for slug: ${params.slug} is missing both raw and json content`
        );
        // Create a minimal content object to prevent errors
        data.content = {
          raw: null,
          json: null,
        };
      }
    }

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
    console.log("Fetching posts for getStaticPaths");
    const posts = await getPosts();

    // Filter out any posts that don't have a slug
    const validPosts = posts.filter((post) => post.node && post.node.slug);

    console.log(
      `Found ${validPosts.length} valid posts out of ${posts.length} total posts`
    );

    // Only pre-render the most recent posts to speed up build time
    // Other posts will be generated on-demand using fallback: 'blocking'
    const recentPosts = validPosts.slice(0, 10); // Only pre-render the 10 most recent posts

    console.log(`Pre-rendering ${recentPosts.length} recent posts`);

    return {
      paths: recentPosts.map(({ node: { slug } }) => ({ params: { slug } })),
      // Use 'blocking' to wait for the page to be generated on-demand
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);

    // Return empty paths array but still use blocking fallback
    // This ensures the site builds even if we can't fetch posts
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}
