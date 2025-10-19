import { gql } from "graphql-request";
import { cdnClient } from "./hygraph";

/**
 * Get posts with pagination support
 * @param {Object} options - Pagination options
 * @param {number} options.first - Number of posts to fetch (default: 7)
 * @param {string} options.after - Cursor for pagination (optional)
 * @param {string} options.fields - Fields to fetch ('full' or 'minimal')
 * @returns {Object} - { posts, pageInfo, totalCount }
 */
export const getPostsPaginated = async (options = {}) => {
  const { first = 7, after = null, fields = "full" } = options;

  // Production: Input validation
  if (first < 1 || first > 50) {
    throw new Error("Invalid pagination size: first must be between 1 and 50");
  }

  if (after && typeof after !== "string") {
    throw new Error("Invalid cursor: after must be a string");
  }

  // Determine which fields to fetch based on the 'fields' option
  let fieldsFragment = "";

  if (fields === "minimal") {
    fieldsFragment = `
      slug
      title
      createdAt
    `;
  } else {
    // Default to full fields
    fieldsFragment = `
      author {
        bio
        name
        id
        photo {
          url
        }
      }
      publishedAt
      createdAt
      slug
      title
      excerpt
      featuredImage {
        url
      }
      categories {
        name
        slug
      }
      tags {
        id
        name
        slug
        color {
          hex
        }
      }
    `;
  }

  // Build the query with pagination support
  const query = gql`
    query GetPostsPaginated($first: Int!, $after: String) {
      postsConnection(
        first: $first, 
        after: $after, 
        orderBy: publishedAt_DESC
      ) {
        edges {
          cursor
          node {
            ${fieldsFragment}
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        aggregate {
          count
        }
      }
    }
  `;

  try {
    // Production: Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getPostsPaginated] Fetching posts (first: ${first}, after: ${
          after || "null"
        }, fields: ${fields})`
      );
    }

    const variables = { first };
    if (after) {
      variables.after = after;
    }

    const result = await cdnClient.request(query, variables);

    // Production: Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getPostsPaginated] Successfully fetched ${result.postsConnection.edges.length} posts`
      );
    }

    return {
      posts: result.postsConnection.edges,
      pageInfo: result.postsConnection.pageInfo,
      totalCount: result.postsConnection.aggregate.count,
    };
  } catch (error) {
    // Check if the error contains the actual data (common with GraphQL proxy responses)
    if (error.response && error.response.postsConnection) {
      // Production: Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[getPostsPaginated] Successfully fetched",
          error.response.postsConnection.edges.length,
          "posts via proxy"
        );
      }
      const data = error.response.postsConnection;
      return {
        posts: data.edges,
        pageInfo: data.pageInfo,
        totalCount: data.aggregate.count,
      };
    }

    // Only log actual errors (not proxy response format issues)
    console.error(
      "[getPostsPaginated] Error fetching posts:",
      error.message || error
    );

    return {
      posts: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  }
};

/**
 * Get category posts with pagination support
 * @param {string} slug - Category slug
 * @param {Object} options - Pagination options
 * @param {number} options.first - Number of posts to fetch (default: 7)
 * @param {string} options.after - Cursor for pagination (optional)
 * @returns {Object} - { posts, pageInfo, totalCount }
 */
export const getCategoryPostsPaginated = async (slug, options = {}) => {
  const { first = 7, after = null } = options;

  // Production: Input validation
  if (!slug || typeof slug !== "string") {
    console.error("Invalid slug provided to getCategoryPostsPaginated");
    return {
      posts: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  }

  if (first < 1 || first > 50) {
    throw new Error("Invalid pagination size: first must be between 1 and 50");
  }

  if (after && typeof after !== "string") {
    throw new Error("Invalid cursor: after must be a string");
  }

  const query = gql`
    query GetCategoryPostsPaginated(
      $slug: String!
      $first: Int!
      $after: String
    ) {
      postsConnection(
        where: { categories_some: { slug: $slug } }
        first: $first
        after: $after
        orderBy: createdAt_DESC
      ) {
        edges {
          cursor
          node {
            author {
              bio
              name
              id
              photo {
                url
              }
            }
            createdAt
            publishedAt
            slug
            title
            excerpt
            featuredImage {
              url
            }
            categories {
              name
              slug
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        aggregate {
          count
        }
      }
    }
  `;

  try {
    // Production: Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getCategoryPostsPaginated] Fetching category posts (slug: ${slug}, first: ${first}, after: ${
          after || "null"
        })`
      );
    }

    const variables = { slug, first };
    if (after) {
      variables.after = after;
    }

    const result = await cdnClient.request(query, variables);

    // Production: Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[getCategoryPostsPaginated] Successfully fetched ${result.postsConnection.edges.length} posts for category ${slug}`
      );
    }

    return {
      posts: result.postsConnection.edges,
      pageInfo: result.postsConnection.pageInfo,
      totalCount: result.postsConnection.aggregate.count,
    };
  } catch (error) {
    // Check if the error contains the actual data (common with GraphQL proxy responses)
    if (error.response && error.response.postsConnection) {
      // Production: Only log in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[getCategoryPostsPaginated] Successfully fetched ${error.response.postsConnection.edges.length} posts for category ${slug} via proxy`
        );
      }
      const data = error.response.postsConnection;
      return {
        posts: data.edges,
        pageInfo: data.pageInfo,
        totalCount: data.aggregate.count,
      };
    }

    // Only log actual errors (not proxy response format issues)
    console.error(
      `[getCategoryPostsPaginated] Error fetching category posts for ${slug}:`,
      error.message || error
    );

    return {
      posts: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      },
      totalCount: 0,
    };
  }
};
