import React from 'react';
import JsonLd from './JsonLd';

/**
 * ListItemSchema component for generating ItemList schema structured data
 * @param {Object} props - Component props
 * @param {Array} props.posts - Array of posts
 * @param {string} props.categoryName - Name of the category (optional)
 * @returns {JSX.Element} - JsonLd component with ItemList schema
 */
const ListItemSchema = ({ posts, categoryName }) => {
  if (!posts || posts.length === 0) return null;

  const rootUrl = 'https://blog.urtechy.com';
  
  // Create list items
  const listItems = posts.map((post, index) => {
    const postUrl = `${rootUrl}/post/${post.slug}`;
    
    return {
      '@type': 'ListItem',
      position: index + 1,
      url: postUrl,
      name: post.title,
      image: post.featuredImage?.url || `${rootUrl}/logo/logo4.png`,
      description: post.excerpt || '',
    };
  });

  // Prepare list schema
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: listItems,
    numberOfItems: listItems.length,
  };

  // Add category name if available
  if (categoryName) {
    listSchema.name = `${categoryName} Articles - urTechy Blogs`;
  } else {
    listSchema.name = 'Latest Articles - urTechy Blogs';
  }

  return <JsonLd data={listSchema} />;
};

export default ListItemSchema;
