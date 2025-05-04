// Import both the original services and the Apollo hooks
import { fetchFromCDN, fetchFromContentAPI, gql } from "./hygraph";
import { fetchViaProxy, gql as proxyGql } from "./proxy";
import * as apolloHooks from "../hooks/useApolloQueries";
import { initializeApollo } from "../lib/apollo-client";

// Function to get Apollo Client instance
const getApolloClient = () => initializeApollo();

// Flag to control whether to use Apollo Client or the original implementation
const USE_APOLLO = true;

export const getPosts = async () => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    return apolloHooks.fetchPosts();
  }

  // Original implementation as fallback
  const query = gql`
    query MyQuery {
      postsConnection(first: 20, orderBy: publishedAt_DESC) {
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
          }
        }
      }
    }
  `;

  try {
    console.log("Fetching posts");

    // Skip proxy API for server-side rendering
    // This avoids the URL error during build/SSR

    // If proxy fails, fall back to direct CDN
    console.log("Falling back to direct CDN for posts");
    const result = await fetchFromCDN(query);
    return result.postsConnection.edges;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const getCategories = async () => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    try {
      const client = getApolloClient();
      const { data } = await client.query({
        query: apolloHooks.CATEGORIES_QUERY,
        fetchPolicy: "network-only", // Always fetch fresh data for categories
      });

      if (!data || !data.categories) {
        console.error("No categories data returned from Apollo");
        throw new Error("No categories data returned");
      }

      return data.categories;
    } catch (error) {
      console.error("Error fetching categories with Apollo:", error);
      // Fall back to original implementation
    }
  }

  // Original implementation as fallback
  const query = gql`
    query GetGategories {
      categories(where: { show: true }, orderBy: name_DESC) {
        name
        slug
      }
    }
  `;

  try {
    console.log("Fetching categories with direct CDN");
    const result = await fetchFromCDN(query);

    if (!result || !result.categories) {
      console.error("No categories data returned from CDN");
      return [];
    }

    return result.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getPostDetails = async (slug) => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    try {
      const result = await apolloHooks.fetchPostDetails(slug);
      console.log(
        `Apollo fetchPostDetails for slug "${slug}" returned:`,
        result ? "data" : "null"
      );
      return result;
    } catch (apolloError) {
      console.error(
        `Apollo fetchPostDetails failed for slug "${slug}":`,
        apolloError
      );
      // Fall back to original implementation
    }
  }

  // Original implementation as fallback
  // Define the query to fetch post details
  const query = gql`
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
  `;

  // Alternative query that uses posts collection
  const alternativeQuery = gql`
    query GetPostDetailsAlternative($slug: String!) {
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
  `;

  try {
    console.log(`Fetching post details for slug: ${slug}`);

    // Try direct CDN first with detailed logging
    try {
      console.log(`Attempting direct CDN fetch for slug: ${slug}`);
      const result = await fetchFromCDN(query, { slug });

      if (result.post) {
        console.log(`Successfully fetched post for slug: ${slug} from CDN`);
        return result.post;
      } else {
        console.warn(`CDN returned no post data for slug: ${slug}`);
      }
    } catch (cdnError) {
      console.error(`CDN fetch failed for slug: ${slug}:`, cdnError);
    }

    // Try alternative query as a last resort
    console.log(`Trying alternative query for slug: ${slug}`);
    try {
      const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });
      if (alternativeResult.posts && alternativeResult.posts.length > 0) {
        console.log(`Alternative query succeeded for slug: ${slug}`);
        return alternativeResult.posts[0];
      } else {
        console.warn(`Alternative query returned no results for slug: ${slug}`);
      }
    } catch (altError) {
      console.error(`Alternative query failed for slug: ${slug}:`, altError);
    }

    console.log(`All attempts to fetch post for slug: ${slug} failed`);
    return null;
  } catch (error) {
    console.error(`Error fetching post details for slug: ${slug}:`, error);
    return null;
  }
};

export const getSimilarPosts = async (categories, slug) => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    const client = getApolloClient();
    const { data } = await client.query({
      query: apolloHooks.SIMILAR_POSTS_QUERY,
      variables: { slug, categories },
      fetchPolicy: "cache-first",
    });
    return data.posts || [];
  }

  // Original implementation as fallback
  const query = gql`
    query GetPostDetails($slug: String!, $categories: [String!]) {
      posts(
        where: {
          slug_not: $slug
          AND: { categories_some: { slug_in: $categories } }
        }
        last: 3
      ) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `;
  const result = await fetchFromCDN(query, { slug, categories });
  return result.posts;
};

export const getAdjacentPosts = async (createdAt, slug) => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    const client = getApolloClient();
    const { data } = await client.query({
      query: apolloHooks.ADJACENT_POSTS_QUERY,
      variables: { slug, createdAt },
      fetchPolicy: "cache-first",
    });
    return {
      next: data.next?.[0] || null,
      previous: data.previous?.[0] || null,
    };
  }

  // Original implementation as fallback
  const query = gql`
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
  `;

  const result = await fetchFromCDN(query, { slug, createdAt });
  return { next: result.next[0], previous: result.previous[0] };
};

