import React from "react";
import JsonLd from "./JsonLd";

/**
 * BreadcrumbSchema component for generating BreadcrumbList schema structured data
 * @param {Object} props - Component props
 * @param {Object} props.post - The post data
 * @returns {JSX.Element} - JsonLd component with BreadcrumbList schema
 */
const BreadcrumbSchema = ({ post }) => {
  if (!post) return null;

  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${post.slug}`;

  // Create breadcrumb items
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: rootUrl,
    },
  ];

  // Add category if available
  if (post.categories && post.categories.length > 0) {
    const category = post.categories[0]; // Use the first category
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: category.name,
      item: `${rootUrl}/category/${category.slug}`,
    });

    // Add post as the final item
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: post.title,
      item: postUrl,
    });
  } else {
    // If no category, add post as the second item
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: post.title,
      item: postUrl,
    });
  }

  // Prepare breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  return <JsonLd data={breadcrumbSchema} />;
};

export default BreadcrumbSchema;
