"use client";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { motion, useAnimation } from "framer-motion";
import { LazyLoadImage } from "react-lazy-load-image-component";
import ReactPlayer from "react-player/lazy";
import React, { useEffect, useRef } from "react";
import NestedTable from "./Nested_Table";
import Paragraph from "./Paragraph";

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
  let modifiedText = text;

  const Heading = ({ children, className, index }) => {
    const [ref, inView] = useInView({ threshold: 0.1 });
    const controls = useAnimation();

    useEffect(() => {
      if (inView) {
        controls.start({ opacity: 1, y: 0 });
      }
    }, [controls, inView]);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -20 }}
        animate={controls}
        transition={{ duration: 0.5 }}
        className={className}
        key={index}
      >
        {children}
      </motion.div>
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
          className="font-serif text-4xl lg:text-5xl font-bold mb-8"
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
          className="font-serif text-3xl lg:text-4xl font-medium mb-6"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </Heading>
      );
    case "heading-three":
      return (
        <Heading index={index} className="font-serif text-2xl lg:text-3xl mb-4">
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
          className="font-serif lg:font-sans text-xl font-semibold mb-4"
        >
          {modifiedText.map((item, i) => (
            <React.Fragment key={i}>{item}</React.Fragment>
          ))}
        </Heading>
      );
    case "image":
      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LazyLoadImage
            alt={"images"}
            className="rounded-lg my-4 shadow-lg"
            height={obj.height}
            width={obj.width}
            src={obj.src} // use normal <img> attributes as props
          />
        </motion.div>
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
                className="w-full h-full rounded-lg"
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
                  <TwitterTweetEmbed tweetId={`${item}`} className="w-full" />
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
  const listClass =
    type === "bulleted-list" ? "list-none md:list-disc" : "list-decimal";

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
          className="underline decoration-sky-400 decoration-2 underline-offset-8 hover:text-sky-600 hover:underline transition duration-200"
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
          className="mb-2 leading-relaxed text-gray-800 font-sans text-base md:text-lg lg:text-xl"
        >
          {extractAndRenderChildren(listItem.children[0].children)}
        </li>
      ))}
    </ListTag>
  );
};
