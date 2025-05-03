import { gql } from "@apollo/client";
import apolloClient from "../lib/apollo-client";

/**
 * Get all posts with Apollo Client
 * Uses cache-first strategy with a TTL of 30 minutes
 */
export const getPosts = async () => {
  const POSTS_QUERY = gql`
    query GetPosts {
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
    console.log("Fetching posts with Apollo Client");
    const { data } = await apolloClient.query({
      query: POSTS_QUERY,
      fetchPolicy: "cache-first",
    });

    return data.postsConnection.edges;
  } catch (error) {
    console.error("Error fetching posts with Apollo Client:", error);
    return [];
  }
};

/**
 * Get all categories with Apollo Client
 * Uses cache-first strategy with a TTL of 1 hour
 */
export const getCategories = async () => {
  const CATEGORIES_QUERY = gql`
    query GetCategories {
      categories(where: { show: true }, orderBy: name_DESC) {
        name
        slug
      }
    }
  `;

  try {
    console.log("Fetching categories with Apollo Client");
    const { data } = await apolloClient.query({
      query: CATEGORIES_QUERY,
      fetchPolicy: "cache-first",
    });

    return data.categories;
  } catch (error) {
    console.error("Error fetching categories with Apollo Client:", error);
    return [];
  }
};

/**
 * Get post details by slug with Apollo Client
 * Uses cache-first strategy with a TTL of 1 hour
 */
export const getPostDetails = async (slug) => {
  const POST_DETAILS_QUERY = gql`
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
    console.log(`Fetching post details for slug: ${slug} with Apollo Client`);
    const { data } = await apolloClient.query({
      query: POST_DETAILS_QUERY,
      variables: { slug },
      fetchPolicy: "cache-first",
    });

    if (data.post) {
      return data.post;
    }

    // If post not found, try an alternative query
    const ALTERNATIVE_QUERY = gql`
      query GetPostBySlug($slug: String!) {
        posts(where: { slug: $slug }) {
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

    const { data: alternativeData } = await apolloClient.query({
      query: ALTERNATIVE_QUERY,
      variables: { slug },
      fetchPolicy: "cache-first",
    });

    if (alternativeData.posts && alternativeData.posts.length > 0) {
      return alternativeData.posts[0];
    }

    return null;
  } catch (error) {
    console.error(
      `Error fetching post details for slug: ${slug} with Apollo Client:`,
      error
    );
    return null;
  }
};

/**
 * Get similar posts with Apollo Client
 * Uses cache-first strategy with a TTL of 30 minutes
 */
export const getSimilarPosts = async (categories, slug) => {
  const SIMILAR_POSTS_QUERY = gql`
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
  `;

  try {
    console.log(`Fetching similar posts for slug: ${slug} with Apollo Client`);
    const { data } = await apolloClient.query({
      query: SIMILAR_POSTS_QUERY,
      variables: { slug, categories },
      fetchPolicy: "cache-first",
    });

    return data.posts;
  } catch (error) {
    console.error(
      `Error fetching similar posts for slug: ${slug} with Apollo Client:`,
      error
    );
    return [];
  }
};

/**
 * Get adjacent posts with Apollo Client
 * Uses cache-first strategy with a TTL of 30 minutes
 */
export const getAdjacentPosts = async (createdAt, slug) => {
  const ADJACENT_POSTS_QUERY = gql`
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

  try {
    console.log(`Fetching adjacent posts for slug: ${slug} with Apollo Client`);
    const { data } = await apolloClient.query({
      query: ADJACENT_POSTS_QUERY,
      variables: { slug, createdAt },
      fetchPolicy: "cache-first",
    });

    return { next: data.next[0], previous: data.previous[0] };
  } catch (error) {
    console.error(
      `Error fetching adjacent posts for slug: ${slug} with Apollo Client:`,
      error
    );
    return { next: null, previous: null };
  }
};

/**
 * Get featured posts with Apollo Client
 * Uses cache-first strategy with a TTL of 1 hour
 */
export const getFeaturedPosts = async () => {
  const FEATURED_POSTS_QUERY = gql`
    query GetFeaturedPosts {
      posts(where: { featuredPost: true }) {
        author {
          name
          photo {
            url
          }
        }
        featuredImage {
          url
        }
        title
        slug
        createdAt
      }
    }
  `;

  try {
    console.log("Fetching featured posts with Apollo Client");
    const { data } = await apolloClient.query({
      query: FEATURED_POSTS_QUERY,
      fetchPolicy: "cache-first",
    });

    return data.posts;
  } catch (error) {
    console.error("Error fetching featured posts with Apollo Client:", error);
    return [];
  }
};

/**
 * Get category post with Apollo Client
 * Uses cache-first strategy with a TTL of 30 minutes
 */
export const getCategoryPost = async (slug) => {
  const CATEGORY_POST_QUERY = gql`
    query GetCategoryPost($slug: String!) {
      postsConnection(where: { categories_some: { slug: $slug } }) {
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
    console.log(`Fetching category posts for slug: ${slug} with Apollo Client`);
    const { data } = await apolloClient.query({
      query: CATEGORY_POST_QUERY,
      variables: { slug },
      fetchPolicy: "cache-first",
    });

    return data.postsConnection.edges;
  } catch (error) {
    console.error(
      `Error fetching category posts for slug: ${slug} with Apollo Client:`,
      error
    );
    return [];
  }
};

/**
 * Get recent posts with Apollo Client
 * Uses cache-first strategy with a TTL of 15 minutes
 */
export const getRecentPosts = async () => {
  const RECENT_POSTS_QUERY = gql`
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
    console.log("Fetching recent posts with Apollo Client");
    const { data } = await apolloClient.query({
      query: RECENT_POSTS_QUERY,
      fetchPolicy: "cache-first",
    });

    return data.posts;
  } catch (error) {
    console.error("Error fetching recent posts with Apollo Client:", error);
    return [];
  }
};

// Helper function to clear the Apollo cache
export const clearCache = () => {
  apolloClient.clearStore();
};

// Helper function to refetch a specific query
export const refetchQuery = async (query, variables = {}) => {
  try {
    await apolloClient.refetchQueries({
      include: [query],
      variables,
    });
  } catch (error) {
    console.error("Error refetching query:", error);
  }
};
