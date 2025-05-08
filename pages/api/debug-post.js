// Next.js API route for debugging post fetching issues
// This provides a direct way to fetch post data from Hygraph without caching

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
  // Set CORS headers to allow requests from specific domains
  const allowedOrigins = [
    'https://blog.urtechy.com',
    'https://urtechy.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
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

  // Get the slug from the query parameter
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ message: "Slug parameter is required" });
  }

  // Define multiple query variations to try
  const queries = [
    // Query 1: Standard query with raw content
    `
    query GetPostDetails($slug: String!) {
      post(where: { slug: $slug }) {
        title
        excerpt
        featuredImage {
          url
        }
        author {
          name
          bio
          photo {
            url
          }
        }
        createdAt
        publishedAt
        slug
        content {
          raw
        }
        categories {
          name
          slug
        }
      }
    }
    `,
    
    // Query 2: Alternative query using posts collection
    `
    query GetPostBySlug($slug: String!) {
      posts(where: { slug: $slug }, first: 1) {
        title
        excerpt
        featuredImage {
          url
        }
        author {
          name
          bio
          photo {
            url
          }
        }
        createdAt
        publishedAt
        slug
        content {
          raw
        }
        categories {
          name
          slug
        }
      }
    }
    `,
    
    // Query 3: Simplified query with minimal fields
    `
    query GetSimplifiedPostDetails($slug: String!) {
      post(where: { slug: $slug }) {
        title
        slug
        content {
          raw
        }
      }
    }
    `
  ];

  // Results object to store all attempts
  const results = {
    slug,
    timestamp: new Date().toISOString(),
    attempts: []
  };

  // Try each query with both CDN and Content API
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    
    // Try CDN API
    try {
      const cdnClient = new GraphQLClient(HYGRAPH_CDN_API, {
        timeout: 15000,
        headers: {
          Origin: "https://blog.urtechy.com",
          Referer: "https://blog.urtechy.com/",
          "User-Agent": "Mozilla/5.0 urTechy Blog Debug API",
        },
      });
      
      const cdnResult = await cdnClient.request(query, { slug });
      results.attempts.push({
        queryIndex: i,
        api: "CDN",
        success: true,
        data: cdnResult,
        error: null
      });
      
      // If we got a successful result, no need to try more queries
      if ((cdnResult.post || (cdnResult.posts && cdnResult.posts.length > 0))) {
        break;
      }
    } catch (cdnError) {
      results.attempts.push({
        queryIndex: i,
        api: "CDN",
        success: false,
        data: null,
        error: {
          message: cdnError.message,
          response: cdnError.response || null
        }
      });
    }
    
    // Try Content API
    try {
      const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
        timeout: 15000,
        headers: {
          Origin: "https://blog.urtechy.com",
          Referer: "https://blog.urtechy.com/",
          "User-Agent": "Mozilla/5.0 urTechy Blog Debug API",
        },
      });
      
      const contentResult = await contentClient.request(query, { slug });
      results.attempts.push({
        queryIndex: i,
        api: "Content",
        success: true,
        data: contentResult,
        error: null
      });
      
      // If we got a successful result, no need to try more queries
      if ((contentResult.post || (contentResult.posts && contentResult.posts.length > 0))) {
        break;
      }
    } catch (contentError) {
      results.attempts.push({
        queryIndex: i,
        api: "Content",
        success: false,
        data: null,
        error: {
          message: contentError.message,
          response: contentError.response || null
        }
      });
    }
  }

  // Process results to determine if we found the post
  const successfulAttempts = results.attempts.filter(attempt => attempt.success);
  
  if (successfulAttempts.length > 0) {
    // Find the first attempt that has actual post data
    const validDataAttempt = successfulAttempts.find(attempt => {
      const data = attempt.data;
      return (data.post && data.post.title) || 
             (data.posts && data.posts.length > 0 && data.posts[0].title);
    });
    
    if (validDataAttempt) {
      results.found = true;
      results.bestResult = validDataAttempt;
    } else {
      results.found = false;
      results.bestResult = null;
    }
  } else {
    results.found = false;
    results.bestResult = null;
  }

  // Return the results
  return res.status(200).json(results);
}
