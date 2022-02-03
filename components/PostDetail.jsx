import React, { useEffect } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import moment from "moment";
import { LazyLoadImage } from "react-lazy-load-image-component";
// import Document, { Html, Head, Main, NextScript } from "next/document";
import Head from "next/head";
import Seo from "./Seo";

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
      if (obj.type === "link") {
        modifiedText = (
          <button
            classnpm
            i
            react-youtubeName="text-red-500 hover:text-blue-500 hover:underline underline-offset-auto	"
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

      case "heading-three":
        return (
          <h3
            key={index}
            className="font-serif lg:font-sans text-xl font-semibold mb-4"
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
            className="rounded-lg my-4"
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
          <iframe
            className="w-full h-full aspect-video overflow-hidden rounded-lg my-4"
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
                // <Tweet tweetId={item} className=" w-full aspect-video" />
                <div className="w-full  my-4 overflow-hidden	">
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
          <meta property="fb:app_id" content="677336189940107" />

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
          <meta property="article:author" content={post.author.name} />

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
                height="30px"
                width="30px"
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
          <nav class="flex justify-center space-x-4 lg:mb-2 mb-1">
            <a
              target={"_blank"}
              href={`https://twitter.com/intent/tweet?text=${post.title}&url=https://www.keytosuccess.me/post/${post.slug}&via=shanuv0000`}
              class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
            >
              <img src="/twitter.svg" width={45} alt="" />
            </a>
            <a
              target={"_blank"}
              href={`https://www.facebook.com/sharer/sharer.php?u=https://www.keytosuccess.me/post/${post.slug}`}
              class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
            >
              <img src="/facebook.svg" width={45} alt="" />
            </a>
            <a
              target={"_blank"}
              href={`http://www.reddit.com/submit?url=https://www.keytosuccess.me/post/${post.slug}&title=${post.title}&via=u/smattyvaibhav
`}
              class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
            >
              <img src="/reddit.png" width={45} alt="" />
            </a>
            {/* <a
              href="/projects"
              class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
            >
              <img src="/message.png" width={30} alt="" />
            </a> */}
            <a
              target={"_blank"}
              href={`http://pinterest.com/pin/create/button/?url=https://www.keytosuccess.me/post/${post.slug}`}
              class="font-bold px-3 py-2 text-slate-700 rounded-lg hover:bg-slate-100 hover:text-slate-900"
            >
              <img src="/pin.svg" width={45} alt="" />
            </a>
          </nav>
          <h1 className="mb-8 text-3xl font-semibold">{post.title}</h1>
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5634941748977646"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>

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
