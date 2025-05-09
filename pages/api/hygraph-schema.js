// Next.js API route for validating Hygraph schema
// This helps diagnose issues with content fetching

import { GraphQLClient } from "graphql-request";

// Configure API to accept larger requests
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
};

// Get the Hygraph API endpoint from environment variables
const HYGRAPH_CDN_API =
  process.env.NEXT_PUBLIC_HYGRAPH_CDN_API ||
  "https://ap-south-1.cdn.hygraph.com/content/cky5wgpym15ym01z44tk90zeb/master";

export default async function handler(req, res) {
  // Set CORS headers to allow requests from specific domains
  const allowedOrigins = [
    "https://blog.urtechy.com",
    "https://urtechy.com",
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Define queries to validate the Hygraph schema
  const postTypeQuery = `
    query PostTypeQuery {
      postType: __type(name: "Post") {
        name
        kind
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
      richTextType: __type(name: "RichText") {
        name
        kind
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  `;

  // Also check for a specific post to validate access
  const checkPostQuery = `
    query CheckPostQuery($slug: String!) {
      post(where: { slug: $slug }) {
        id
        title
        slug
        publishedAt
        updatedAt
      }
    }
  `;

  try {
    // Create GraphQL client
    const cdnClient = new GraphQLClient(HYGRAPH_CDN_API, {
      timeout: 30000, // 30 second timeout for introspection
      headers: {
        Origin: "https://blog.urtechy.com",
        Referer: "https://blog.urtechy.com/",
        "User-Agent": "Mozilla/5.0 urTechy Blog Schema Validator",
      },
    });

    // Get the slug from the query parameter or use a default
    const slug = req.query.slug || "marvel-benedict-cumberbatch-mcu-anchor";

    // Execute all queries in parallel
    const [postTypeResult, checkPostResult] = await Promise.all([
      cdnClient.request(postTypeQuery),
      cdnClient.request(checkPostQuery, { slug }),
    ]);

    // Prepare the response
    const result = {
      timestamp: new Date().toISOString(),
      postType: postTypeResult.postType,
      richTextType: postTypeResult.richTextType,
      postCheck: {
        slug,
        found: !!checkPostResult.post,
        post: checkPostResult.post || null,
      },
      apiEndpoint: HYGRAPH_CDN_API,
    };

    // Return the results
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error validating Hygraph schema:", error);

    // Extract detailed error information
    const errorDetails = {
      error: true,
      message: error.message,
      details: error.response?.errors || [],
      requestInfo: error.request
        ? {
            query: error.request.query,
            variables: error.request.variables,
          }
        : undefined,
      responseInfo: error.response
        ? {
            status: error.response.status,
            headers: error.response.headers,
          }
        : undefined,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };

    // Log detailed error for debugging
    console.error(
      "Detailed error information:",
      JSON.stringify(errorDetails, null, 2)
    );

    return res.status(200).json(errorDetails);
  }
}
