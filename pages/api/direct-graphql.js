// Next.js API route for direct GraphQL queries without Apollo Client
// This provides a simpler, more reliable way to fetch data

import { GraphQLClient } from "graphql-request";

// Configure API to accept larger requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

// Get the Hygraph API endpoints from environment variables
const HYGRAPH_CDN_API =
  process.env.NEXT_PUBLIC_HYGRAPH_CDN_API ||
  "https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master";
const HYGRAPH_CONTENT_API =
  process.env.NEXT_PUBLIC_HYGRAPH_CONTENT_API ||
  "https://api-ap-south-1.hygraph.com/v2/cky5wgpym15ym01z44tk90zeb/master";

// Predefined queries for common operations
const PREDEFINED_QUERIES = {
  categories: `
    query GetCategories {
      categories {
        name
        slug
      }
    }
  `,
  featuredPosts: `
    query GetFeaturedPosts {
      posts(where: { featuredpost: true }, first: 12, orderBy: createdAt_DESC) {
        title
        slug
        createdAt
        publishedAt
        featuredImage {
          url
          width
          height
        }
        author {
          name
          photo {
            url
          }
        }
      }
    }
  `,
  recentPosts: `
    query GetRecentPosts {
      posts(orderBy: publishedAt_DESC, first: 3) {
        title
        featuredImage {
          url
        }
        createdAt
        publishedAt
        slug
      }
    }
  `,
  adjacentPosts: `
    query GetAdjacentPosts($createdAt: DateTime!, $slug: String!) {
      next: posts(
        first: 1
        orderBy: createdAt_ASC
        where: { slug_not: $slug, AND: { createdAt_gte: $createdAt } }
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
      previous: posts(
        first: 1
        orderBy: createdAt_DESC
        where: { slug_not: $slug, AND: { createdAt_lte: $createdAt } }
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `,
  similarPosts: `
    query GetSimilarPosts($slug: String!, $categories: [String!]) {
      posts(
        where: {
          slug_not: $slug
          AND: { categories_some: { slug_in: $categories } }
        }
        first: 3
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `,
};

// Default response data for when queries fail
const DEFAULT_RESPONSES = {
  categories: { categories: [] },
  featuredPosts: { posts: [] },
  recentPosts: { posts: [] },
  similarPosts: { posts: [] },
  adjacentPosts: { next: [], previous: [] },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET and POST requests
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get the query type from the request
    let queryType;
    let variables = {};

    if (req.method === "GET") {
      // For GET requests, get the query type from the query parameter
      queryType = req.query.type;

      // Try to parse variables if provided
      if (req.query.variables) {
        try {
          variables = JSON.parse(req.query.variables);
        } catch (e) {
          console.warn("Failed to parse variables from query string");
        }
      }
    } else {
      // For POST requests, get the query type and variables from the body
      queryType = req.body.type;
      variables = req.body.variables || {};
    }

    // Validate the query type
    if (!queryType || !PREDEFINED_QUERIES[queryType]) {
      return res.status(400).json({
        message: "Invalid query type",
        availableTypes: Object.keys(PREDEFINED_QUERIES),
      });
    }

    // Set cache headers based on query type
    if (queryType === "categories") {
      // Cache categories for longer (1 hour)
      res.setHeader(
        "Cache-Control",
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
      );
    } else {
      // Cache other queries for 5 minutes
      res.setHeader(
        "Cache-Control",
        "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
      );
    }

    // Get the predefined query
    const query = PREDEFINED_QUERIES[queryType];
    console.log(`Processing direct GraphQL query for type: ${queryType}`);

    // Try CDN endpoint first
    try {
      const cdnClient = new GraphQLClient(HYGRAPH_CDN_API, {
        timeout: 10000,
        headers: {
          Origin: "https://blog.urtechy.com",
          Referer: "https://blog.urtechy.com/",
          "User-Agent": "Mozilla/5.0 urTechy Blog Direct API",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const data = await cdnClient.request(query, variables);
      return res.status(200).json(data);
    } catch (cdnError) {
      console.warn(`CDN API failed for ${queryType}:`, cdnError.message);

      // Try Content API as fallback
      try {
        const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
          timeout: 10000,
          headers: {
            Origin: "https://blog.urtechy.com",
            Referer: "https://blog.urtechy.com/",
            "User-Agent": "Mozilla/5.0 urTechy Blog Direct API",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const data = await contentClient.request(query, variables);
        return res.status(200).json(data);
      } catch (contentError) {
        console.error(
          `Content API also failed for ${queryType}:`,
          contentError.message
        );

        // Return default response data
        return res
          .status(200)
          .json(DEFAULT_RESPONSES[queryType] || { data: null });
      }
    }
  } catch (error) {
    console.error("Error in direct-graphql API:", error);

    // Return a 200 status with empty data to avoid breaking the client
    return res.status(200).json({
      message: "Error processing GraphQL request",
      error: error.message || "Unknown error",
      data: null,
    });
  }
}
