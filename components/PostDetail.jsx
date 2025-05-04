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
          className="bg-secondary rounded-lg shadow-lg mb-8 overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
            style={{ scaleX }}
          />
          {/* Seo */}
          <HeadPostDetails post={post} />
          {/* Seo */}

          <div className="relative overflow-hidden mb-6">
            <motion.div className="w-full aspect-video relative">
              <motion.img
                src={post.featuredImage?.url || DEFAULT_FEATURED_IMAGE}
                alt={post.title || "Post image"}
                className="object-cover w-full h-full"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                onError={(e) => {
                  e.target.src = FALLBACK_FEATURED_IMAGE;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent opacity-60"></div>

              {/* Title overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-heading font-bold text-white text-shadow mb-4 capitalize">
                  {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-white">
                  <div className="flex items-center">
                    <img
                      src={post.author?.photo?.url || DEFAULT_AVATAR}
                      alt={post.author?.name || "Author"}
                      height={40}
                      width={40}
                      className="rounded-full border-2 border-primary"
                      onError={(e) => {
                        e.target.src = FALLBACK_AVATAR;
                      }}
                    />
                    <span className="ml-2 font-medium">
                      {post.author?.name || "Anonymous"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-primary"
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
              </div>
            </motion.div>
          </div>

          <div className="px-6 lg:px-10 pb-10">
            <Navbar_post_details post={post} />

            <Testing slug={post.slug} />

            <div className="prose prose-lg max-w-none mt-8 text-text-primary">
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
                <p className="text-center text-lg text-text-secondary font-normal">
                  No content available for this post.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </>
    </ErrorBoundary>
  );
};

export default PostDetail;
