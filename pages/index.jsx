import { FeaturedPosts } from "../sections/index";
import { PostCard, Categories, PostWidget } from "../components";
import { getPosts } from "../services";
// import Footer from "../components/footer/Footer";
import { useEffect, useState } from "react";
import { transformData } from "../components/AdditionalPosts/PostsAdditions";
import electionResults from "../components/AdditionalPosts/electionResults.json";
import Charts from "../components/AdditionalPosts/ElectionResultsChart";
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
  const data = transformData(electionResults);

  useEffect(() => {
    const shuffled = shuffle(posts);
    setShuffledPosts(shuffled);
  }, [posts]);

  return (
    <div className="container mx-auto px-4 md:px-10 mb-8">
      <FeaturedPosts />
      <h1 className="text-2xl text-slate-100 font-bold text-center ">
        Election Results 2024
      </h1>
      <div className="w-full md:w-96 h-96 md:h-96 mx-auto lg:mb-4 lg:pb-4">
        <Charts data={data} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 col-span-1">
          {shuffledPosts.map((post, index) => (
            <PostCard key={index} post={post.node} />
          ))}
        </div>
        <div className="lg:col-span-4 col-span-1">
          <div className="lg:sticky relative top-8">
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
