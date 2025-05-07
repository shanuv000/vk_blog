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

const PostDetails = ({ post }) => {
  const router = useRouter();

  // With fallback: 'blocking', we don't need to handle isFallback
  // But keeping this for backward compatibility
  if (router.isFallback) {
    return <Loader />;
  }

  // Handle case where post might be null or undefined
  if (!post) {
    return (
      <div className="sm:container mx-auto px-4 lg:px-10 mb-8 text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="mb-8">
          The post you're looking for doesn't exist or has been removed.
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
    console.log(`getStaticProps called for slug: ${params.slug}`);
    const data = await getPostDetails(params.slug);

    // Log detailed information about the result
    if (!data) {
      console.error(`No post data returned for slug: ${params.slug}`);
    } else {
      console.log(
        `Successfully fetched post data for slug: ${params.slug}, title: ${data.title}`
      );

      // Log the structure of the post data
      console.log(`Post data structure: ${Object.keys(data).join(", ")}`);

      // Check for critical fields
      if (!data.content) {
        console.warn(
          `Post for slug: ${params.slug} is missing content property entirely`
        );
      } else {
        console.log(
          `Content structure: ${Object.keys(data.content).join(", ")}`
        );

        // Check for raw and json content
        if (!data.content.raw && !data.content.json) {
          console.warn(
            `Post for slug: ${params.slug} is missing both content.raw and content.json`
          );
        }

        // Check for references
        if (data.content.references) {
          console.log(`References count: ${data.content.references.length}`);
        } else {
          console.warn(`Post for slug: ${params.slug} has no references array`);
        }
      }

      if (!data.featuredImage) {
        console.warn(`Post for slug: ${params.slug} is missing featuredImage`);
      }
    }

    // If no post is found, return null (will be handled by the component)
    if (!data) {
      return {
        props: { post: null },
        // Shorter revalidation time for missing posts
        revalidate: 60,
      };
    }

    // Ensure the content structure is valid
    if (data.content) {
      // If we have json content but it's a string, try to parse it
      if (data.content.json && typeof data.content.json === "string") {
        try {
          data.content.json = JSON.parse(data.content.json);
          console.log(`Successfully parsed content.json string to object`);
        } catch (parseError) {
          console.error(`Failed to parse content.json string:`, parseError);
        }
      }

      // If we have raw content but it's a string, try to parse it
      if (data.content.raw && typeof data.content.raw === "string") {
        try {
          data.content.raw = JSON.parse(data.content.raw);
          console.log(`Successfully parsed content.raw string to object`);
        } catch (parseError) {
          console.error(`Failed to parse content.raw string:`, parseError);
        }
      }

      // Ensure references is always an array
      if (!data.content.references) {
        data.content.references = [];
        console.log(`Added empty references array to content`);
      } else if (!Array.isArray(data.content.references)) {
        console.warn(`References is not an array, converting to array`);
        data.content.references = Object.values(data.content.references);
      }
    }

    return {
      props: { post: data },
      // Add revalidation to refresh the page every 1 minute
      revalidate: 60,
    };
  } catch (error) {
    console.error(`Error fetching post details for ${params.slug}:`, error);
    console.error(`Error stack: ${error.stack}`);

    // Return null post instead of failing
    return {
      props: { post: null },
      // Shorter revalidation time for error cases
      revalidate: 60,
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
