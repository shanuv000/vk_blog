// Helper functions for sitemap generation
const { gql } = require("graphql-request");
const { GraphQLClient } = require("graphql-request");

// Get the Hygraph API endpoints from environment variables
const HYGRAPH_CDN_API =
  process.env.NEXT_PUBLIC_HYGRAPH_CDN_API ||
  "https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master";

// Create a client for the CDN API (read-only operations)
// This is only used server-side for sitemap generation, so no need for proxy
const cdnClient = new GraphQLClient(HYGRAPH_CDN_API);

/**
 * Fetches all published posts from Hygraph for sitemap generation
 * @returns {Promise<Array>} Array of post objects with loc, publication_date, and title
 */
async function getNewsArticles() {
  const query = gql`
    query GetNewsArticles {
      postsConnection(first: 500, orderBy: publishedAt_DESC, stage: PUBLISHED) {
        edges {
          node {
            slug
            title
            createdAt
            publishedAt
            updatedAt
          }
        }
      }
    }
  `;

  try {
    // Add a timestamp to avoid caching issues
    const variables = { _timestamp: new Date().getTime() };
    const result = await cdnClient.request(query, variables);

    if (!result?.postsConnection?.edges) {
      console.warn("No posts found or unexpected response structure");
      return [];
    }

    return result.postsConnection.edges.map(({ node }) => ({
      // Ensure the URL format is correct for post pages
      loc: `https://blog.urtechy.com/post/${node.slug}`,
      // Use the most recent date between publishedAt and updatedAt
      publication_date: node.updatedAt || node.publishedAt || node.createdAt,
      title: node.title,
    }));
  } catch (error) {
    console.error("Error fetching articles for sitemap:", error);
    // Log more detailed error information
    if (error.response?.errors) {
      console.error("GraphQL errors:", JSON.stringify(error.response.errors));
    }
    return [];
  }
}

/**
 * Fetches all category slugs from Hygraph for sitemap generation
 * @returns {Promise<Array>} Array of category objects with loc and lastmod
 */
async function getCategorySlugs() {
  const query = gql`
    query GetCategories {
      categories {
        slug
        updatedAt
      }
    }
  `;

  try {
    // Add a timestamp to avoid caching issues
    const variables = { _timestamp: new Date().getTime() };
    const result = await cdnClient.request(query, variables);

    if (!result?.categories) {
      console.warn("No categories found or unexpected response structure");
      return [];
    }

    return result.categories.map((category) => ({
      loc: `https://blog.urtechy.com/category/${category.slug}`,
      lastmod: category.updatedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}

module.exports = {
  getNewsArticles,
  getCategorySlugs,
};
