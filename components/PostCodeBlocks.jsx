"use client";
import { TwitterTweetEmbed } from "react-twitter-embed";

import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactPlayer from "react-player/lazy";
import React from "react";
import NestedTable from "./Nested_Table";
export const getContentFragment = (index, text, obj, type) => {
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
    if (obj.type === "code-block") {
      modifiedText = (
        <pre
          key={index}
          className="bg-gray-300 text-gray-800 font-mono p-4 rounded-md overflow-x-auto "
        >
          <code>{text}</code>
        </pre>
      );
    }

    if (obj.type === "link" || (obj.type === "link" && obj.type === "bold")) {
      modifiedText = (
        <button
          className="text-red-500   hover:text-blue-500 hover:underline hover:underline-offset-3"
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
    case "bulleted-list":
      return renderList("bulleted-list", index, obj);

    case "numbered-list":
      return renderList("numbered-list", index, obj);

    case "heading-one":
      return (
        <h1
          key={index}
          className="font-serif text-4xl lg:text-5xl font-bold mb-8"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </h1>
      );
    case "heading-two":
      return (
        <h1
          key={index}
          className="font-serif text-3xl lg:text-4xl font-medium mb-6"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </h1>
      );
    case "heading-three":
      return (
        <h3 key={index} className="font-serif text-2xl lg:text-3xl mb-4">
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </h3>
      );
    case "paragraph":
      return (
        <p
          key={index}
          className="mb-6 leading-relaxed text-gray-800 font-sans text-base md:text-lg lg:text-xl"
        >
          {/* Error Handling for obj.children */}
          {obj.children && Array.isArray(obj.children) ? (
            obj.children.map((item, i) => (
              <React.Fragment key={i}>
                {/* Error Handling for link */}
                {item.type === "link" && item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-sky-400 decoration-2 underline-offset-8		   hover:text-sky-600 hover:underline  transition duration-200 "
                  >
                    {item.children && item.children[0]?.text
                      ? item.children[0].text
                      : "link"}
                  </a>
                ) : (
                  <>
                    {item.bold && <b className="font-semibold">{item.text}</b>}
                    {item.underline && (
                      <span className="underline underline-offset-6 decoration-3 decoration-orange-500">
                        {item.text}
                      </span>
                    )}
                    {item.code ? (
                      <code className="bg-gray-100 text-gray-800 font-mono rounded px-2 py-1">
                        {item.text}
                      </code>
                    ) : (
                      !item.bold && !item.underline && item.text // Add check for underline
                    )}
                  </>
                )}
              </React.Fragment>
            ))
          ) : modifiedText && Array.isArray(modifiedText) ? (
            modifiedText.map((item, i) => (
              <React.Fragment key={i}>
                {item.code ? <code>{item.text}</code> : item.text}
              </React.Fragment>
            ))
          ) : (
            <div className="text-green-500">Invalid paragraph </div>
          )}
        </p>
      );

    case "heading-four":
      return (
        <h4
          key={index}
          className="font-serif lg:font-sans text-xl font-semibold mb-4"
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
          className="rounded-lg my-4  shadow-lg  "
          height={obj.height}
          width={obj.width}
          src={obj.src} // use normal <img> attributes as props
        />
      );
    case "iframe":
      return (
        <>
          {isYoutubeUrl(obj.url) ? (
            <ReactPlayer
              className="w-full h-full aspect-video overflow-hidden rounded-lg my-4"
              url={obj.url}
              height={"100%"}
              width={"100%"}
              allow="accelerometer; autoplay clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
          ) : (
            <div className="relative pt-16/9">
              {console.log(obj.url)}
              <ReactPlayer
                className=" w-full h-full rounded-lg"
                url={obj.url}
                width="100%"
                height="100%"
                loop={true}
                playing={true}
                muted={true} // Mute the video for autoplay
                controls={false}
                light={obj.thumbnail || false}
                config={{
                  file: {
                    attributes: {
                      poster: obj.thumbnail || "",
                    },
                  },
                }}
              />
            </div>
          )}
        </>
      );
    case "block-quote":
      return (
        <div key={index} className="">
          {modifiedText
            .filter((item) => item !== undefined) // Filter out undefined items
            .map((item, i) =>
              item.charAt(0) === "1" ? (
                <div className="w-full my-4 overflow-hidden" key={i}>
                  <TwitterTweetEmbed tweetId={`${item}`} className="w-full " />
                </div>
              ) : (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-3">
                  <p>{item}</p>
                </blockquote>
              )
            )}
        </div>
      );
    case "table":
      return <NestedTable key={index} data={obj} />;

    default:
      return modifiedText;
  }
};

//Youtube validator

function isYoutubeUrl(url) {
  const youtubeRegex =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return youtubeRegex.test(url);
}

// show Lists
const renderList = (type, index, obj) => {
  const ListTag = type === "bulleted-list" ? "ul" : "ol";
  const listClass = type === "bulleted-list" ? "list-disc" : "list-decimal";

  const renderText = (node) => {
    if (node.bold) {
      return <b className="font-bold">{node.text}</b>;
    }
    if (node.code) {
      return (
        <code className="bg-gray-100 text-gray-800 font-mono rounded px-2 py-1">
          {node.text}
        </code>
      );
    }
    if (node.type === "link") {
      return (
        <a
          href={node.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-sky-400 decoration-2 underline-offset-8		   hover:text-sky-600 hover:underline  transition duration-200 "
        >
          {node.children.map(renderText)}
        </a>
      );
    }
    return node.text;
  };

  const extractAndRenderChildren = (children) => {
    return children.map((childItem, j) => (
      <span key={j}>
        {childItem.children
          ? childItem.children.map(renderText)
          : renderText(childItem)}
      </span>
    ));
  };

  return (
    <ListTag key={index} className={`${listClass} list-inside mb-6 pl-6`}>
      {obj.children.map((listItem, i) => (
        <li
          key={i}
          className="mb-2 leading-relaxed text-gray-800 font-sans text-base md:text-lg lg:text-xl"
        >
          {extractAndRenderChildren(listItem.children[0].children)}
        </li>
      ))}
    </ListTag>
  );
};
