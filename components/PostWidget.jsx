import React, { useState, useEffect } from "react";
import moment from "moment";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getRecentPosts, getSimilarPosts } from "../services";
const PostWidget = ({ categories, slug }) => {
  const [relatedPosts, setRelatedPosts] = useState([]);
  useEffect(() => {
    if (slug) {
      getSimilarPosts(categories, slug).then((result) => {
        setRelatedPosts(result);
      });
    } else {
      getRecentPosts().then((result) => {
        setRelatedPosts(result);
      });
    }
  }, [slug]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
      <h3 className="text-xl mb-8 font-semibold border-b pb-4">
        {slug ? "Related Posts" : "Recent Posts"}
      </h3>
      {relatedPosts.map((post) => (
        <div className="flex items-center w-full mb-4" key={post.title}>
          <div className="w-16 flex-none">
            <LazyLoadImage
              alt={post.title}
              height={60}
              className="align-middle rounded-full"
              src={post.featuredImage.url} // use normal <img> attributes as props
              width={60}
            />

            {/* <img
              src={post.featuredImage.url}
              alt={post.title}
              height="60px"
              width="60px"
              className="align-middle rounded-full"
            /> */}
          </div>
          <div className="flex-grow ml-4">
            <p className="text-gray-500 font-xs">
              {moment(post.createdAt).format("MMM DD, YYYY")}
            </p>
            <Link
              href={`/post/${post.slug}`}
              key={post.title}
              className="text-md"
            >
              {post.title}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostWidget;
