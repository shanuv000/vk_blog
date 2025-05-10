import { FeaturedPosts } from "../sections/index";
import { PostCard, Categories, PostWidget } from "../components";
import { getPosts } from "../services";
// import Footer from "../components/footer/Footer";
import { useEffect, useState } from "react";
import Head from "next/head";
import HomeSeo from "../components/HomeSeo";

import { ClipLoader } from "react-spinners";

import LiveMatch from "../components/Cricket/LiveMatch";
// Fisher-Yates shuffle algorithm
import { useMediaQuery } from "react-responsive"; // Import for media query
import { useData } from "../store/HandleApiContext";
import SchemaManager from "../components/SchemaManager";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Home({ posts }) {
  const [displayPosts, setDisplayPosts] = useState([]);
  const isMobile = useMediaQuery({ query: "(max-width: 1224px)" }); // Detect mobile
  const { isLiveScore } = useData();

  useEffect(() => {
    // Sort posts by date (newest first) instead of shuffling
    const sortedPosts = [...posts].sort((a, b) => {
      const dateA = new Date(a.node.publishedAt || a.node.createdAt);
      const dateB = new Date(b.node.publishedAt || b.node.createdAt);
      return dateB - dateA; // Newest first
    });
    setDisplayPosts(sortedPosts);
  }, [posts]);
  if (!posts || posts.length === 0) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <ClipLoader color="#007bff" loading={true} size={150} />
      </div>
    );
  }
  return (
    <>
      {/* Add SEO optimization */}
      <HomeSeo
        featuredPosts={displayPosts.slice(0, 5).map((post) => post.node)}
      />

      <Head>
        {/* Add structured data for homepage */}
        <SchemaManager
          isHomePage={true}
          posts={displayPosts.map((post) => post.node)}
        />
      </Head>
      <div className="mb-12">
        {/* Hero section with featured posts */}
        <div className="mb-12">
          <FeaturedPosts />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Posts column */}
          <div className="lg:col-span-8 col-span-1">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8 text-text-primary border-b border-secondary-light pb-4">
              Latest Articles
            </h2>
            <div className="space-y-8">
              {displayPosts.map((post, index) => (
                <PostCard key={post.node.slug || index} post={post.node} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 col-span-1">
            <div className="lg:sticky relative top-8 space-y-8">
              {/* Live cricket widget */}
              {isLiveScore && !isMobile && (
                <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
                  <h3 className="text-xl font-heading font-semibold px-6 py-4 border-b border-secondary-light text-text-primary">
                    Live Cricket
                  </h3>
                  <div className="p-4">
                    <LiveMatch />
                  </div>
                </div>
              )}

              {/* Recent posts widget */}
              <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
                <h3 className="text-xl font-heading font-semibold px-6 py-4 border-b border-secondary-light text-text-primary">
                  Recent Posts
                </h3>
                <div className="p-4">
                  <PostWidget />
                </div>
              </div>

              {/* Categories widget */}
              <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
                <h3 className="text-xl font-heading font-semibold px-6 py-4 border-b border-secondary-light text-text-primary">
                  Categories
                </h3>
                <div className="p-4">
                  <Categories />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Fetch data at build time
export async function getStaticProps() {
  try {
    const posts = (await getPosts()) || [];

    return {
      props: { posts },
      // Reduce revalidation time to ensure latest posts are shown
      revalidate: 180, // 3 minutes - balance between performance and freshness
    };
  } catch (error) {
    console.error("Error fetching posts for home page:", error);

    // Return empty posts array instead of failing
    return {
      props: { posts: [] },
      // Shorter revalidation time for error cases, but still longer than before
      revalidate: 120,
    };
  }
}
