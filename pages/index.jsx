// Production-optimized homepage with consolidated API calls
import OptimizedHomepage from "../components/OptimizedHomepage";

// Use the optimized homepage component for production
export default function Home({ initialPosts }) {
  // Return the optimized homepage component
  return <OptimizedHomepage initialPosts={initialPosts} />;
}

// Fetch data at build time - now only used for SEO and initial page structure
export async function getStaticProps() {
  try {
    // We don't need to fetch posts here anymore since we're using client-side infinite scroll
    // But we keep this for SEO purposes and to maintain the page structure
    return {
      props: {
        initialPosts: [], // Empty array since we load posts client-side
      },
      // Reduce revalidation time to ensure latest posts are shown
      revalidate: 180, // 3 minutes - balance between performance and freshness
    };
  } catch (error) {
    console.error("Error in getStaticProps for home page:", error);

    // Return empty posts array instead of failing
    return {
      props: {
        initialPosts: [],
      },
      // Shorter revalidation time for error cases
      revalidate: 120,
    };
  }
}
