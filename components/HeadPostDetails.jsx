import React from "react";

const HeadPostDetails = ({ post }) => {
  return (
    <>
      {/* <Seo post={post} /> */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta property="og:title" content={post.title} />
      <meta
        property="og:image"
        itemprop="image"
        content={post.featuredImage.url}
      />
      <meta property="fb:app_id" content="677336189940107" />
      <meta property="og:description" content={post.excerpt} />
      <meta
        property="og:url"
        content={`http://www.keytosuccess.me/post/${post.slug}`}
      />
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
      <meta name="twitter:creator" content="@shanuv0000" />
      <meta
        property="og:url"
        content={`http://www.keytosuccess.me/post/${post.slug}`}
      />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:image" content={post.featuredImage.url} />
      {/* twitter */}
      {/* google Ad */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5634941748977646"
        crossorigin="anonymous"
      ></script>
      {/* <script async src={google_client_id} crossorigin="anonymous"></script> */}
      {/* google Ad */}
    </>
  );
};

export default HeadPostDetails;
