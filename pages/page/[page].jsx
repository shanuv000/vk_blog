// Paginated homepage - /page/[page] route for pages 2+
import { gql } from "graphql-request";
import { getPostsWithOffset, getTotalPostsCount } from "../../services/pagination";
import { cdnClient } from "../../services/hygraph";
import OptimizedHomepage from "../../components/OptimizedHomepage";

// Posts per page for pagination
const POSTS_PER_PAGE = 10;

// Maximum pages to pre-generate at build time
const MAX_PREGENERATED_PAGES = 10;

// GraphQL queries for sidebar and featured content
const FEATURED_POSTS_QUERY = gql`
  query GetFeaturedPosts {
    posts(where: { featuredpost: true }, first: 12, orderBy: createdAt_DESC) {
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

export default function PaginatedHome(props) {
  return <OptimizedHomepage {...props} />;
}

// Generate static paths for first N pages
export async function getStaticPaths() {
  try {
    const totalCount = await getTotalPostsCount();
    const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
    
    // Pre-generate first N pages (skip page 1 as it's handled by index.jsx)
    const pagesToPreGenerate = Math.min(totalPages, MAX_PREGENERATED_PAGES);
    
    const paths = [];
    for (let page = 2; page <= pagesToPreGenerate; page++) {
      paths.push({ params: { page: page.toString() } });
    }

    console.log(
      `[Pagination SSG] Pre-generating ${paths.length} pages (2 to ${pagesToPreGenerate})`
    );

    return {
      paths,
      // Enable ISR for pages beyond the pre-generated ones
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error generating static paths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}

// Fetch data for each paginated page
export async function getStaticProps({ params }) {
  try {
    const page = parseInt(params.page, 10);

    // Validate page number
    if (isNaN(page) || page < 1) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    // Redirect page 1 to homepage (canonical URL)
    if (page === 1) {
      return {
        redirect: {
          destination: "/",
          permanent: true,
        },
      };
    }

    // Fetch all data in parallel
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
      : { posts: [], totalPages: 0, totalCount: 0, currentPage: page, hasNextPage: false, hasPrevPage: true, perPage: POSTS_PER_PAGE };

    // If page is beyond total pages, redirect to last page
    if (page > postsData.totalPages && postsData.totalPages > 0) {
      return {
        redirect: {
          destination: postsData.totalPages === 1 ? "/" : `/page/${postsData.totalPages}`,
          permanent: false,
        },
      };
    }

    // Return 404 if no posts found
    if (postsData.posts.length === 0 && postsData.totalCount === 0) {
      return {
        notFound: true,
      };
    }

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

    console.log(
      `[Pagination SSG] Page ${page}: ${postsData.posts.length} posts, ${featuredPosts.length} featured, ${recentPosts.length} recent, ${categories.length} categories`
    );

    return {
      props: {
        posts: postsData.posts,
        pagination: {
          currentPage: postsData.currentPage,
          totalPages: postsData.totalPages,
          totalCount: postsData.totalCount,
          hasNextPage: postsData.hasNextPage,
          hasPrevPage: postsData.hasPrevPage,
          perPage: POSTS_PER_PAGE,
        },
        featuredPosts,
        recentPosts,
        categories,
      },
      // Revalidate every 5 minutes
      revalidate: 300,
    };
  } catch (error) {
    console.error(`Error in getStaticProps for page ${params.page}:`, error);

    return {
      props: {
        posts: [],
        pagination: {
          currentPage: parseInt(params.page, 10) || 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPrevPage: true,
          perPage: POSTS_PER_PAGE,
        },
        featuredPosts: [],
        recentPosts: [],
        categories: [],
      },
      revalidate: 60,
    };
  }
}
