import { gql, useQuery, useMutation } from "@apollo/client";
import { initializeApollo } from "../lib/apollo-client";

// Get Apollo Client instance
const getApolloClient = () => initializeApollo();

// GraphQL Queries
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

// Custom hooks for queries
export const usePosts = () => {
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

export const useCategoryPosts = (slug) => {
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

  // Process image dimensions with null safety
  const processedPosts = posts.map((post) => ({
    ...post,
    featuredImage: post.featuredImage
      ? {
          ...post.featuredImage,
          url: post.featuredImage.url || "/default-image.jpg",
          width: parseInt(post.featuredImage?.width, 10) || 800,
          height: parseInt(post.featuredImage?.height, 10) || 600,
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
export const fetchPosts = async () => {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: POSTS_QUERY,
      fetchPolicy: "network-only", // For SSR, always fetch fresh data
    });
    return data.postsConnection.edges;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const fetchPostDetails = async (slug) => {
  try {
    const client = getApolloClient();
    const { data } = await client.query({
      query: POST_DETAILS_QUERY,
      variables: { slug },
      fetchPolicy: "network-only", // For SSR, always fetch fresh data
    });

    if (data.post) {
      return data.post;
    }

    // If post not found, try an alternative query
    const ALTERNATIVE_QUERY = gql`
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

    const { data: alternativeData } = await client.query({
      query: ALTERNATIVE_QUERY,
      variables: { slug },
      fetchPolicy: "network-only",
    });

    if (alternativeData.posts && alternativeData.posts.length > 0) {
      return alternativeData.posts[0];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching post details for slug: ${slug}:`, error);
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
