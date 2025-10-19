/**
 * Example queries and mutations for Hygraph MCP Server
 *
 * These are examples you can use with the hygraph_query and hygraph_mutation tools
 * through GitHub Copilot Chat in VS Code.
 */

// ============================================================================
// READ OPERATIONS (No Auth Required)
// ============================================================================

/**
 * Get all posts with basic information
 */
const getAllPosts = `
  query GetAllPosts {
    posts(first: 20, orderBy: createdAt_DESC) {
      id
      title
      slug
      excerpt
      createdAt
      updatedAt
      featuredpost
      featuredImage {
        url
        width
        height
      }
      author {
        name
        photo {
          url
        }
      }
      categories {
        name
        slug
      }
    }
  }
`;

/**
 * Get featured posts only
 */
const getFeaturedPosts = `
  query GetFeaturedPosts {
    posts(where: { featuredpost: true }, first: 10, orderBy: createdAt_DESC) {
      title
      slug
      excerpt
      featuredImage {
        url
      }
      categories {
        name
      }
    }
  }
`;

/**
 * Get a single post by slug with full content
 */
const getPostBySlug = `
  query GetPostBySlug($slug: String!) {
    post(where: { slug: $slug }) {
      id
      title
      slug
      excerpt
      content {
        json
        html
        markdown
        text
      }
      createdAt
      updatedAt
      publishedAt
      featuredpost
      featuredImage {
        url
        width
        height
        mimeType
      }
      author {
        name
        bio
        photo {
          url
        }
      }
      categories {
        name
        slug
      }
    }
  }
`;
// Variables: { "slug": "your-post-slug" }

/**
 * Get posts by category
 */
const getPostsByCategory = `
  query GetPostsByCategory($categorySlug: String!) {
    posts(
      where: { categories_some: { slug: $categorySlug } }
      orderBy: createdAt_DESC
      first: 20
    ) {
      title
      slug
      excerpt
      createdAt
      featuredImage {
        url
      }
    }
  }
`;
// Variables: { "categorySlug": "technology" }

/**
 * Get all categories
 */
const getAllCategories = `
  query GetAllCategories {
    categories(orderBy: name_ASC) {
      id
      name
      slug
      show
    }
  }
`;

/**
 * Get recent posts with pagination
 */
const getRecentPostsPaginated = `
  query GetRecentPosts($skip: Int, $first: Int) {
    posts(orderBy: createdAt_DESC, skip: $skip, first: $first) {
      title
      slug
      excerpt
      createdAt
      featuredImage {
        url
      }
    }
    postsConnection {
      aggregate {
        count
      }
    }
  }
`;
// Variables: { "skip": 0, "first": 10 }

/**
 * Search posts by title
 */
const searchPostsByTitle = `
  query SearchPosts($searchTerm: String!) {
    posts(where: { title_contains: $searchTerm }) {
      title
      slug
      excerpt
    }
  }
`;
// Variables: { "searchTerm": "Next.js" }

/**
 * Get posts with connection for total count
 */
const getPostsWithCount = `
  query GetPostsWithCount {
    postsConnection {
      aggregate {
        count
      }
      edges {
        node {
          title
          slug
          createdAt
        }
      }
    }
  }
`;

// ============================================================================
// WRITE OPERATIONS (Require Auth Token)
// ============================================================================

/**
 * Create a new blog post
 */
const createPost = `
  mutation CreatePost($data: PostCreateInput!) {
    createPost(data: $data) {
      id
      title
      slug
      excerpt
      createdAt
    }
  }
`;
// Variables:
// {
//   "data": {
//     "title": "My New Post",
//     "slug": "my-new-post",
//     "excerpt": "This is a brief summary of the post"
//   }
// }

/**
 * Update an existing post
 */
