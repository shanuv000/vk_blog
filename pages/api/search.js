/**
 * Search API Endpoint
 * Full-text search across blog posts using Hygraph's native search
 * 
 * Usage: GET /api/search?q=query&limit=10&skip=0
 */

import { gql } from "graphql-request";
import { fetchFromCDN } from "../../services/hygraph";
import { 
  setCacheItem, 
  getCacheItem, 
  generateCacheKey 
} from "../../lib/cache-manager";

// Cache TTL for search results (5 minutes)
const SEARCH_CACHE_TTL = 5 * 60 * 1000;

// GraphQL query for full-text search
const SEARCH_POSTS_QUERY = gql`
  query SearchPosts($search: String!, $limit: Int!, $skip: Int!) {
    posts(
      where: { _search: $search }
      first: $limit
      skip: $skip
      orderBy: publishedAt_DESC
    ) {
      title
      slug
      excerpt
      publishedAt
      createdAt
      featuredImage {
        url
      }
      categories {
        name
        slug
      }
      author {
        name
        photo {
          url
        }
      }
    }
    postsConnection(where: { _search: $search }) {
      aggregate {
        count
      }
    }
  }
`;

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q: query, limit = "10", skip = "0" } = req.query;

  // Validate query parameter
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ 
      error: "Search query is required",
      posts: [],
      totalCount: 0 
    });
  }

  // Sanitize and normalize the query
  const sanitizedQuery = query.trim().slice(0, 100); // Max 100 chars
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50); // 1-50
  const parsedSkip = Math.max(parseInt(skip, 10) || 0, 0);

  // Generate cache key
  const cacheKey = generateCacheKey("search", {
    q: sanitizedQuery.toLowerCase(),
    limit: parsedLimit,
    skip: parsedSkip,
  });

  try {
    // Check cache first
    const cachedResult = await getCacheItem(cacheKey);
    if (cachedResult) {
      console.log(`[Search API] Cache hit for query: "${sanitizedQuery}"`);
      return res.status(200).json({
        ...cachedResult,
        cached: true,
      });
    }

    console.log(`[Search API] Searching for: "${sanitizedQuery}" (limit: ${parsedLimit}, skip: ${parsedSkip})`);

    // Fetch from Hygraph
    const result = await fetchFromCDN(SEARCH_POSTS_QUERY, {
      search: sanitizedQuery,
      limit: parsedLimit,
      skip: parsedSkip,
    });

    const response = {
      posts: result.posts || [],
      totalCount: result.postsConnection?.aggregate?.count || 0,
      query: sanitizedQuery,
      limit: parsedLimit,
      skip: parsedSkip,
      hasMore: (result.postsConnection?.aggregate?.count || 0) > parsedSkip + parsedLimit,
    };

    // Cache the result
    await setCacheItem(cacheKey, response, SEARCH_CACHE_TTL);

    console.log(`[Search API] Found ${response.posts.length} posts (total: ${response.totalCount})`);

    return res.status(200).json(response);

  } catch (error) {
    console.error("[Search API] Error:", error);
    
    return res.status(500).json({
      error: "Failed to search posts",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
      posts: [],
      totalCount: 0,
    });
  }
}
