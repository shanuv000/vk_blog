import { gql } from 'graphql-request';

// Query to get post details by slug
export const GET_POST_DETAILS = gql`
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
        json
        references {
          __typename
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

// Alternative query for post details that doesn't use the references field
export const GET_POST_DETAILS_ALTERNATIVE = gql`
  query GetPostDetailsAlternative($slug: String!) {
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
        json
      }
      categories {
        name
        slug
      }
    }
  }
`;

// Query to get all post slugs for static paths
export const GET_POST_SLUGS = gql`
  query GetPostSlugs {
    posts {
      slug
    }
  }
`;

// Query to get all posts
export const GET_POSTS = gql`
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
            width
            height
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

// Query to get featured posts
export const GET_FEATURED_POSTS = gql`
  query GetFeaturedPosts {
    posts(where: { featuredpost: true }, first: 12, orderBy: createdAt_DESC) {
      author {
        name
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

// Simplified query for featured posts (fallback)
export const GET_FEATURED_POSTS_SIMPLIFIED = gql`
  query GetFeaturedPostsSimplified {
    posts(first: 12, orderBy: createdAt_DESC) {
      title
      slug
      createdAt
      featuredImage {
        url
      }
      author {
        name
        photo {
          url
        }
      }
    }
  }
`;

// Query to get recent posts
export const GET_RECENT_POSTS = gql`
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

// Query to get categories
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      name
      slug
    }
  }
`;

// Query to get posts by category
export const GET_CATEGORY_POSTS = gql`
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

// Query to get similar posts
export const GET_SIMILAR_POSTS = gql`
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

// Query to get adjacent posts
export const GET_ADJACENT_POSTS = gql`
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
