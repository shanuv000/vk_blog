import { FeaturedPosts } from "../sections/index";
import { PostCard, Categories, PostWidget } from "../components";
import { getPosts } from "../services";
// import Footer from "../components/footer/Footer";
import { useEffect, useState } from "react";

// import electionResults from "../components/AdditionalPosts/electionResults.json";

import { ClipLoader } from "react-spinners";

import LiveMatch from "../components/Cricket/LiveMatch";
// Fisher-Yates shuffle algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function Home({ posts }) {
  const [shuffledPosts, setShuffledPosts] = useState([]);

  useEffect(() => {
    const shuffled = shuffle(posts);
    setShuffledPosts(shuffled);
  }, [posts]);
  if (!posts || posts.length === 0) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <ClipLoader color="#007bff" loading={true} size={150} />
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 md:px-10 mb-8">
      <FeaturedPosts />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 col-span-1">
          {shuffledPosts.map((post, index) => (
            <PostCard key={index} post={post.node} />
          ))}
        </div>
        <div className="lg:col-span-4 col-span-1">
          <div className="lg:sticky relative top-8">
            <LiveMatch />
            <PostWidget />
            <Categories />
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

// Fetch data at build time
export async function getStaticProps() {
  const posts = (await getPosts()) || [];

  return {
    props: { posts },
  };
}
