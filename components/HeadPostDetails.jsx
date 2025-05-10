import React from "react";
import Head from "next/head";
import Seo from "./Seo";

/**
 * HeadPostDetails component for post-specific SEO
 * @param {Object} props - Component props
 * @param {Object} props.post - The post data
 * @returns {JSX.Element} - Head component with SEO tags
 */
const HeadPostDetails = ({ post }) => {
  const root_url = "https://blog.urtechy.com";

  return (
    <>
      {/* Use NextSeo component for consistent SEO implementation */}
      <Seo post={post} />

      <Head>
        {/* Essential meta tags not covered by NextSeo */}
        <meta charSet="utf-8" />
        <meta property="fb:app_id" content="360526089887305" />

        {/* Article-specific meta tags */}
        <meta
          property="article:author"
          content={post.author?.name || "urTechy Blogs"}
        />
        <meta
          property="article:published_time"
          content={post.publishedAt || post.createdAt}
        />
        <meta
          property="article:modified_time"
          content={post.updatedAt || post.createdAt}
        />

        {/* Add keywords based on categories if available */}
        {post.categories && post.categories.length > 0 && (
          <meta
            name="keywords"
            content={
              post.categories.map((cat) => cat.name).join(", ") +
              ", urTechy, blogs, technology, news"
            }
          />
        )}
      </Head>
    </>
  );
};

export default HeadPostDetails;
