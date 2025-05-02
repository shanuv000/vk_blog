import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  PostDetail,
  Categories,
  PostWidget,
  Author,
  Comments,
  CommentsForm,
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
            {/* Only render CommentsForm if post.slug exists */}
            {post.slug && <CommentsForm slug={post.slug} />}
            {/* Only render Comments if post.slug exists */}
            {post.slug && <Comments slug={post.slug} />}
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
    const data = await getPostDetails(params.slug);

    // If no post is found, return null (will be handled by the component)
    if (!data) {
      return {
        props: { post: null },
        // Shorter revalidation time for missing posts
        revalidate: 60,
      };
    }

    return {
      props: { post: data },
      // Add revalidation to refresh the page every 1 minute
      revalidate: 60,
    };
  } catch (error) {
    console.error(`Error fetching post details for ${params.slug}:`, error);

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
  const posts = await getPosts();
  return {
    paths: posts.map(({ node: { slug } }) => ({ params: { slug } })),
    // Use 'blocking' to wait for the page to be generated on-demand
    fallback: "blocking",
  };
}
