// Next.js API route to proxy requests to Hygraph
// This avoids CORS issues when fetching from the client side

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

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Set CORS headers to allow requests from both domains
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Get the query and variables from the request body
    const { query, variables } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    // Determine if this is a query that should be cached
    const isQueryCacheable =
      !query.includes("mutation") && !variables?._timestamp;

    // Set cache headers for HTTP caching

    // Set appropriate cache headers
    if (isQueryCacheable) {
      // Determine cache duration based on query type
      let maxAge = 300; // Default 5 minutes
      let sMaxAge = 300; // Default 5 minutes for CDN
      let staleWhileRevalidate = 3600; // Default 1 hour

      // Longer cache for specific query types
      if (query.includes("GetCategories")) {
        // Categories change rarely - cache for 1 day
        maxAge = 86400;
        sMaxAge = 86400;
        staleWhileRevalidate = 172800; // 2 days
      } else if (
        query.includes("GetFeaturedPosts") ||
        query.includes("GetRecentPosts")
      ) {
        // Featured and recent posts - cache for 15 minutes
        maxAge = 900;
        sMaxAge = 900;
        staleWhileRevalidate = 7200; // 2 hours
      } else if (query.includes("GetPostDetails") && variables?.slug) {
        // Individual post details - cache for 30 minutes
        maxAge = 1800;
        sMaxAge = 1800;
        staleWhileRevalidate = 14400; // 4 hours
      }

      // Set cache headers with appropriate durations
      res.setHeader(
        "Cache-Control",
        `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`
      );

      // Add debug headers
      res.setHeader("X-Cache-TTL", `${maxAge}s`);
      res.setHeader("X-Cache-SWR", `${staleWhileRevalidate}s`);
      res.setHeader("X-Cache-Type", "DYNAMIC");
    } else {
      // No caching for mutations or timestamped queries
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.setHeader("X-Cache-Type", "NOCACHE");
    }

    // Log the query for debugging
    console.log(`Processing GraphQL query: ${query.substring(0, 50)}...`);

    // Identify query type
    const isFeaturedPostsQuery = query.includes("GetFeaturedPosts");
    const isCategoriesQuery = query.includes("GetCategories");
    const isRecentPostsQuery = query.includes("GetRecentPosts");

    // Try CDN endpoint first
    try {
      // Create GraphQL client with timeout
      const cdnClient = new GraphQLClient(HYGRAPH_CDN_API, {
        timeout: 15000, // 15 second timeout
        headers: {
          // Add headers that might help with CORS
          Origin: "https://blog.urtechy.com",
          Referer: "https://blog.urtechy.com/",
          "User-Agent": "Mozilla/5.0 urTechy Blog Client",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      // Handle different query types
      if (isFeaturedPostsQuery) {
        console.log("Using simplified query for featured posts");
        // Use a simpler query for featured posts
        const simplifiedQuery = `
          query GetFeaturedPosts {
            posts(first: 12, orderBy: createdAt_DESC) {
              title
              slug
              createdAt
              featuredImage {
                url
              }
              author {
                name
                photo {
                  url
                }
              }
            }
          }
        `;
        try {
          const data = await cdnClient.request(simplifiedQuery);

          // Set cache miss header
          res.setHeader("X-Cache", "MISS");
          res.setHeader("X-Cache-Source", "CDN");

          return res.status(200).json(data);
        } catch (error) {
          console.log(
            "Simplified featured posts query failed, returning empty array"
          );
          return res.status(200).json({ posts: [] });
        }
      }

      if (isCategoriesQuery) {
        console.log("Using simplified query for categories");
        // Use a simpler query for categories
        const simplifiedQuery = `
          query GetCategories {
            categories {
              name
              slug
            }
          }
        `;
        try {
          const data = await cdnClient.request(simplifiedQuery);

          // Set cache miss header
          res.setHeader("X-Cache", "MISS");
          res.setHeader("X-Cache-Source", "CDN");

          return res.status(200).json(data);
        } catch (error) {
          console.log(
            "Simplified categories query failed, returning empty array"
          );
          return res.status(200).json({ categories: [] });
        }
      }

      if (isRecentPostsQuery) {
        console.log("Using simplified query for recent posts");
        // Use a simpler query for recent posts
        const simplifiedQuery = `
          query GetRecentPosts {
            posts(orderBy: createdAt_DESC, first: 3) {
              title
              featuredImage {
                url
              }
              createdAt
              slug
            }
          }
        `;
        try {
          const data = await cdnClient.request(simplifiedQuery);

          // Set cache miss header
          res.setHeader("X-Cache", "MISS");
          res.setHeader("X-Cache-Source", "CDN");

          return res.status(200).json(data);
        } catch (error) {
          console.log(
            "Simplified recent posts query failed, returning empty array"
          );
          return res.status(200).json({ posts: [] });
        }
      }

      // For other queries, use the original query
      try {
        const data = await cdnClient.request(query, variables);

        // Set cache miss header
        res.setHeader("X-Cache", "MISS");
        res.setHeader("X-Cache-Source", "CDN");

        return res.status(200).json(data);
      } catch (error) {
        console.warn("Original query failed with CDN, trying Content API");
        throw error; // Throw to be caught by the outer catch
      }
    } catch (cdnError) {
      console.warn(
        "CDN request failed, falling back to Content API:",
        cdnError.message
      );

      // If CDN fails, try the Content API as fallback
      try {
        const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
          timeout: 15000, // 15 second timeout
          headers: {
            // Add headers that might help with CORS
            Origin: "https://blog.urtechy.com",
            Referer: "https://blog.urtechy.com/",
            "User-Agent": "Mozilla/5.0 urTechy Blog Client",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // Handle different query types for Content API
        if (isFeaturedPostsQuery) {
          console.log(
            "Using simplified query for featured posts with Content API"
          );
          const simplifiedQuery = `
            query GetFeaturedPosts {
              posts(first: 12, orderBy: createdAt_DESC) {
                title
                slug
                createdAt
                featuredImage {
                  url
                }
                author {
                  name
                  photo {
                    url
                  }
                }
              }
            }
          `;
          try {
            const data = await contentClient.request(simplifiedQuery);
            return res.status(200).json(data);
          } catch (error) {
            console.log(
              "Simplified featured posts query failed with Content API, returning empty array"
            );
            return res.status(200).json({ posts: [] });
          }
        }

        if (isCategoriesQuery) {
          console.log("Using simplified query for categories with Content API");
          const simplifiedQuery = `
            query GetCategories {
              categories {
                name
                slug
              }
            }
          `;
          try {
            const data = await contentClient.request(simplifiedQuery);
            return res.status(200).json(data);
          } catch (error) {
            console.log(
              "Simplified categories query failed with Content API, returning empty array"
            );
            return res.status(200).json({ categories: [] });
          }
        }

        if (isRecentPostsQuery) {
          console.log(
            "Using simplified query for recent posts with Content API"
          );
          const simplifiedQuery = `
            query GetRecentPosts {
              posts(orderBy: createdAt_DESC, first: 3) {
                title
                featuredImage {
                  url
                }
                createdAt
                slug
              }
            }
          `;
          try {
            const data = await contentClient.request(simplifiedQuery);
            return res.status(200).json(data);
          } catch (error) {
            console.log(
              "Simplified recent posts query failed with Content API, returning empty array"
            );
            return res.status(200).json({ posts: [] });
          }
        }

        // For other queries, try the original query with Content API
        const data = await contentClient.request(query, variables);
        return res.status(200).json(data);
      } catch (contentApiError) {
        console.error("Content API also failed:", contentApiError.message);

        // Return appropriate empty data structure based on query type
        if (isFeaturedPostsQuery) {
          return res.status(200).json({ posts: [] });
        } else if (isCategoriesQuery) {
          return res.status(200).json({ categories: [] });
        } else if (isRecentPostsQuery) {
          return res.status(200).json({ posts: [] });
        }

        // For other queries, return a generic empty response
        return res.status(200).json({ data: null });
      }
    }
  } catch (error) {
    console.error("Error proxying request to Hygraph:", error);

    // Try to extract meaningful error information
    const errorMessage =
      error.response?.errors?.[0]?.message || error.message || "Unknown error";
    const statusCode = error.response?.status || 500;

    // Set no-cache for errors
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(statusCode).json({
      message: "Error fetching data from Hygraph",
      error: errorMessage,
    });
  }
}
