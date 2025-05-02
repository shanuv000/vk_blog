import React from "react";
import Head from "next/head";
import Seo from "./Seo";
const HeadPostDetails = ({ post }) => {
  const root_url = "https://blog.urtechy.com";

  return (
    <Head>
      <Seo post={post} />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta property="og:title" content={post.title} />
      <meta
        property="og:image"
        itemprop="image"
        content={post.featuredImage.url}
      />
      <meta property="fb:app_id" content="360526089887305" />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:url" content={`${root_url}/post/${post.slug}`} />
      <meta property="og:updated_time" content={post.createdAt} />
      <meta property="og:type" content="website" />
      <title>{post.title}</title>
      <meta
        name="viewport"
        content="width=device-width,minimum-scale=1, initial-scale=1"
      />
      <meta property="article:author" content={post.author.name} />
      {/* twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@shanuv0000" />
      <meta name="twitter:creator" content="@shanuv000" />
      <meta property="og:url" content={`${root_url}/post/${post.slug}`} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:image" content={post.featuredImage.url} />
    </Head>
  );
};

export default HeadPostDetails;