const updatePost = `
  mutation UpdatePost($id: ID!, $data: PostUpdateInput!) {
    updatePost(where: { id: $id }, data: $data) {
      id
      title
      slug
      excerpt
      updatedAt
    }
  }
`;
// Variables:
// {
//   "id": "post-id-here",
//   "data": {
//     "title": "Updated Title",
//     "excerpt": "Updated excerpt"
//   }
// }

/**
 * Publish a post
 */
const publishPost = `
  mutation PublishPost($id: ID!) {
    publishPost(where: { id: $id }, to: PUBLISHED) {
      id
      title
      slug
      publishedAt
    }
  }
`;
// Variables: { "id": "post-id-here" }

/**
 * Unpublish a post
 */
const unpublishPost = `
  mutation UnpublishPost($id: ID!) {
    unpublishPost(where: { id: $id }, from: PUBLISHED) {
      id
      title
      slug
    }
  }
`;
// Variables: { "id": "post-id-here" }

/**
 * Delete a post
 */
const deletePost = `
  mutation DeletePost($id: ID!) {
    deletePost(where: { id: $id }) {
      id
      title
      slug
    }
  }
`;
// Variables: { "id": "post-id-here" }

/**
 * Create a new category
 */
const createCategory = `
  mutation CreateCategory($data: CategoryCreateInput!) {
    createCategory(data: $data) {
      id
      name
      slug
    }
  }
`;
// Variables:
// {
//   "data": {
//     "name": "Technology",
//     "slug": "technology",
//     "show": true
//   }
// }

// ============================================================================
// INTROSPECTION QUERIES (Schema Information)
// ============================================================================

/**
 * Get schema type information
 */
const getSchemaTypes = `
  query GetSchemaTypes {
    __schema {
      types {
        name
        kind
        description
      }
    }
  }
`;

/**
 * Get Post type fields
 */
const getPostTypeFields = `
  query GetPostType {
    __type(name: "Post") {
      name
      kind
      fields {
        name
        type {
          name
          kind
        }
        description
      }
    }
  }
`;

// ============================================================================
// USAGE EXAMPLES WITH COPILOT CHAT
// ============================================================================

/**
 * How to use these queries with Copilot Chat:
 *
 * 1. SIMPLE QUERY:
 *    "@workspace Get all posts from Hygraph using this query: [paste getAllPosts here]"
 *
 * 2. QUERY WITH VARIABLES:
 *    "@workspace Execute this Hygraph query with slug 'my-post': [paste getPostBySlug here]"
 *
 * 3. CREATE POST:
 *    "@workspace Create a new blog post in Hygraph with title 'Hello World' and slug 'hello-world'"
 *
 * 4. UPDATE POST:
 *    "@workspace Update the Hygraph post with slug 'my-post' and set featuredpost to true"
 *
 * 5. PUBLISH POST:
 *    "@workspace Publish the Hygraph post with slug 'my-post'"
 */

// ============================================================================
// TIPS AND BEST PRACTICES
// ============================================================================

/**
 * TIPS:
 *
 * 1. Use CDN endpoint for read operations (faster, cached)
 * 2. Use Content API for write operations (mutations)
 * 3. Always specify fields you need (don't over-fetch)
 * 4. Use pagination for large datasets
 * 5. Filter on the server side when possible
 * 6. Cache results when appropriate
 *
 * BEST PRACTICES:
 *
 * 1. Test queries in Hygraph playground first
 * 2. Use variables for dynamic values
 * 3. Handle errors gracefully
 * 4. Implement proper error logging
 * 5. Use TypeScript types for better type safety
 * 6. Keep queries focused and specific
 */

module.exports = {
  // Read operations
  getAllPosts,
  getFeaturedPosts,
  getPostBySlug,
  getPostsByCategory,
  getAllCategories,
  getRecentPostsPaginated,
  searchPostsByTitle,
  getPostsWithCount,

  // Write operations
  createPost,
  updatePost,
  publishPost,
  unpublishPost,
  deletePost,
  createCategory,

  // Schema
  getSchemaTypes,
  getPostTypeFields,
};
