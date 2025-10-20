import { fetchFromCDN, gql } from "./hygraph";
import { deduplicate } from "../lib/request-deduplicator";

export const getPosts = async (options = {}) => {
  const {
    limit = 12, // Lower default to reduce payload and Hygraph usage
    fields = "full", // 'full' or 'minimal'
    forStaticPaths = false, // Special flag for getStaticPaths usage
    ttl,
    debug,
  } = options;

  const dedupKey = `getPosts:${fields}:${limit}:${
    forStaticPaths ? "static" : "default"
  }`;

  // Wrap in deduplication to prevent duplicate requests
  return deduplicate(
    dedupKey,
    async () => {
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
    },
    { ttl, debug }
  ); // Close deduplicate wrapper
};

export const getCategories = async () => {
  return deduplicate("getCategories", async () => {
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
  }); // Close deduplicate wrapper
};

export const getPostDetails = async (slug) => {
  return deduplicate(`getPostDetails-${slug}`, async () => {
    console.log(`[getPostDetails] Starting fetch for slug: "${slug}"`);
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
          }
          categories {
            name
            slug
          }
          tags {
            id
            name
            slug
            color {
              hex
            }
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
          }
          categories {
            name
            slug
          }
          tags {
            id
            name
            slug
            color {
              hex
            }
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
              `Content structure: ${Object.keys(result.post.content).join(
                ", "
              )}`
            );

            // Ensure references field is always an empty array since we don't fetch it
            result.post.content.references = [];
          }
          return result.post;
        } else {
          console.warn(`CDN returned no post data for slug: ${slug}`);
        }
      } catch (cdnError) {
        console.error(`CDN fetch failed for slug: ${slug}:`, cdnError);
        console.error(`Error details:`, cdnError.message);
      }

      // Try alternative query as a second attempt
      console.log(`Trying alternative query for slug: ${slug}`);
      try {
        const alternativeResult = await fetchFromCDN(alternativeQuery, {
          slug,
        });
        if (alternativeResult.posts && alternativeResult.posts.length > 0) {
          console.log(`Alternative query succeeded for slug: ${slug}`);

          // Ensure references is an empty array since we don't fetch it
          const post = alternativeResult.posts[0];
          if (post.content) {
            post.content.references = [];
          }

          return post;
        } else {
          console.warn(
            `Alternative query returned no results for slug: ${slug}`
          );
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
          console.warn(
            `Simplified query returned no results for slug: ${slug}`
          );
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
  }); // Close deduplicate wrapper
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
  if (!slug) {
    console.error("No slug provided to getCategoryPost");
    return [];
  }

  console.warn(
    `⚠️ getCategoryPost for ${slug} should use pagination service instead of loading all posts at once`
  );

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
  return deduplicate("getFeaturedPosts", async () => {
    const query = gql`
      query GetCategoryPost {
        posts(
          where: { featuredpost: true }
          first: 12
          orderBy: createdAt_DESC
        ) {
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
          width: parseInt(post.featuredImage?.width, 10) || 30, // Parse to integer, default to 30
          height: parseInt(post.featuredImage?.height, 10) || 30,
        },
      }));
    } catch (error) {
      console.error("Error fetching featured posts:", error);

      return [];
    }
  }); // Close deduplicate wrapper
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
