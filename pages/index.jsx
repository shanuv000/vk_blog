import { FeaturedPosts } from "../sections/index";
import { PostCard, Categories, PostWidget } from "../components";
import { getPosts } from "../services";
// import Seo from "../components/Seo";

export default function Home({ posts }) {
  return (
    <div className="container mx-auto px-10 mb-8">
      {/* <Seo post={posts} /> */}

      {/* <Head>
        <title>VK BLOG</title>
        <link
          rel="icon"
          href="https://raw.githubusercontent.com/shanuv000/shanuv000/main/dear.png"
        />
      </Head> */}
      <FeaturedPosts />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 col-span-1">
          {posts.map((post, index) => (
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
