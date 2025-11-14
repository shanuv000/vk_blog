"use client";
import React, { useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactPlayer from "react-player/youtube";
import { TwitterTweetEmbed } from "react-twitter-embed";
import NestedTable from "./Nested_Table";
import Paragraph from "./Paragraph";
import CustomYouTubeEmbed from "../CustomYouTubeEmbed";
import FacebookEmbed from "../FacebookEmbed";
import InstagramEmbed from "../InstagramEmbed";

// Intersection Observer Hook
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
};

export const getContentFragment = (index, text, obj, type) => {
  const modifiedText = text;

  const Heading = ({ children, className, index }) => {
    const [ref, inView] = useInView({ threshold: 0.1 });

    return (
      <div ref={ref} className={className} key={index}>
        {children}
      </div>
    );
  };

  switch (type) {
    case "bulleted-list":
      return renderList("bulleted-list", index, obj);

    case "numbered-list":
      return renderList("numbered-list", index, obj);

    case "heading-one":
      return (
        <Heading
          index={index}
          className="font-heading text-4xl lg:text-5xl font-bold mb-8 text-text-primary"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </Heading>
      );
    case "heading-two":
      return (
        <Heading
          index={index}
          className="font-heading text-3xl lg:text-4xl font-semibold mb-6 text-text-primary"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </Heading>
      );
    case "heading-three":
      return (
        <Heading
          index={index}
          className="font-heading text-2xl lg:text-3xl font-medium mb-4 text-text-primary"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </Heading>
      );
    case "paragraph":
      return <Paragraph obj={obj} modifiedText={modifiedText} />;

    case "heading-four":
      return (
        <Heading
          index={index}
          className="font-heading text-xl font-medium mb-4 text-text-primary"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </Heading>
      );
    case "image":
      return (
        <div key={index}>
          <LazyLoadImage
            alt="images"
            className="rounded-lg my-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            height={obj.height}
            width={obj.width}
            src={obj.src} // use normal <img> attributes as props
          />
        </div>
      );
    case "iframe":
      return (
        <>
          {isYoutubeUrl(obj.url) ? (
            <CustomYouTubeEmbed videoId={obj.url} title="YouTube Video" />
          ) : (
            <div className="relative pt-[56.25%] my-4">
              <ReactPlayer
                className="absolute top-0 left-0 rounded-lg overflow-hidden shadow-md"
                url={obj.url}
                width="100%"
                height="100%"
                loop
                playing
                muted // Mute the video for autoplay
                controls
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
            .map((item, i) => {
              // Check if it's a Twitter ID (starts with a number)
              if (item.charAt(0) === "1") {
                return (
                  <div className="w-full my-4 overflow-hidden" key={i}>
                    <TwitterTweetEmbed tweetId={`${item}`} className="w-full" />
                  </div>
                );
              }

              // Check if it's a Facebook URL
              else if (
                item.includes("facebook.com") ||
                item.includes("fb.com") ||
                item.includes("fb.watch")
              ) {
                return (
                  <div className="w-full my-4 overflow-hidden" key={i}>
                    <FacebookEmbed url={item} />
                  </div>
                );
              }

              // Check if it's an Instagram URL
              else if (
                item.includes("instagram.com") ||
                item.includes("instagr.am")
              ) {
                return (
                  <div className="w-full my-4 overflow-hidden" key={i}>
                    <InstagramEmbed url={item} />
                  </div>
                );
              }

              // Note: YouTube URLs are intentionally not detected in blockquotes
              // as they should only be handled through iframes with ReactPlayer

              // Default blockquote rendering
              
                return (
                  <blockquote
                    className="border-l-4 border-primary pl-4 italic text-text-secondary my-3 py-2"
                    key={i}
                  >
                    <p>{item}</p>
                  </blockquote>
                );
              
            })}
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
  const listClass =
    type === "bulleted-list" ? "list-none md:list-disc" : "list-decimal";

  const renderText = (node) => {
    if (node.bold) {
      return <b className="font-bold">{node.text}</b>;
    }
    if (node.code) {
      return (
        <code className="bg-secondary-light text-primary font-mono rounded px-2 py-1">
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
          className="text-primary hover:text-primary-dark underline decoration-2 underline-offset-4 transition duration-200"
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
    <ListTag
      key={index}
      className={`${listClass} list-inside mb-6 leading-2 pl-6 lg:leading-8`}
    >
      {obj.children.map((listItem, i) => (
        <li
          key={i}
          className="mb-2 leading-relaxed text-text-primary font-sans text-base md:text-lg"
        >
          {extractAndRenderChildren(listItem.children[0].children)}
        </li>
      ))}
    </ListTag>
  );
};
