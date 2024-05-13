import React, { useEffect } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import moment from "moment";
import HeadPostDetails from "./HeadPostDetails";
import Navbar_post_details from "./Navbar_post_details";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactPlayer from "react-player/lazy";

// import Document, { Html, Head, Main, NextScript } from "next/document";
// import Head from "next/head";
import Seo from "./Seo";
import App from "next/app";

const PostDetail = ({ post }) => {
  // Google Ads Config
  const loadAds = () => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log("adsense error", error.message);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);
  // // Google Ads Config
  useEffect(() => window.scrollTo(0, 0, "smooth"), []);

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
      if (obj.type === "link" || (obj.type === "link" && obj.type === "bold")) {
        modifiedText = (
          <button
            classname="text-red-500   hover:text-blue-500 hover:underline hover:underline-offset-3"
            react-youtubeName="as	"
          >
            <a
              href={obj.href}
              target="_blank"
              className="text-red-500 hover:text-blue-500 hover:underline underline-offset-auto"
            >
              {obj.children[0].text}
            </a>
          </button>
        );
      }
    }

    switch (type) {
      case "code":
        return (
          <h1
            className="text-xl font-semibold mb-4 font-serif lg:font-sans"
            key={index}
          >
            {text}
          </h1>
        );
      case "heading-one":
        return (
          <h1
            key={index}
            className="font-serif lg:font-sans capitalize text-5xl font-semibold mb-4"
          >
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h1>
        );
      case "heading-two":
        return (
          <h2
            key={index}
            className="font-serif lg:font-sans text-3xl font-medium	 mb-4"
          >
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h2>
        );
      case "heading-three":
        return (
          <h3
            key={index}
            className="font-serif lg:font-sans text-xl font-medium mb-4"
          >
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h3>
        );
      case "paragraph":
        return (
          <p
            key={index}
            className=" mb-6 tracking-wide lg:tracking-wide leading-8	 font-sans text-lg font-normal	md:font-light	text-shanu-black "
          >
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </p>
        );
      case "heading-four":
        return (
          <h4
            key={index}
            className="font-serif lg:font-sans text-md font-semibold mb-4"
          >
            {modifiedText.map((item, i) => (
              <React.Fragment key={i}>{item}</React.Fragment>
            ))}
          </h4>
        );
      case "image":
        return (
          <LazyLoadImage
            alt={"images"}
            className="rounded-lg my-4  shadow-lg shadow-indigo-500/40 md:shadow-xl md:shadow-indigo-500/40 "
            height={obj.height}
            width={obj.width}
            src={obj.src} // use normal <img> attributes as props
          />
          // <img
          //   className="rounded-lg"
          //   key={index}
          //   alt={obj.title}
          //   height={obj.height}
          //   width={obj.width}
          //   src={obj.src}
          // />
        );
      case "iframe":
        return (
          // <iframe
          //   className="w-full h-full aspect-video overflow-hidden rounded-lg my-4"
          //   src={obj.url}
          //   height={obj.height}
          //   width={obj.width}
          //   frameborder="0"
          //   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          //   allowfullscreen
          // ></iframe>
          <ReactPlayer
            className="w-full h-full aspect-video overflow-hidden rounded-lg my-4"
            url={obj.url}
            height={"auto"}
            width={"auto"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        );
      case "block-quote":
        // if (window.innerWidth < 410) {
        //   return;
        // }
        return (
          <div key={index} className="">
            {modifiedText.map(
              (item, i) => (
                // <Tweet tweetId={item} className=" w-full aspect-video" />
                <div className="w-full   my-4 overflow-hidden	">
                  <TwitterTweetEmbed tweetId={`${item}`} className="w-full " />
                </div>
              )
              // <React.Fragment key={i}>{item}</React.Fragment>
            )}
          </div>
        );

      default:
        return modifiedText;
    }
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg lg:p-6 pb-12 mb-8">
        {/* Seo */}
        <HeadPostDetails post={post} />
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
