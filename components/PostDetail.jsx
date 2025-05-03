import React, { useEffect, useRef } from "react";
import moment from "moment";
import { motion, useScroll, useSpring } from "framer-motion";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Social_post_details";
import { getContentFragment } from "./Code_blocks/PostCodeBlocks";
import { useData } from "../store/HandleApiContext";
import { Testing } from "./AdditionalPosts/PostsAdditions";
import ErrorBoundary from "./ErrorBoundary";
import {
  DEFAULT_AVATAR,
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_AVATAR,
  FALLBACK_FEATURED_IMAGE,
} from "./DefaultAvatar";

const PostDetail = ({ post }) => {
  const { data, fetchData } = useData();
  const hasFetchedData = useRef(true);

  // Get data from Context
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (hasFetchedData.current == false && data == null) {
      fetchData();
      hasFetchedData.current = true;
    }
  }, []);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <ErrorBoundary>
      <>
        <motion.div
          className="bg-white shadow-lg rounded-lg lg:p-6 pb-12 mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="fixed top-0 left-0 right-0 h-2 bg-orange-500 origin-left"
            style={{ scaleX }}
          />
          {/* Seo */}
          <HeadPostDetails post={post} />
          {/* Seo */}

          <div className="relative overflow-hidden shadow-md mb-6">
            <motion.img
              src={post.featuredImage?.url || DEFAULT_FEATURED_IMAGE}
              alt={post.title || "Post image"}
              className="object-top h-full w-full rounded-t-lg"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                e.target.src = FALLBACK_FEATURED_IMAGE;
              }}
            />
          </div>
          <div className="px-4 lg:px-0">
            <div className="flex items-center mb-8 w-full">
              <div className="flex items-center mb-4 lg:mb-0 w-full lg:w-auto mr-8">
                <img
                  src={post.author?.photo?.url || DEFAULT_AVATAR}
                  alt={post.author?.name || "Author"}
                  height={30}
                  width={30}
                  className="align-middle rounded-full"
                  onError={(e) => {
                    e.target.src = FALLBACK_AVATAR;
                  }}
                />
                <p className="inline align-middle text-gray-700 ml-2 text-lg">
                  {post.author?.name || "Anonymous"}
                </p>
              </div>

              <div className="font-medium text-gray-700 lg:basis-1/4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 inline mr-2 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  {post.createdAt
                    ? moment(post.createdAt).format("DD MMM, YYYY")
                    : "No date"}
                </span>
              </div>
            </div>

            <Navbar_post_details post={post} />

            <h1 className="mb-8 font-serif capitalize md:font-mono text-2xl lg:text-4xl font-semibold md:font-extrabold head-colour leading-tight lg:leading-snug">
              {post.title}
            </h1>
            <Testing slug={post.slug} />
            {post.content?.raw?.children ? (
              post.content.raw.children.map((typeObj, index) => {
                const children = typeObj.children.map((item, itemindex) =>
                  getContentFragment(itemindex, item.text, item)
                );

                return getContentFragment(
                  index,
                  children,
                  typeObj,
                  typeObj.type
                );
              })
            ) : (
              <p className="text-center text-lg text-gray-700 font-normal">
                No content available for this post.
              </p>
            )}
          </div>
        </motion.div>
      </>
    </ErrorBoundary>
  );
};

export default PostDetail;
