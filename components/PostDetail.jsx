import React, { useState, useEffect } from "react";
import { RichText } from "@graphcms/rich-text-react-renderer";
import { NextSeo } from "next-seo";
import moment from "moment";
import Link from "next/link";
// import Document, { Html, Head, Main, NextScript } from "next/document";
import Head from "next/head";
import Seo from "./Seo";
import { Tweet } from "react-twitter-widgets";

const PostDetail = ({ post }) => {
  useEffect(() => window.scrollTo(0, 0, "smooth"), []);
  // console.log(post);

  const getContentFragment = (index, text, obj, type) => {
    let modifiedText = text;

    if (obj) {
      if (obj.bold) {
        modifiedText = <b key={index}>{text}</b>;
      }

      if (obj.italic) {
        modifiedText = <em key={index}>{text}</em>;
      }

      if (obj.underline) {
        modifiedText = <u key={index}>{text}</u>;
      }
      if (obj.type === "link") {
        modifiedText = (
          <button
            classnpm
            i
            react-youtubeName="text-red-500 hover:text-blue-500 hover:underline underline-offset-auto	"
          >
            <a href={obj.href} target="_blank">
              {obj.children[0].text}
            </a>
          </button>
        );
      }
    }

    switch (type) {
      case "code":
        return (
          <h1 className="text-xl font-semibold mb-4" key={index}>
            {text}
          </h1>
        );

      case "heading-three":
        return (
          <h3 key={index} className="text-xl font-semibold mb-4">
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h3>
        );
      case "paragraph":
        return (
          <p key={index} className="mb-8">
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </p>
        );
      case "heading-four":
        return (
          <h4 key={index} className="text-md font-semibold mb-4">
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h4>
        );
      case "image":
        return (
          <img
            className="rounded-lg"
            key={index}
            alt={obj.title}
            height={obj.height}
            width={obj.width}
            src={obj.src}
          />
        );
      case "iframe":
        return (
          <iframe
            className="w-full h-full aspect-video rounded-lg"
            src={obj.url}
            height={obj.height}
            width={obj.width}
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        );
      case "block-quote":
        // if (window.innerWidth < 410) {
        //   return;
        // }
        return (
          <div key={index} className="">
            {modifiedText.map(
              (item, i) => (
                <Tweet tweetId={item} className=" w-full aspect-video" />
              )
              // <React.Fragment key={i}>{item}</React.Fragment>
            )}
          </div>
        );

      default:
        return modifiedText;
    }
  };
  console.log(`http://www.keytosuccess.me/post/${post.slug}`);
  return (
    <>
      <div className="bg-white shadow-lg rounded-lg lg:p-8 pb-12 mb-8">
        {/* Seo */}
        <Head>
          {/* <Seo post={post} /> */}

          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta charSet="utf-8" />
          <meta property="og:title" content={post.title} />
          <meta
            property="og:image"
            itemprop="image"
            content={post.featuredImage.url}
          />
          <meta property="og:description" content={post.excerpt} />
          <meta
            property="og:url"
            content={`http://www.keytosuccess.me/post/${post.slug}`}
          />
          <meta property="og:updated_time" content={post.createdAt} />

          <meta property="og:type" content="website" />

          <title>{post.title}</title>
          <meta
            name="viewport"
            content="width=device-width,minimum-scale=1, initial-scale=1"
          />
          {/* twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@shanuv0000" />
          <meta name="twitter:creator" content="@shanuv0000" />
          <meta
            property="og:url"
            content={`http://www.keytosuccess.me/post/${post.slug}`}
          />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:image" content={post.featuredImage.url} />
          {/* twitter */}
          {/* google Ad */}
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5634941748977646"
            crossorigin="anonymous"
          ></script>
          {/* <script async src={google_client_id} crossorigin="anonymous"></script> */}
          {/* google Ad */}
        </Head>
        {/* Seo */}
        <div className="relative overflow-hidden shadow-md mb-6">
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
                height="30px"
                width="30px"
                className="align-middle rounded-full"
              />
              <p className="inline align-middle text-gray-700 ml-2 text-lg">
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
          <h1 className="mb-8 text-3xl font-semibold">{post.title}</h1>

          {/* 
        {post.content.raw.children.map((typeObj, index) => {
          const children = typeObj.children.map((item, itemIndex) =>
            getContentFragment(itemIndex, item.text, item)
          );
          return getContentFragment(index, children, typeObj, typeObj.type);
        })} */}
          {/* {<RichText content={content} />} */}
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
