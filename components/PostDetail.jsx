import React, { useEffect, useRef } from "react";
import moment from "moment";

import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Navbar_post_details";

// import { GoogleAnalytics } from "@next/third-parties/google";
import { getContentFragment } from "./PostCodeBlocks";
// import { fetchData } from "./ExtractIPs/ipfunc";
import { useData } from "../store/HandleApiContext";
const PostDetail = ({ post }) => {
  const { data, fetchData } = useData();

  const hasFetchedData = useRef(true);

  // Get data from Context
  // console.log(post);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (hasFetchedData.current == false && data != null) {
      fetchData();
      hasFetchedData.current = true; // <-- Mark as fetched
    }
  }, []);

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg lg:p-6 pb-12 mb-8">
        {/* Seo */}
        <HeadPostDetails post={post} />
        {/* <GoogleAnalytics gaId="G-LW10VJQH6L" /> */}
        {/* Seo */}

        <div className="relative overflow-hidden shadow-md mb-6 ">
          <img
            src={post.featuredImage.url}
            alt={post.title}
            className="object-top h-full w-full rounded-t-lg"
          />
        </div>
        <div className="px-4 lg:px-0 ">
          <div className="flex items-center mb-8 w-full ">
            <div className="flex items-center  mb-4 lg:mb-0 w-full lg:w-auto mr-8 ">
              <img
                src={post.author.photo.url}
                alt={post.author.name}
                height={30}
                width={30}
                className="align-middle rounded-full"
              />
              <p className="inline align-middle text-gray-700 ml-2  text-lg	">
                {post.author.name}
              </p>
            </div>

            <div className="font-medium text-gray-700 lg:basis-1/4 ">
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
              <span>{moment(post.createdAt).format("DD MMM, YYYY")}</span>
            </div>
          </div>
          {/*  */}
          <Navbar_post_details post={post} />

          <h1
            className="mb-8 font-serif capitalize	 md:font-mono			 text-2xl lg:text-4xl font-semibold	 md:font-extrabold head-colour	leading-tight lg:leading-snug  			
          "
          >
            {post.title}
          </h1>
          {/* <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5634941748977646"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins> */}

          {/* 
        {post.content.raw.children.map((typeObj, index) => {
          const children = typeObj.children.map((item, itemIndex) =>
            getContentFragment(itemIndex, item.text, item)
          );
          return getContentFragment(index, children, typeObj, typeObj.type);
        })} */}
          {post.content.raw.children.map((typeObj, index) => {
            const children = typeObj.children.map((item, itemindex) =>
              getContentFragment(itemindex, item.text, item)
            );

            return getContentFragment(index, children, typeObj, typeObj.type);
          })}
        </div>
      </div>
    </>
  );
};

export default PostDetail;
