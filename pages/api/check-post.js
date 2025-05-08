// Next.js API route for checking if a post exists in Hygraph
// This helps diagnose issues with specific posts

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

  // Define queries to check for the post in different ways
  const queries = [
    // 1. Direct post query by slug
    {
      name: "Direct post query",
      query: `
        query GetPost($slug: String!) {
          post(where: { slug: $slug }) {
            id
            title
            slug
            publishedAt
            updatedAt
            stage
          }
        }
      `,
    },
    
    // 2. Posts collection query by slug
    {
      name: "Posts collection query",
      query: `
        query GetPosts($slug: String!) {
          posts(where: { slug: $slug }) {
            id
            title
            slug
            publishedAt
            updatedAt
            stage
          }
        }
      `,
    },
    
    // 3. Fuzzy search query
    {
      name: "Fuzzy search query",
      query: `
        query SearchPosts($search: String!) {
          posts(where: { _search: $search }, first: 5) {
            id
            title
            slug
            publishedAt
            updatedAt
          }
        }
      `,
      variables: { search: slug.replace(/-/g, " ") },
    },
    
    // 4. Check all posts to find similar slugs
    {
      name: "All posts query",
      query: `
        query GetAllPosts {
          posts(first: 100) {
            slug
          }
        }
      `,
      postProcess: (data, targetSlug) => {
        if (!data.posts) return { found: false, similar: [] };
        
        const slugs = data.posts.map(post => post.slug);
        const exactMatch = slugs.includes(targetSlug);
        
        // Find similar slugs using Levenshtein distance
        const similar = slugs
          .filter(s => s !== targetSlug)
          .map(s => ({
            slug: s,
            distance: levenshteinDistance(s, targetSlug),
          }))
          .filter(item => item.distance < 5)  // Only include reasonably similar slugs
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);  // Get top 5 most similar
        
        return {
          found: exactMatch,
          similar,
        };
      },
    },
  ];

  // Results object to store all attempts
  const results = {
    slug,
    timestamp: new Date().toISOString(),
    checks: []
  };

  // Create GraphQL clients
  const cdnClient = new GraphQLClient(HYGRAPH_CDN_API, {
    timeout: 15000,
    headers: {
      Origin: "https://blog.urtechy.com",
      Referer: "https://blog.urtechy.com/",
      "User-Agent": "Mozilla/5.0 urTechy Blog Post Checker",
    },
  });
  
  const contentClient = new GraphQLClient(HYGRAPH_CONTENT_API, {
    timeout: 15000,
    headers: {
      Origin: "https://blog.urtechy.com",
      Referer: "https://blog.urtechy.com/",
      "User-Agent": "Mozilla/5.0 urTechy Blog Post Checker",
    },
  });

  // Execute all queries
  for (const queryInfo of queries) {
    const check = {
      name: queryInfo.name,
      cdn: { success: false, data: null, error: null },
      content: { success: false, data: null, error: null }
    };
    
    // Try with CDN API
    try {
      const variables = queryInfo.variables || { slug };
      const data = await cdnClient.request(queryInfo.query, variables);
      
      check.cdn.success = true;
      check.cdn.data = data;
      
      // Apply post-processing if defined
      if (queryInfo.postProcess) {
        check.cdn.processed = queryInfo.postProcess(data, slug);
      }
    } catch (error) {
      check.cdn.error = {
        message: error.message,
        response: error.response || null
      };
    }
    
    // Try with Content API
    try {
      const variables = queryInfo.variables || { slug };
      const data = await contentClient.request(queryInfo.query, variables);
      
      check.content.success = true;
      check.content.data = data;
      
      // Apply post-processing if defined
      if (queryInfo.postProcess) {
        check.content.processed = queryInfo.postProcess(data, slug);
      }
    } catch (error) {
      check.content.error = {
        message: error.message,
        response: error.response || null
      };
    }
    
    results.checks.push(check);
  }

  // Analyze results to provide recommendations
  const analysis = analyzeResults(results);
  results.analysis = analysis;

  // Return the results
  return res.status(200).json(results);
}

// Helper function to calculate Levenshtein distance between two strings
function levenshteinDistance(a, b) {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Helper function to analyze results and provide recommendations
function analyzeResults(results) {
  const analysis = {
    postExists: false,
    possibleIssues: [],
    recommendations: []
  };
  
  // Check if post exists in any query
  const directCheck = results.checks.find(check => check.name === "Direct post query");
  const collectionCheck = results.checks.find(check => check.name === "Posts collection query");
  const allPostsCheck = results.checks.find(check => check.name === "All posts query");
  
  // Check if post exists directly
  if (directCheck?.cdn?.data?.post || directCheck?.content?.data?.post) {
    analysis.postExists = true;
  }
  
  // Check if post exists in collection
  if (collectionCheck?.cdn?.data?.posts?.length > 0 || 
      collectionCheck?.content?.data?.posts?.length > 0) {
    analysis.postExists = true;
  }
  
  // If post doesn't exist directly, check for similar slugs
  if (!analysis.postExists) {
    const similarSlugs = allPostsCheck?.cdn?.processed?.similar || 
                         allPostsCheck?.content?.processed?.similar || [];
    
    if (similarSlugs.length > 0) {
      analysis.possibleIssues.push("SLUG_TYPO");
      analysis.recommendations.push({
        type: "CHECK_SIMILAR_SLUGS",
        message: "The exact slug was not found, but similar slugs exist. Check if there's a typo.",
        similarSlugs
      });
    } else {
      analysis.possibleIssues.push("POST_NOT_FOUND");
      analysis.recommendations.push({
        type: "CREATE_POST",
        message: "The post does not exist in Hygraph. You may need to create it."
      });
    }
  }
  
  return analysis;
}
