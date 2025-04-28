import { fetchFromCDN, fetchFromContentAPI, gql } from "./hygraph";

export const getPosts = async () => {
  // Standard query using postsConnection with publishedAt ordering
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

  // Alternative query using createdAt ordering
  const alternativeQuery = gql`
    query MyAlternativeQuery {
      postsConnection(first: 20, orderBy: createdAt_DESC) {
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
    console.log("Fetching posts using standard query");
    const result = await fetchFromCDN(query);

    if (
      result.postsConnection &&
      result.postsConnection.edges &&
      result.postsConnection.edges.length > 0
    ) {
      console.log(
        `Found ${result.postsConnection.edges.length} posts using standard query`
      );
      return result.postsConnection.edges;
    }

    console.log(
      "No posts found using standard query, trying alternative query"
    );

    // If standard query returns no results, try the alternative query
    const alternativeResult = await fetchFromCDN(alternativeQuery);

    if (
      alternativeResult.postsConnection &&
      alternativeResult.postsConnection.edges &&
      alternativeResult.postsConnection.edges.length > 0
    ) {
      console.log(
        `Found ${alternativeResult.postsConnection.edges.length} posts using alternative query`
      );
      return alternativeResult.postsConnection.edges;
    }

    console.log("No posts found using alternative query, trying content API");

    // Try content API with standard query
    try {
      const contentResult = await fetchFromContentAPI(query);
      if (
        contentResult.postsConnection &&
        contentResult.postsConnection.edges &&
        contentResult.postsConnection.edges.length > 0
      ) {
        console.log(
          `Found ${contentResult.postsConnection.edges.length} posts using content API`
        );
        return contentResult.postsConnection.edges;
      }
    } catch (contentError) {
      console.error("Content API query failed:", contentError);
    }

    // Try content API with alternative query
    try {
      const contentAlternativeResult = await fetchFromContentAPI(
        alternativeQuery
      );
      if (
        contentAlternativeResult.postsConnection &&
        contentAlternativeResult.postsConnection.edges &&
        contentAlternativeResult.postsConnection.edges.length > 0
      ) {
        console.log(
          `Found ${contentAlternativeResult.postsConnection.edges.length} posts using content API alternative query`
        );
        return contentAlternativeResult.postsConnection.edges;
      }
    } catch (contentAltError) {
      console.error("Content API alternative query failed:", contentAltError);
    }

    console.log("All attempts to fetch posts failed");
    return [];
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

  const result = await fetchFromCDN(query);
  return result.categories;
};

export const getPostDetails = async (slug) => {
  // First, try the direct query approach
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

  // Alternative query that uses posts collection instead of direct post lookup
  // This can sometimes work when the direct query fails due to filtering
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

    // Try the direct query first
    const result = await fetchFromCDN(query, { slug });

    if (result.post) {
      console.log(
        `Successfully fetched post for slug: ${slug} using direct query`
      );
      return result.post;
    }

    console.log(
      `No post found with direct query for slug: ${slug}, trying alternative query`
    );

    // If direct query fails, try the alternative query
    const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });

    if (alternativeResult.posts && alternativeResult.posts.length > 0) {
      console.log(`Found post using alternative query for slug: ${slug}`);
      return alternativeResult.posts[0];
    }

    console.log(
      `No post found with alternative query for slug: ${slug}, trying content API`
    );

    // Try content API with direct query
    try {
      const contentResult = await fetchFromContentAPI(query, { slug });
      if (contentResult.post) {
        console.log(`Found post in content API for slug: ${slug}`);
        return contentResult.post;
      }
    } catch (contentError) {
      console.error(
        `Content API direct query failed for slug: ${slug}`,
        contentError
      );
    }

    // Try content API with alternative query
    try {
      const contentAlternativeResult = await fetchFromContentAPI(
        alternativeQuery,
        { slug }
      );
      if (
        contentAlternativeResult.posts &&
        contentAlternativeResult.posts.length > 0
      ) {
        console.log(
          `Found post in content API using alternative query for slug: ${slug}`
        );
        return contentAlternativeResult.posts[0];
      }
    } catch (contentAltError) {
      console.error(
        `Content API alternative query failed for slug: ${slug}`,
        contentAltError
      );
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

    // Try the standard query first
    const result = await fetchFromCDN(query, { slug });

    if (
      result.postsConnection &&
      result.postsConnection.edges &&
      result.postsConnection.edges.length > 0
    ) {
      console.log(
        `Found ${result.postsConnection.edges.length} posts for category ${slug} using standard query`
      );
      return result.postsConnection.edges;
    }

    console.log(
      `No posts found for category ${slug} using standard query, trying alternative query`
    );

    // If standard query returns no results, try the alternative query
    const alternativeResult = await fetchFromCDN(alternativeQuery, { slug });

    if (
      alternativeResult.categories &&
      alternativeResult.categories.length > 0 &&
      alternativeResult.categories[0].posts &&
      alternativeResult.categories[0].posts.length > 0
    ) {
      const posts = alternativeResult.categories[0].posts;
      console.log(
        `Found ${posts.length} posts for category ${slug} using alternative query`
      );

      // Convert to the same format as the standard query
      return posts.map((post) => ({
        node: post,
      }));
    }

    console.log(
      `No posts found for category ${slug} using alternative query, trying content API`
    );

    // Try content API with standard query
    try {
      const contentResult = await fetchFromContentAPI(query, { slug });
      if (
        contentResult.postsConnection &&
        contentResult.postsConnection.edges &&
        contentResult.postsConnection.edges.length > 0
      ) {
        console.log(
          `Found ${contentResult.postsConnection.edges.length} posts for category ${slug} using content API`
        );
        return contentResult.postsConnection.edges;
      }
    } catch (contentError) {
      console.error(
        `Content API query failed for category ${slug}:`,
        contentError
      );
    }

    // Try content API with alternative query
    try {
      const contentAlternativeResult = await fetchFromContentAPI(
        alternativeQuery,
        { slug }
      );
      if (
        contentAlternativeResult.categories &&
        contentAlternativeResult.categories.length > 0 &&
        contentAlternativeResult.categories[0].posts &&
        contentAlternativeResult.categories[0].posts.length > 0
      ) {
        const posts = contentAlternativeResult.categories[0].posts;
        console.log(
          `Found ${posts.length} posts for category ${slug} using content API alternative query`
        );

        // Convert to the same format as the standard query
        return posts.map((post) => ({
          node: post,
        }));
      }
    } catch (contentAltError) {
      console.error(
        `Content API alternative query failed for category ${slug}:`,
        contentAltError
      );
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
