// Import both the original services and the Apollo hooks
import { fetchFromCDN, fetchFromContentAPI, gql } from "./hygraph";
import { fetchViaProxy, gql as proxyGql } from "./proxy";
import * as apolloHooks from "../hooks/useApolloQueries";
import { initializeApollo } from "../lib/apollo-client";

// Function to get Apollo Client instance
const getApolloClient = () => initializeApollo();

// Flag to control whether to use Apollo Client or the original implementation
const USE_APOLLO = true;

export const getPosts = async (options = {}) => {
  // Default options
  const {
    limit = 12, // Lower default to reduce payload and Hygraph usage
    fields = "full", // 'full' or 'minimal'
    forStaticPaths = false, // Special flag for getStaticPaths usage
    cacheKey = null, // Optional cache key for memoization
  } = options;

  // Check if we're in a build context (for static generation)
  const isBuildTime = typeof window === "undefined";

  // For getStaticPaths, we only need slugs, so use a minimal query
  if (forStaticPaths && isBuildTime) {
    console.log(
      `[getPosts] Optimized fetch for static paths (limit: ${limit})`
    );

    // Use a minimal query that only fetches slugs
    const minimalQuery = gql`
      query GetPostSlugs($limit: Int!) {
        postsConnection(first: $limit, orderBy: publishedAt_DESC) {
          edges {
            node {
              slug
            }
          }
        }
      }
    `;

    try {
      const result = await fetchFromCDN(minimalQuery, { limit });
      console.log(
        `[getPosts] Fetched ${result.postsConnection.edges.length} post slugs for static paths`
      );
      return result.postsConnection.edges;
    } catch (error) {
      console.error("[getPosts] Error fetching post slugs:", error);
      return [];
    }
  }

  // Use Apollo Client if enabled (for normal page rendering)
  if (USE_APOLLO && !forStaticPaths) {
    try {
      const posts = await apolloHooks.fetchPosts(limit);
      return posts;
    } catch (apolloError) {
      console.error("[getPosts] Apollo fetch failed:", apolloError);
      // Fall back to direct implementation
    }
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
    `;
  }

  // Build the query with the appropriate fields and limit
  const query = gql`
    query GetPosts($limit: Int!) {
      postsConnection(first: $limit, orderBy: publishedAt_DESC) {
        edges {
          cursor
          node {
            ${fieldsFragment}
          }
        }
      }
    }
  `;

  try {
    console.log(
      `[getPosts] Fetching posts (limit: ${limit}, fields: ${fields})`
    );

    // Use direct CDN for server-side rendering
    const result = await fetchFromCDN(query, { limit });
    console.log(
      `[getPosts] Successfully fetched ${result.postsConnection.edges.length} posts`
    );
    return result.postsConnection.edges;
  } catch (error) {
    console.error("[getPosts] Error fetching posts:", error);
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
  console.log(`[getPostDetails] Starting fetch for slug: "${slug}"`);

  // Use Apollo Client if enabled
  if (USE_APOLLO) {
    try {
      console.log(
        `[getPostDetails] Attempting Apollo fetch for slug: "${slug}"`
      );
      const result = await apolloHooks.fetchPostDetails(slug);

      if (!result) {
        console.warn(
          `[getPostDetails] Apollo returned null for slug: "${slug}"`
        );
      } else {
        console.log(
          `[getPostDetails] Apollo successfully fetched data for slug: "${slug}"`
        );

        // Validate content structure
        if (!result.content) {
          console.warn(
            `[getPostDetails] Post for slug "${slug}" is missing content property`
          );
        } else {
          const contentKeys = Object.keys(result.content);
          console.log(
            `[getPostDetails] Content structure for "${slug}": ${contentKeys.join(
              ", "
            )}`
          );

          // Check for critical content fields
          if (!result.content.raw && !result.content.json) {
            console.warn(
              `[getPostDetails] Post "${slug}" missing both content.raw and content.json`
            );
          }
        }

        // Check for other critical fields
        if (!result.title) {
          console.warn(`[getPostDetails] Post "${slug}" missing title`);
        }

        if (!result.featuredImage || !result.featuredImage.url) {
          console.warn(
            `[getPostDetails] Post "${slug}" missing featuredImage or url`
          );
        }

        return result;
      }
    } catch (apolloError) {
      console.error(
        `[getPostDetails] Apollo fetch failed for slug "${slug}":`,
        apolloError.message
      );
      console.error(`[getPostDetails] Error stack:`, apolloError.stack);

      // Log more details about the error
      if (apolloError.graphQLErrors) {
        console.error(
          `[getPostDetails] GraphQL Errors:`,
          JSON.stringify(apolloError.graphQLErrors)
        );
      }
      if (apolloError.networkError) {
        console.error(
          `[getPostDetails] Network Error:`,
          apolloError.networkError.message
        );
      }

      // Fall back to original implementation
      console.log(
        `[getPostDetails] Falling back to direct implementation for "${slug}"`
      );
    }
  }

  // Original implementation as fallback
  // Define the query to fetch post details with updated structure
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
          json
          references {
            ... on Asset {
              id
              url
              mimeType
              width
              height
            }
          }
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
          json
          references {
            ... on Asset {
              id
              url
              mimeType
              width
              height
            }
          }
        }
        categories {
          name
          slug
        }
      }
    }
  `;

  // Simplified query as a last resort
  const simplifiedQuery = gql`
    query GetSimplifiedPostDetails($slug: String!) {
      post(where: { slug: $slug }) {
        title
        excerpt
        featuredImage {
          url
        }
        author {
          name
          photo {
            url
          }
        }
        createdAt
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
        // Log content structure to help debug
        if (result.post.content) {
          console.log(
            `Content structure: ${Object.keys(result.post.content).join(", ")}`
          );

          // Handle references field - ensure it's always an array
          if (!result.post.content.references) {
            console.log(`No references found, adding empty array`);
            result.post.content.references = [];
          } else if (!Array.isArray(result.post.content.references)) {
            console.log(`References is not an array, converting to array`);
            try {
              result.post.content.references = Object.values(
                result.post.content.references
              );
            } catch (e) {
              console.error(`Failed to convert references to array:`, e);
              result.post.content.references = [];
            }
          }

          console.log(
            `References count: ${result.post.content.references.length}`
          );
        }
        return result.post;
      } else {
        console.warn(`CDN returned no post data for slug: ${slug}`);
      }
    } catch (cdnError) {
      console.error(`CDN fetch failed for slug: ${slug}:`, cdnError);
      console.error(`Error details:`, cdnError.message);

      // Check if this is a GraphQL error related to the references field
      const isReferencesError =
        cdnError.message &&
        (cdnError.message.includes("Fragment cannot be spread here") ||
          cdnError.message.includes("PostContentRichTextEmbeddedTypes") ||
          cdnError.message.includes("Asset"));

      if (isReferencesError) {
        console.log(`Detected references field error, trying minimal query`);

        // Create a minimal query that doesn't include the references field
        const minimalQuery = gql`
          query GetMinimalPostDetails($slug: String!) {
            post(where: { slug: $slug }) {
              title
              excerpt
              featuredImage {
                url
              }
              author {
                name
                photo {
                  url
                }
              }
              createdAt
              slug
              content {
                raw
                json
              }
              categories {
                name
                slug
              }
            }
          }
        `;

        try {
          const minimalResult = await fetchFromCDN(minimalQuery, { slug });
          if (minimalResult.post) {
            console.log(`Minimal query succeeded for slug: ${slug}`);

            // Add empty references array to avoid errors in the renderer
            if (minimalResult.post.content) {
              minimalResult.post.content.references = [];
            }

            return minimalResult.post;
          }
        } catch (minimalError) {
          console.error(`Minimal query also failed:`, minimalError);
        }
      }
    }

    // Try alternative query as a second attempt
    console.log(`Trying alternative query for slug: ${slug}`);
    try {
      const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });
      if (alternativeResult.posts && alternativeResult.posts.length > 0) {
        console.log(`Alternative query succeeded for slug: ${slug}`);

        // Ensure references is an array
        const post = alternativeResult.posts[0];
        if (post.content && !post.content.references) {
          post.content.references = [];
        } else if (post.content && !Array.isArray(post.content.references)) {
          try {
            post.content.references = Object.values(post.content.references);
          } catch (e) {
            post.content.references = [];
          }
        }

        return post;
      } else {
        console.warn(`Alternative query returned no results for slug: ${slug}`);
      }
    } catch (altError) {
      console.error(`Alternative query failed for slug: ${slug}:`, altError);
    }

    // Try simplified query as a last resort
    console.log(`Trying simplified query for slug: ${slug}`);
    try {
      const simplifiedResult = await fetchFromCDN(simplifiedQuery, { slug });
      if (simplifiedResult.post) {
        console.log(`Simplified query succeeded for slug: ${slug}`);

        // Add empty references array to avoid errors in the renderer
        if (simplifiedResult.post.content) {
          simplifiedResult.post.content.references = [];
        }

        return simplifiedResult.post;
      } else {
        console.warn(`Simplified query returned no results for slug: ${slug}`);
      }
    } catch (simplifiedError) {
      console.error(
        `Simplified query failed for slug: ${slug}:`,
        simplifiedError
      );
    }

    console.log(`All attempts to fetch post for slug: ${slug} failed`);
    return null;
  } catch (error) {
    console.error(`Error fetching post details for slug: ${slug}:`, error);
    console.error(`Error stack:`, error.stack);
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

  // ⚠️ DEPRECATED: This Apollo query loads ALL category posts at once!
  // Use the new pagination service instead for better performance
  console.warn(
    `⚠️ getCategoryPost for ${slug} should use pagination service instead of loading all posts at once`
  );

  // Use Apollo Client if enabled (but with warning)
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
          `⚠️ Loaded ${data.postsConnection.edges.length} posts for category ${slug} with Apollo (inefficient - use pagination instead)`
        );
        // Cap the number of edges returned to reduce overfetching
        return data.postsConnection.edges.slice(0, 12);
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
      // Cap results to prevent loading too many at once
      return result.postsConnection.edges.slice(0, 12);
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
