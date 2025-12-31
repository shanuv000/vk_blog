/**
 * Optimized and consolidated Hygraph queries
 * Reduces duplication and ensures consistent performance patterns
 */

import { gql } from "graphql-request";

// Query validation and optimization helpers
export const validateLimit = (limit, min = 1, max = 50, defaultValue = 12) => {
  const validated = Math.min(
    Math.max(parseInt(limit) || defaultValue, min),
    max
  );

  if (limit !== validated) {
    console.warn(
      `[QueryValidation] Limit ${limit} adjusted to ${validated} for performance`
    );
  }

  return validated;
};

// Image transformation parameters removed to avoid Hygraph 402 quota errors
// Next.js handles all image optimization via next/image component
const IMAGE_TRANSFORMS = {
  featuredImage: "",
  authorPhoto: "",
  thumbnail: "",
};

// Base query fragments for reusability
export const QUERY_FRAGMENTS = {
  authorBasic: `
    author {
      name
      id
      photo {
        url
      }
    }
  `,

  authorFull: `
    author {
      name
      bio
      id
      photo {
        url
      }
    }
  `,

  featuredImageOptimized: `
    featuredImage {
      url
      width
      height
    }
  `,

  thumbnailImage: `
    featuredImage {
      url
    }
  `,

  categoriesBasic: `
    categories {
      name
      slug
    }
  `,

  tagsBasic: `
    tags {
      id
      name
      slug
      color {
        hex
      }
    }
  `,

  contentFull: `
    content {
      raw
      json
      references {
        ... on Asset {
          id
          url
          mimeType
          width
          height
        }
      }
    }
  `,

  postBasicFields: `
    slug
    title
    createdAt
    publishedAt
  `,
};

// Consolidated and optimized queries
export const OPTIMIZED_QUERIES = {
  // Posts with different detail levels
  POSTS_MINIMAL: gql`
    query GetPostsMinimal($limit: Int!, $after: String) {
      postsConnection(first: $limit, after: $after, orderBy: publishedAt_DESC) {
        edges {
          cursor
          node {
            ${QUERY_FRAGMENTS.postBasicFields}
            ${QUERY_FRAGMENTS.thumbnailImage}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        aggregate {
          count
        }
      }
    }
  `,

  POSTS_STANDARD: gql`
    query GetPostsStandard($limit: Int!, $after: String) {
      postsConnection(first: $limit, after: $after, orderBy: publishedAt_DESC) {
        edges {
          cursor
          node {
            ${QUERY_FRAGMENTS.postBasicFields}
            excerpt
            ${QUERY_FRAGMENTS.authorBasic}
            ${QUERY_FRAGMENTS.featuredImageOptimized}
            ${QUERY_FRAGMENTS.categoriesBasic}
            ${QUERY_FRAGMENTS.tagsBasic}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        aggregate {
          count
        }
      }
    }
  `,

  // Category posts with enforced limits
  CATEGORY_POSTS: gql`
    query GetCategoryPosts($slug: String!, $limit: Int!, $after: String) {
      postsConnection(
        where: { categories_some: { slug: $slug } }
        first: $limit
        after: $after
        orderBy: createdAt_DESC
      ) {
        edges {
          cursor
          node {
            ${QUERY_FRAGMENTS.postBasicFields}
            excerpt
            ${QUERY_FRAGMENTS.authorBasic}
            ${QUERY_FRAGMENTS.featuredImageOptimized}
            ${QUERY_FRAGMENTS.categoriesBasic}
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        aggregate {
          count
        }
      }
    }
  `,

  // Post details with optimized content loading
  POST_DETAILS: gql`
    query GetPostDetails($slug: String!) {
      post(where: { slug: $slug }) {
        ${QUERY_FRAGMENTS.postBasicFields}
        excerpt
        ${QUERY_FRAGMENTS.authorFull}
        ${QUERY_FRAGMENTS.featuredImageOptimized}
        ${QUERY_FRAGMENTS.categoriesBasic}
        ${QUERY_FRAGMENTS.tagsBasic}
        ${QUERY_FRAGMENTS.contentFull}
      }
    }
  `,

  // Lightweight queries for widgets
  FEATURED_POSTS_WIDGET: gql`
    query GetFeaturedPostsWidget {
      posts(where: { featuredpost: true }, first: 8, orderBy: createdAt_DESC) {
        ${QUERY_FRAGMENTS.postBasicFields}
        ${QUERY_FRAGMENTS.authorBasic}
        ${QUERY_FRAGMENTS.featuredImageOptimized}
      }
    }
  `,

  RECENT_POSTS_WIDGET: gql`
    query GetRecentPostsWidget {
      posts(orderBy: publishedAt_DESC, first: 5) {
        ${QUERY_FRAGMENTS.postBasicFields}
        ${QUERY_FRAGMENTS.thumbnailImage}
      }
    }
  `,

  // Categories (cached for long periods)
  CATEGORIES_ALL: gql`
    query GetAllCategories {
      categories(where: { show: true }, orderBy: name_DESC) {
        name
        slug
      }
    }
  `,

  // Similar posts with better performance
  SIMILAR_POSTS: gql`
    query GetSimilarPosts($slug: String!, $categories: [String!]) {
      posts(
        where: {
          slug_not: $slug
          AND: { categories_some: { slug_in: $categories } }
        }
        first: 3
      ) {
        ${QUERY_FRAGMENTS.postBasicFields}
        ${QUERY_FRAGMENTS.thumbnailImage}
      }
    }
  `,
};

// Query execution helpers with built-in optimization
export const executeOptimizedQuery = async (
  client,
  queryName,
  variables = {}
) => {
  // Validate variables
  if (variables.limit) {
    variables.limit = validateLimit(variables.limit);
  }

  const query = OPTIMIZED_QUERIES[queryName];
  if (!query) {
    throw new Error(`Optimized query '${queryName}' not found`);
  }

  // Add performance timing
  const startTime = Date.now();

  try {
    const result = await client.request(query, variables);
    const duration = Date.now() - startTime;

    if (process.env.NODE_ENV === "development") {
      console.log(`[OptimizedQuery] ${queryName} completed in ${duration}ms`);
    }

    return result;
  } catch (error) {
    console.error(`[OptimizedQuery] ${queryName} failed:`, error.message);
    throw error;
  }
};

export default OPTIMIZED_QUERIES;
