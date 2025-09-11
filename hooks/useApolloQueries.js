import { gql, useQuery, useMutation } from "@apollo/client";
import { initializeApollo } from "../lib/apollo-client";

// Get Apollo Client instance
const getApolloClient = () => initializeApollo();

// GraphQL Queries
// ⚠️ INEFFICIENT: Loads 20 posts at once - Use pagination service instead
export const POSTS_QUERY = gql`
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

export const CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      name
      slug
    }
  }
`;

export const POST_DETAILS_QUERY = gql`
  query GetPostDetails($slug: String!) {
    post(where: { slug: $slug }) {
      title
      excerpt
      featuredImage {
        url
        width
        height
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
      }
      categories {
        name
        slug
      }
    }
  }
`;

export const SIMILAR_POSTS_QUERY = gql`
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

export const ADJACENT_POSTS_QUERY = gql`
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

// ⚠️ VERY INEFFICIENT: NO LIMIT - Loads ALL category posts at once!
export const CATEGORY_POSTS_QUERY = gql`
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

export const FEATURED_POSTS_QUERY = gql`
  query GetFeaturedPosts {
    posts(where: { featuredpost: true }, first: 12, orderBy: createdAt_DESC) {
      author {
        name
        # Include id if available, but it's optional
        id
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

export const RECENT_POSTS_QUERY = gql`
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
`;

// Custom hooks for queries
// ⚠️ DEPRECATED: Use useInfiniteScroll hook instead for better performance
export const usePosts = () => {
  console.warn(
    "⚠️ usePosts is deprecated. Use useInfiniteScroll hook for better performance with pagination."
  );
  const { data, loading, error, refetch } = useQuery(POSTS_QUERY, {
    fetchPolicy: "cache-and-network",
  });

  return {
    posts: data?.postsConnection?.edges || [],
    loading,
    error,
    refetch,
  };
};

export const useCategories = () => {
  const { data, loading, error, refetch } = useQuery(CATEGORIES_QUERY, {
    fetchPolicy: "cache-first",
  });

  return {
    categories: data?.categories || [],
    loading,
    error,
    refetch,
  };
};

export const usePostDetails = (slug) => {
  const { data, loading, error, refetch } = useQuery(POST_DETAILS_QUERY, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
    skip: !slug,
  });

  return {
    post: data?.post || null,
    loading,
    error,
    refetch,
  };
};

export const useSimilarPosts = (slug, categories) => {
  const { data, loading, error } = useQuery(SIMILAR_POSTS_QUERY, {
    variables: { slug, categories },
    fetchPolicy: "cache-first",
    skip: !slug || !categories || categories.length === 0,
  });

  return {
    posts: data?.posts || [],
    loading,
    error,
  };
};

export const useAdjacentPosts = (slug, createdAt) => {
  const { data, loading, error } = useQuery(ADJACENT_POSTS_QUERY, {
    variables: { slug, createdAt },
    fetchPolicy: "cache-first",
    skip: !slug || !createdAt,
  });

  return {
    next: data?.next?.[0] || null,
    previous: data?.previous?.[0] || null,
    loading,
    error,
  };
};

// ⚠️ DEPRECATED: Use useInfiniteScroll hook instead for better performance
export const useCategoryPosts = (slug) => {
  console.warn(
    "⚠️ useCategoryPosts is deprecated. Use useInfiniteScroll hook with type='category' for better performance with pagination."
  );
  const { data, loading, error, refetch } = useQuery(CATEGORY_POSTS_QUERY, {
    variables: { slug },
    fetchPolicy: "cache-and-network",
    skip: !slug,
  });

  return {
    posts: data?.postsConnection?.edges || [],
    loading,
    error,
    refetch,
  };
};

export const useFeaturedPosts = () => {
  const { data, loading, error, refetch } = useQuery(FEATURED_POSTS_QUERY, {
    fetchPolicy: "cache-first",
    errorPolicy: "all", // Continue even if there are errors
  });

  const posts = data?.posts || [];

  // Process image dimensions with null safety and fix invalid dimensions
  const processedPosts = posts.map((post) => ({
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

  return {
    posts: processedPosts,
    loading,
    error,
    refetch,
  };
};

export const useRecentPosts = () => {
  const { data, loading, error } = useQuery(RECENT_POSTS_QUERY, {
    fetchPolicy: "cache-first",
  });

  return {
    posts: data?.posts || [],
    loading,
    error,
  };
};

// Direct client methods for SSR and special cases
export const fetchPosts = async (limit = 20) => {
  try {
    const client = getApolloClient();

    // Create a dynamic query with the limit parameter
    const DYNAMIC_POSTS_QUERY = gql`
      query GetPosts($limit: Int!) {
        postsConnection(first: $limit, orderBy: publishedAt_DESC) {
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

    const { data } = await client.query({
      query: DYNAMIC_POSTS_QUERY,
      variables: { limit },
      fetchPolicy: "network-only", // For SSR, always fetch fresh data
    });

    console.log(
      `[fetchPosts] Fetched ${data.postsConnection.edges.length} posts with Apollo`
    );
    return data.postsConnection.edges;
  } catch (error) {
    console.error("[fetchPosts] Error fetching posts with Apollo:", error);
    return [];
  }
};

export const fetchPostDetails = async (slug) => {
  try {
    console.log(`Fetching post details for slug: ${slug} using Apollo Client`);
    const client = getApolloClient();
    const { data } = await client.query({
      query: POST_DETAILS_QUERY,
      variables: { slug },
      fetchPolicy: "network-only", // For SSR, always fetch fresh data
    });

    if (data && data.post) {
      console.log(`Successfully fetched post data for slug: ${slug}`);
      // Log content structure to help debug
      if (data.post.content) {
        console.log(
          `Content structure: ${Object.keys(data.post.content).join(", ")}`
        );
        if (data.post.content.references) {
          console.log(
            `References count: ${data.post.content.references.length}`
          );
        }
      }
      return data.post;
    } else {
      console.log(`No post found for slug: ${slug}, trying alternative query`);
    }

    // If post not found, try an alternative query
    const ALTERNATIVE_QUERY = gql`
      query GetPostBySlug($slug: String!) {
        posts(where: { slug: $slug }, first: 1) {
          title
          excerpt
          featuredImage {
            url
            width
            height
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
          }
          categories {
            name
            slug
          }
        }
      }
    `;

    const { data: alternativeData } = await client.query({
      query: ALTERNATIVE_QUERY,
      variables: { slug },
      fetchPolicy: "network-only",
    });

    if (
      alternativeData &&
      alternativeData.posts &&
      alternativeData.posts.length > 0
    ) {
      console.log(`Found post using alternative query for slug: ${slug}`);
      return alternativeData.posts[0];
    }

    // If both queries fail, try a simplified query as last resort
    const SIMPLIFIED_QUERY = gql`
      query GetSimplifiedPostBySlug($slug: String!) {
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
      console.log(`Trying simplified query for slug: ${slug}`);
      const { data: simplifiedData } = await client.query({
        query: SIMPLIFIED_QUERY,
        variables: { slug },
        fetchPolicy: "network-only",
      });

      if (simplifiedData && simplifiedData.post) {
        console.log(`Found post using simplified query for slug: ${slug}`);
        return simplifiedData.post;
      }
    } catch (simplifiedError) {
      console.error(
        `Simplified query failed for slug: ${slug}:`,
        simplifiedError
      );
    }

    console.log(`All queries failed for slug: ${slug}`);
    return null;
  } catch (error) {
    console.error(`Error fetching post details for slug: ${slug}:`, error);
    console.error(`Error details:`, error.message);
    if (error.graphQLErrors) {
      console.error(`GraphQL Errors:`, error.graphQLErrors);
    }
    if (error.networkError) {
      console.error(`Network Error:`, error.networkError);
    }
    return null;
  }
};

// Cache management utilities
export const clearCache = () => {
  const client = getApolloClient();
  return client.clearStore();
};

export const refetchQueries = async (queries = []) => {
  const client = getApolloClient();
  return client.refetchQueries({
    include:
      queries.length > 0
        ? queries
        : [
            POSTS_QUERY,
            CATEGORIES_QUERY,
            FEATURED_POSTS_QUERY,
            RECENT_POSTS_QUERY,
          ],
  });
};