export const getCategoryPost = async (slug) => {
  if (!slug) {
    console.error("No slug provided to getCategoryPost");
    return [];
  }

  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    try {
      const client = getApolloClient();
      const { data } = await client.query({
        query: apolloHooks.CATEGORY_POSTS_QUERY,
        variables: { slug },
        fetchPolicy: "network-only", // Always fetch fresh data for category pages
      });

      if (data && data.postsConnection && data.postsConnection.edges) {
        console.log(
          `Found ${data.postsConnection.edges.length} posts for category ${slug} with Apollo`
        );
        return data.postsConnection.edges;
      } else {
        console.warn(
          `No posts found for category ${slug} with Apollo, trying fallback`
        );
        throw new Error("No posts found with Apollo");
      }
    } catch (error) {
      console.error(
        `Error fetching category posts for ${slug} with Apollo:`,
        error
      );
      // Fall back to original implementation
    }
  }

  // Original implementation as fallback
  // Standard query using postsConnection
  const query = gql`
    query GetCategoryPost($slug: String!) {
      postsConnection(
        where: { categories_some: { slug: $slug } }
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
      }
    }
  `;

  // Alternative query that doesn't filter by date
  const alternativeQuery = gql`
    query GetCategoryPostAlternative($slug: String!) {
      categories(where: { slug: $slug }) {
        name
        posts {
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
    }
  `;

  try {
    console.log(`Fetching category posts for slug: ${slug} with direct CDN`);
    const result = await fetchFromCDN(query, { slug });

    if (result && result.postsConnection && result.postsConnection.edges) {
      console.log(
        `Found ${result.postsConnection.edges.length} posts for category ${slug} with direct CDN`
      );
      return result.postsConnection.edges;
    }

    // Try alternative query as a last resort
    console.log(`Trying alternative query for category ${slug}`);
    const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });

    if (
      alternativeResult &&
      alternativeResult.categories &&
      alternativeResult.categories.length > 0 &&
      alternativeResult.categories[0].posts &&
      alternativeResult.categories[0].posts.length > 0
    ) {
      const posts = alternativeResult.categories[0].posts;
      console.log(
        `Found ${posts.length} posts for category ${slug} with alternative query`
      );

      // Convert to the same format as the standard query
      return posts.map((post) => ({
        node: post,
      }));
    }

    console.log(`All attempts to fetch posts for category ${slug} failed`);
    return [];
  } catch (error) {
    console.error(`Error fetching category posts for ${slug}:`, error);
    return [];
  }
};

export const getFeaturedPosts = async () => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    try {
      const client = getApolloClient();
      const { data } = await client.query({
        query: apolloHooks.FEATURED_POSTS_QUERY,
        fetchPolicy: "cache-first",
      });

      const posts = data?.posts || [];

      // Process image dimensions
      return posts.map((post) => ({
        ...post,
        featuredImage: {
          ...post.featuredImage,
          width: parseInt(post.featuredImage?.width, 10) || 30,
          height: parseInt(post.featuredImage?.height, 10) || 30,
        },
      }));
    } catch (apolloError) {
      console.error("Error fetching featured posts with Apollo:", apolloError);
      // Fall back to proxy or direct methods
    }
  }

  // Original implementation as fallback
  const query = gql`
    query GetCategoryPost {
      posts(where: { featuredpost: true }, first: 12, orderBy: createdAt_DESC) {
        author {
          name
          photo {
            url
          }
        }
        featuredImage {
          url
          width
          height
        }
        title
        slug
        createdAt
      }
    }
  `;

  try {
    let result;

    // Use proxy API for client-side requests to avoid CORS issues
    if (typeof window !== "undefined") {
      console.log("Fetching featured posts via proxy API");
      result = await fetchViaProxy(query);
    } else {
      // Use direct CDN for server-side rendering
      console.log("Fetching featured posts via direct CDN (server-side)");
      result = await fetchFromCDN(query);
    }

    return result.posts.map((post) => ({
      ...post,
      featuredImage: {
        ...post.featuredImage,
        width: parseInt(post.featuredImage?.width, 10) || 30, // Parse to integer, default to 30
        height: parseInt(post.featuredImage?.height, 10) || 30,
      },
    }));
  } catch (error) {
    console.error("Error fetching featured posts:", error);

    // Last resort: try direct CDN if proxy failed
    if (typeof window !== "undefined") {
      try {
        console.log("Proxy failed, trying direct CDN as last resort");
        const result = await fetchFromCDN(query);

        return result.posts.map((post) => ({
          ...post,
          featuredImage: {
            ...post.featuredImage,
            width: parseInt(post.featuredImage?.width, 10) || 30,
            height: parseInt(post.featuredImage?.height, 10) || 30,
          },
        }));
      } catch (fallbackError) {
        console.error(
          "All attempts to fetch featured posts failed:",
          fallbackError
        );
      }
    }

    return [];
  }
};

export const getRecentPosts = async () => {
  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    try {
      const client = getApolloClient();
      const { data } = await client.query({
        query: apolloHooks.RECENT_POSTS_QUERY,
        fetchPolicy: "cache-first",
      });
      return data.posts || [];
    } catch (error) {
      console.error("Error fetching recent posts with Apollo:", error);
      return [];
    }
  }

  // Original implementation as fallback
  const query = gql`
    query GetPostDetails {
      posts(orderBy: createdAt_ASC, last: 3) {
        title
        featuredImage {
          url
        }
        createdAt
        slug
      }
    }
  `;
  const result = await fetchFromCDN(query);
  return result.posts;
};

// Export utility functions for cache management
export const clearCache = () => {
  if (USE_APOLLO) {
    return apolloHooks.clearCache();
  }
};

export const refetchQueries = async (queries = []) => {
  if (USE_APOLLO) {
    return apolloHooks.refetchQueries(queries);
  }
};

// Export Apollo hooks for direct use in components
export const useApolloHooks = () => {
  return apolloHooks;
};
