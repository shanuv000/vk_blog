// Direct API service for more reliable data fetching
// This bypasses Apollo Client for critical data

import { requestDeduplicator, generateRequestKey } from '../lib/requestDeduplicator';

/**
 * Fetch data from the direct GraphQL API with request deduplication
 * @param {string} type - The type of query to execute (categories, featuredPosts, recentPosts)
 * @param {Object} variables - Variables to pass to the query
 * @returns {Promise<Object>} - The query result
 */
export const fetchDirectApi = async (type, variables = {}) => {
  // Generate unique request key for deduplication
  const requestKey = generateRequestKey(type, variables);
  
  return requestDeduplicator.execute(requestKey, async () => {
    try {
      // For client-side requests, use the API route
      if (typeof window !== "undefined") {
      // Use GET for simple requests without variables
      if (Object.keys(variables).length === 0) {
        const response = await fetch(`/api/direct-graphql?type=${type}`);
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return await response.json();
      }

      // Use POST for requests with variables
      const response = await fetch("/api/direct-graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, variables }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      return await response.json();
    }

    // For server-side requests, import the handler directly
    // This is a bit of a hack, but it works for SSR
    else {
      const handler = require("../pages/api/direct-graphql").default;

      // Mock the request and response objects
      const req = {
        method: "POST",
        body: { type, variables },
      };

      let responseData = null;
      const res = {
        status: () => ({
          json: (data) => {
            responseData = data;
            return res;
          },
          end: () => res,
        }),
        setHeader: () => {},
        json: (data) => {
          responseData = data;
          return res;
        },
      };

      await handler(req, res);
        return responseData;
      }
    } catch (error) {
      console.error(`Error fetching from direct API (${type}):`, error);

      // Return default empty data based on query type
      switch (type) {
        case "categories":
          return { categories: [] };
        case "featuredPosts":
        case "recentPosts":
        case "similarPosts":
          return { posts: [] };
        case "adjacentPosts":
          return { next: [], previous: [] };
        default:
          return { data: null };
      }
    }
  });
};

/**
 * Get categories directly
 * @returns {Promise<Array>} - Array of categories
 */
export const getDirectCategories = async () => {
  try {
    const data = await fetchDirectApi("categories");
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories directly:", error);
    return [];
  }
};

/**
 * Get featured posts directly
 * @returns {Promise<Array>} - Array of featured posts
 */
export const getDirectFeaturedPosts = async () => {
  try {
    const data = await fetchDirectApi("featuredPosts");

    // Ensure we have an array of posts
    let posts = data.posts || [];

    // Convert object to array if needed
    if (!Array.isArray(posts) && typeof posts === "object") {
      console.log("Converting posts object to array in getDirectFeaturedPosts");
      posts = Object.values(posts);
    }

    // Process posts to ensure they have valid width and height
    return posts.map((post) => ({
      ...post,
      featuredImage: post.featuredImage
        ? {
            ...post.featuredImage,
            url: post.featuredImage.url || "/default-image.jpg",
            // Fix invalid dimensions (0x0) with proper defaults
            width:
              parseInt(post.featuredImage?.width, 10) > 0
                ? parseInt(post.featuredImage?.width, 10)
                : 800,
            height:
              parseInt(post.featuredImage?.height, 10) > 0
                ? parseInt(post.featuredImage?.height, 10)
                : 600,
          }
        : {
            url: "/default-image.jpg",
            width: 800,
            height: 600,
          },
    }));
  } catch (error) {
    console.error("Error fetching featured posts directly:", error);
    return [];
  }
};

/**
 * Get recent posts directly
 * @returns {Promise<Array>} - Array of recent posts
 */
export const getDirectRecentPosts = async () => {
  try {
    const data = await fetchDirectApi("recentPosts");

    // Ensure we return an array
    if (!data.posts) {
      return [];
    }

    // Convert object to array if needed
    if (!Array.isArray(data.posts) && typeof data.posts === "object") {
      console.log("Converting posts object to array in getDirectRecentPosts");
      return Object.values(data.posts);
    }

    return data.posts;
  } catch (error) {
    console.error("Error fetching recent posts directly:", error);
    return [];
  }
};

/**
 * Get similar posts directly
 * @param {string} slug - The slug of the current post
 * @param {Array<string>} categories - The categories of the current post
 * @returns {Promise<Array>} - Array of similar posts
 */
export const getDirectSimilarPosts = async (slug, categories) => {
  try {
    console.log("getDirectSimilarPosts called with:", { slug, categories });

    // Ensure categories is an array
    const categoryArray = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
      ? [categories]
      : [];

    console.log("Processed categories:", categoryArray);

    if (!slug || categoryArray.length === 0) {
      console.warn("Missing slug or categories for similar posts query");
      return [];
    }

    // Use the Hygraph proxy API directly for this query
    const response = await fetch("/api/hygraph-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
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
        variables: { slug, categories: categoryArray },
      }),
    });

    if (!response.ok) {
      console.warn(
        `Proxy API responded with status: ${response.status}, trying direct fetch`
      );

      // Try fetching directly from the direct-graphql API
      try {
        const directResponse = await fetch(
          `/api/direct-graphql?type=similarPosts&variables=${encodeURIComponent(
            JSON.stringify({ slug, categories: categoryArray })
          )}`
        );

        if (!directResponse.ok) {
          throw new Error(
            `Direct API responded with status: ${directResponse.status}`
          );
        }

        const directData = await directResponse.json();
        return directData.posts || [];
      } catch (directError) {
        console.error("Direct API also failed:", directError);
        throw directError; // Re-throw to be caught by the outer catch
      }
    }

    const data = await response.json();

    // Log the response for debugging
    console.log("Similar posts response:", data);

    // Ensure we return an array
    if (!data.posts) {
      return [];
    }

    // Convert object to array if needed
    if (!Array.isArray(data.posts) && typeof data.posts === "object") {
      console.log("Converting posts object to array in getDirectSimilarPosts");
      return Object.values(data.posts);
    }

    return data.posts;
  } catch (error) {
    console.error("Error fetching similar posts directly:", error);
    return [];
  }
};

/**
 * Get adjacent posts directly
 * @param {string} createdAt - The creation date of the current post
 * @param {string} slug - The slug of the current post
 * @returns {Promise<Object>} - Object containing next and previous posts
 */
export const getDirectAdjacentPosts = async (createdAt, slug) => {
  try {
    if (!createdAt || !slug) {
      console.warn("Missing createdAt or slug for adjacent posts query");
      return { next: null, previous: null };
    }

    // Use the Hygraph proxy API directly for this query
    const response = await fetch("/api/hygraph-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
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
        variables: { createdAt, slug },
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      next: data.next?.[0] || null,
      previous: data.previous?.[0] || null,
    };
  } catch (error) {
    console.error("Error fetching adjacent posts directly:", error);
    return { next: null, previous: null };
  }
};
