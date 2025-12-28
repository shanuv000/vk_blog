// Production-optimized homepage with SSG pagination for SEO
import { gql } from "graphql-request";
import { getPostsWithOffset, getTotalPostsCount } from "../services/pagination";
import { cdnClient } from "../services/hygraph";
import OptimizedHomepage from "../components/OptimizedHomepage";

// Posts per page for pagination
const POSTS_PER_PAGE = 10;

// GraphQL queries for sidebar and featured content
const FEATURED_POSTS_QUERY = gql`
  query GetFeaturedPosts {
    posts(where: { featuredpost: true }, first: 6, orderBy: createdAt_DESC) {
      title
      slug
      excerpt
      createdAt
      publishedAt
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

const RECENT_POSTS_QUERY = gql`
  query GetRecentPosts {
    posts(orderBy: publishedAt_DESC, first: 5) {
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

const CATEGORIES_QUERY = gql`
  query GetCategories {
    categories(where: { show: true }, orderBy: name_ASC) {
      name
      slug
    }
  }
`;

// Use the optimized homepage component for production
export default function Home(props) {
  return <OptimizedHomepage {...props} />;
}

// Fetch data at build time with pagination support
export async function getStaticProps() {
  try {
    const page = 1;

    // Fetch all data in parallel for performance
    const [postsResult, featuredResult, recentResult, categoriesResult] =
      await Promise.allSettled([
        getPostsWithOffset({ page, perPage: POSTS_PER_PAGE }),
        cdnClient.request(FEATURED_POSTS_QUERY),
        cdnClient.request(RECENT_POSTS_QUERY),
        cdnClient.request(CATEGORIES_QUERY),
      ]);

    // Process results with fallbacks
    const postsData = postsResult.status === "fulfilled" 
      ? postsResult.value 
      : { posts: [], totalPages: 0, totalCount: 0, currentPage: 1, hasNextPage: false, hasPrevPage: false, perPage: POSTS_PER_PAGE };
    
    const featuredPosts = featuredResult.status === "fulfilled" 
      ? (featuredResult.value.posts || []).map(post => ({
          ...post,
          featuredImage: post.featuredImage ? {
            ...post.featuredImage,
            width: parseInt(post.featuredImage?.width, 10) > 0 ? parseInt(post.featuredImage?.width, 10) : 800,
            height: parseInt(post.featuredImage?.height, 10) > 0 ? parseInt(post.featuredImage?.height, 10) : 600,
          } : { url: "/default-image.jpg", width: 800, height: 600 }
        }))
      : [];
    
    const recentPosts = recentResult.status === "fulfilled" 
      ? (recentResult.value.posts || []).map(post => ({
          ...post,
          featuredImage: post.featuredImage?.url ? {
            url: post.featuredImage.url,
            thumbnailUrl: `${post.featuredImage.url}?w=112&h=112&q=75&fit=crop&auto=format`,
          } : null
        }))
      : [];
    
    const categories = categoriesResult.status === "fulfilled" 
      ? categoriesResult.value.categories || []
      : [];

    // Log for build debugging
    console.log(
      `[Homepage SSG] Page ${page}: ${postsData.posts.length} posts, ${featuredPosts.length} featured, ${recentPosts.length} recent, ${categories.length} categories`
    );

    return {
      props: {
        // Main posts for the page
        posts: postsData.posts,
        // Pagination metadata
        pagination: {
          currentPage: postsData.currentPage,
          totalPages: postsData.totalPages,
          totalCount: postsData.totalCount,
          hasNextPage: postsData.hasNextPage,
          hasPrevPage: postsData.hasPrevPage,
          perPage: POSTS_PER_PAGE,
        },
        // Sidebar and featured content
        featuredPosts,
        recentPosts,
        categories,
      },
      // Revalidate every 5 minutes for fresh content
      revalidate: 300,
    };
  } catch (error) {
    console.error("Error in getStaticProps for home page:", error);

    // Return fallback props on error
    return {
      props: {
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: false,
          perPage: POSTS_PER_PAGE,
        },
        featuredPosts: [],
        recentPosts: [],
        categories: [],
      },
      // Shorter revalidation time for error cases
      revalidate: 60,
    };
  }
}
