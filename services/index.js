import { fetchFromCDN, fetchFromContentAPI, gql } from "./hygraph";
import { fetchViaProxy, gql as proxyGql } from "./proxy";

export const getPosts = async () => {
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

    // First try using the proxy API to avoid CORS issues
    try {
      console.log("Trying proxy API for posts");
      const proxyResult = await fetchViaProxy(query);

      if (proxyResult.postsConnection && proxyResult.postsConnection.edges) {
        console.log(
          `Found ${proxyResult.postsConnection.edges.length} posts using proxy API`
        );
        return proxyResult.postsConnection.edges;
      }
    } catch (proxyError) {
      console.error("Proxy API failed for posts:", proxyError);
    }

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
  const query = gql`
    query GetGategories {
      categories(where: { show: true }, orderBy: name_DESC) {
        name
        slug
      }
    }
  `;

  try {
    console.log("Fetching categories");

    // First try using the proxy API to avoid CORS issues
    try {
      console.log("Trying proxy API for categories");
      const proxyResult = await fetchViaProxy(query);

      if (proxyResult.categories) {
        console.log(
          `Found ${proxyResult.categories.length} categories using proxy API`
        );
        return proxyResult.categories;
      }
    } catch (proxyError) {
      console.error("Proxy API failed for categories:", proxyError);
    }

    // If proxy fails, fall back to direct CDN
    console.log("Falling back to direct CDN for categories");
    const result = await fetchFromCDN(query);
    return result.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getPostDetails = async (slug) => {
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

    // First try using the proxy API to avoid CORS issues
    try {
      console.log(`Trying proxy API for slug: ${slug}`);
      const proxyResult = await fetchViaProxy(query, { slug });

      if (proxyResult.post) {
        console.log(
          `Successfully fetched post for slug: ${slug} using proxy API`
        );
        return proxyResult.post;
      }

      // If direct query via proxy fails, try the alternative query via proxy
      console.log(
        `No post found with direct query via proxy for slug: ${slug}, trying alternative query`
      );
      const proxyAlternativeResult = await fetchViaProxy(alternativeQuery, {
        slug,
      });

      if (
        proxyAlternativeResult.posts &&
        proxyAlternativeResult.posts.length > 0
      ) {
        console.log(
          `Found post using alternative query via proxy for slug: ${slug}`
        );
        return proxyAlternativeResult.posts[0];
      }
    } catch (proxyError) {
      console.error(`Proxy API failed for slug: ${slug}:`, proxyError);
    }

    // If proxy fails, fall back to direct CDN
    console.log(
      `Proxy API failed, falling back to direct CDN for slug: ${slug}`
    );
    const result = await fetchFromCDN(query, { slug });

    if (result.post) {
      return result.post;
    }

    // Try alternative query as a last resort
    const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });
    if (alternativeResult.posts && alternativeResult.posts.length > 0) {
      return alternativeResult.posts[0];
    }

    console.log(`All attempts to fetch post for slug: ${slug} failed`);
    return null;
  } catch (error) {
    console.error(`Error fetching post details for slug: ${slug}:`, error);
    return null;
  }
};

export const getSimilarPosts = async (categories, slug) => {
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
    console.log(`Fetching category posts for slug: ${slug}`);

    // First try using the proxy API to avoid CORS issues
    try {
      console.log(`Trying proxy API for category: ${slug}`);
      const proxyResult = await fetchViaProxy(query, { slug });

      if (
        proxyResult.postsConnection &&
        proxyResult.postsConnection.edges &&
        proxyResult.postsConnection.edges.length > 0
      ) {
        console.log(
          `Successfully fetched category posts for ${slug} using proxy API`
        );
        return proxyResult.postsConnection.edges;
      }

      // If standard query via proxy fails, try the alternative query via proxy
      console.log(
        `No posts found with standard query via proxy for category: ${slug}, trying alternative query`
      );
      const proxyAlternativeResult = await fetchViaProxy(alternativeQuery, {
        slug,
      });

      if (
        proxyAlternativeResult.categories &&
        proxyAlternativeResult.categories.length > 0 &&
        proxyAlternativeResult.categories[0].posts &&
        proxyAlternativeResult.categories[0].posts.length > 0
      ) {
        const posts = proxyAlternativeResult.categories[0].posts;
        console.log(
          `Found ${posts.length} posts for category ${slug} using alternative query via proxy`
        );

        // Convert to the same format as the standard query
        return posts.map((post) => ({
          node: post,
        }));
      }
    } catch (proxyError) {
      console.error(`Proxy API failed for category ${slug}:`, proxyError);
    }

    // If proxy fails, fall back to direct CDN
    console.log(
      `Proxy API failed, falling back to direct CDN for category: ${slug}`
    );
    const result = await fetchFromCDN(query, { slug });

    if (result.postsConnection && result.postsConnection.edges) {
      return result.postsConnection.edges;
    }

    // Try alternative query as a last resort
    const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });
    if (
      alternativeResult.categories &&
      alternativeResult.categories.length > 0 &&
      alternativeResult.categories[0].posts &&
      alternativeResult.categories[0].posts.length > 0
    ) {
      const posts = alternativeResult.categories[0].posts;

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
    const result = await fetchFromCDN(query);

    return result.posts.map((post) => ({
      ...post,
      featuredImage: {
        ...post.featuredImage,
        width: parseInt(post.featuredImage.width, 10) || 30, // Parse to integer, default to 30
        height: parseInt(post.featuredImage.height, 10) || 30,
      },
    }));
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    return [];
  }
};
// ... (imports) ...
export const submitComment = async (obj) => {
  try {
    const result = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!result.ok) {
      const errorResponse = await result.json();
      throw new Error(errorResponse.error || "Failed to submit comment");
    }

    return result.json();
  } catch (error) {
    console.error("Error submitting comment:", error);
    throw error; // Re-throw the error to be handled in handleCommentSubmission
  }
};

export const getComments = async (slug) => {
  try {
    const query = gql`
      query GetComments($slug: String!) {
        comments(where: { post: { slug: $slug } }) {
          name
          createdAt
          comment
        }
      }
    `;

    const result = await fetchFromCDN(query, { slug });

    if (result.errors) {
      // Assuming Hygraph's error format (adjust as needed)
      throw new Error(result.errors[0].message || "Failed to fetch comments");
    }

    return result.comments;
  } catch (error) {
    console.error("Error fetching comments:", error);

    // Handle the error similar to how it's done in submitComment()
    throw error;
  }
};

export const getRecentPosts = async () => {
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
