import React from "react";
import ArticleSchema from "./ArticleSchema";
import BreadcrumbSchema from "./BreadcrumbSchema";
import WebsiteSchema from "./WebsiteSchema";
import ListItemSchema from "./ListItemSchema";

/**
 * SchemaManager component for managing all structured data schemas
 * @param {Object} props - Component props
 * @param {Object} props.post - The post data (optional, for article pages)
 * @param {boolean} props.isHomePage - Whether the current page is the homepage
 * @param {Array} props.posts - Array of posts (optional, for list pages)
 * @param {string} props.categoryName - Name of the category (optional, for category pages)
 * @returns {JSX.Element} - Fragment containing all relevant schema components
 */
const SchemaManager = ({ post, isHomePage = false, posts, categoryName }) => {
  return (
    <>
      {/* Website schema for all pages */}
      <WebsiteSchema />

      {/* Article and Breadcrumb schemas for post pages */}
      {post && (
        <>
          <ArticleSchema post={post} />
          <BreadcrumbSchema post={post} />
        </>
      )}

      {/* ItemList schema for pages with post lists */}
      {posts && posts.length > 0 && (
        <ListItemSchema posts={posts} categoryName={categoryName} />
      )}
    </>
  );
};

export default SchemaManager;
