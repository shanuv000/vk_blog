import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextSeo } from "next-seo";

import { getCategories, getCategoryPost } from "../../services";
import { PostCard, Categories, Loader } from "../../components";
import SchemaManager from "../../components/SchemaManager";

const CategoryPost = ({ posts }) => {
  const router = useRouter();

  // With fallback: 'blocking', we don't need to handle isFallback
  // But keeping this for backward compatibility
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

  // Get category name from the first post
  const categoryName =
    posts.length > 0 && posts[0].node.categories
      ? posts[0].node.categories.find((cat) => cat.slug === router.query.slug)
          ?.name
      : router.query.slug;

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
    </>
  );
};
export default CategoryPost;

// Fetch data at build time
export async function getStaticProps({ params }) {
  try {
    const posts = await getCategoryPost(params.slug);

    return {
      props: { posts },
      // Add revalidation to refresh the page every 1 minute
      revalidate: 60,
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
