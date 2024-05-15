"use client";
import { TwitterTweetEmbed } from "react-twitter-embed";

import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactPlayer from "react-player/lazy";
import React from "react";
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
    case "bulleted-list":
      return (
        <ul key={index} className="list-disc list-inside mb-6 pl-6">
          {obj.children.map((listItem, i) => (
            <li
              key={i}
              className="mb-2 leading-relaxed text-gray-800 font-sans text-base md:text-lg lg:text-xl"
            >
              {listItem.children[0].children.map((childItem, j) => (
                <span key={j}>
                  {childItem.bold ? (
                    <b className="font-bold">{childItem.text}</b>
                  ) : childItem.code ? (
                    <code className="bg-gray-100 text-gray-800 font-mono rounded px-2 py-1">
                      {childItem.text}
                    </code>
                  ) : (
                    childItem.text
                  )}
                </span>
              ))}
            </li>
          ))}
        </ul>
      );

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
        <h2
          key={index}
          className="font-serif text-3xl lg:text-4xl font-medium mb-6"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </h2>
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
          {obj.children
            ? obj.children.map((item, i) => (
                <React.Fragment key={i}>
                  {item.type === "link" ? (
                    <a
                      href={item.href}
                      target={item.openInNewTab ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {item.title ? item.title : "link"}
                    </a>
                  ) : (
                    <>
                      {item.bold && (
                        <b className="font-semibold">{item.text}</b>
                      )}
                      {item.code ? (
                        <code className="bg-gray-100 text-gray-800 font-mono rounded px-2 py-1">
                          {item.text}
                        </code>
                      ) : (
                        !item.bold && item.text
                      )}
                    </>
                  )}
                </React.Fragment>
              ))
            : modifiedText.map((item, i) => (
                <React.Fragment key={i}>
                  {item.code ? <code>{item.text}</code> : item.text}
                </React.Fragment>
              ))}
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
          className="rounded-lg my-4  shadow-lg shadow-indigo-500/40 md:shadow-xl md:shadow-indigo-500/40 "
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
          {modifiedText.map((item, i) =>
            item.charAt(0) === "1" ? (
              <div className="w-full my-4 overflow-hidden" key={i}>
                <TwitterTweetEmbed tweetId={`${item}`} className="w-full " />
              </div>
            ) : (
              <blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-3">
                <p>{item}</p>
              </blockquote>
            )
          )}
        </div>
      );

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
