import React from "react";
import moment from "moment";
import { DEFAULT_AVATAR, DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import JsonLd from "./JsonLd";

/**
 * ArticleSchema component for generating Article schema structured data
 * @param {Object} props - Component props
 * @param {Object} props.post - The post data
 * @returns {JSX.Element} - JsonLd component with Article schema
 */
const ArticleSchema = ({ post }) => {
  if (!post) {return null;}

  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${post.slug}`;

  // Format dates in ISO format
  const datePublished =
    post.publishedAt || post.createdAt || new Date().toISOString();
  const dateModified = post.createdAt || datePublished;

  // Prepare author data
  const author = {
    "@type": "Person",
    name: post.author?.name || "urTechy Blogs",
    url: rootUrl,
  };

  // If author has image, add it
  if (post.author?.photo?.url) {
    author.image = {
      "@type": "ImageObject",
      url: post.author.photo.url,
    };
  }

  // Prepare publisher data
  const publisher = {
    "@type": "Organization",
    name: "urTechy Blogs",
    logo: {
      "@type": "ImageObject",
      url: `${rootUrl}/logo/logo4.png`,
      width: 573,
      height: 600,
    },
  };

  // Prepare article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage?.url || DEFAULT_FEATURED_IMAGE,
    datePublished: moment(datePublished).toISOString(),
    dateModified: moment(dateModified).toISOString(),
    author,
    publisher,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
  };

  // Add categories as keywords if available
  if (post.categories && post.categories.length > 0) {
    articleSchema.keywords = post.categories
      .map((category) => category.name)
      .join(", ");
  }

  return <JsonLd data={articleSchema} />;
};

export default ArticleSchema;
