import React from "react";
import { useRouter } from "next/router";

import { getCategories, getCategoryPost } from "../../services";
import { PostCard, Categories, Loader } from "../../components";

const CategoryPost = ({ posts }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <Loader />;
  }

  // Handle case where posts might be null or empty
  if (!posts || posts.length === 0) {
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

  return (
    <div className="container mx-auto px-10 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="col-span-1 lg:col-span-8">
          {posts.map((post, index) => (
            <PostCard key={post.node.slug || index} post={post.node} />
          ))}
        </div>
        <div className="col-span-1 lg:col-span-4">
          <div className="relative lg:sticky top-8">
            <Categories />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CategoryPost;

// Fetch data at build time
export async function getStaticProps({ params }) {
  try {
    const posts = await getCategoryPost(params.slug);

    return {
      props: { posts },
      // Add revalidation to refresh the page every 10 minutes
      revalidate: 600,
    };
  } catch (error) {
    console.error(`Error fetching category posts for ${params.slug}:`, error);

    // Return empty posts array instead of failing
    return {
      props: { posts: [] },
      // Shorter revalidation time for error cases
      revalidate: 60,
    };
  }
}

// Specify dynamic routes to pre-render pages based on data.
// The HTML is generated at build time and will be reused on each request.
export async function getStaticPaths() {
  const categories = await getCategories();

  return {
    paths: categories.map(({ slug }) => ({ params: { slug } })),
    fallback: true,
  };
}
