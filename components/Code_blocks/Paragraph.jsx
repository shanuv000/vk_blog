"use client";
import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import errorImg from "../../public/error_image/11104.jpg";

const FallbackImage = errorImg; // Set your fallback image path

const ImageRenderer = ({ item, index }) => {
  const [src, setSrc] = useState(item.href);

  const handleError = (event) => {
    // Keep console.error for production error tracking
    console.error("Image failed to load:", event.target.src);
    setSrc(FallbackImage);
  };

  return (
    <LazyLoadImage
      key={index}
      src={src}
      className="rounded-lg my-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
      alt={item.children[0]?.text || "image"}
      onError={handleError}
    />
  );
};

const Paragraph = ({ obj, modifiedText }) => {
  const renderTextItem = (item, index) => {
    if (item.type === "link") {
      // Regular expression to match common image extensions
      const imageExtensions = /\.(webp|jpg|jpeg|png)$/i;

      // Check if the link ends with an image extension
      if (imageExtensions.test(item.href)) {
        // Render images using ImageRenderer with error handling
        return <ImageRenderer key={index} item={item} />;
      } 
        // Render regular links
        return (
          <a
            key={index}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-dark underline decoration-2 underline-offset-4 transition duration-200"
          >
            {item.children[0]?.text || "link"}
          </a>
        );
      
    } else if (item.bold) {
      // Render bold text
      return (
        <b key={index} className="font-semibold">
          {item.text}
        </b>
      );
    } else if (item.underline) {
      // Render underlined text
      return (
        <u
          key={index}
          className="underline underline-offset-4 decoration-2 decoration-primary"
        >
          {item.text}
        </u>
      );
    } else if (item.code) {
      // Render code
      return (
        <code
          key={index}
          className="bg-secondary-light text-primary font-mono rounded px-2 py-1"
        >
          {item.text}
        </code>
      );
    } 
      // Render plain text with hashtags in pink and links for hashtags
      return item.text.split(" ").map((word, i) => (
        <React.Fragment key={i}>
          {word.startsWith("#") ? (
            <span className="text-primary">{word} </span>
          ) : (
            `${word  } ` // Add space after each word
          )}
        </React.Fragment>
      ));
    
  };

  return (
    <p className="mb-6 text-text-primary font-sans text-base md:text-lg leading-relaxed lg:leading-8 lg:my-6">
      {(obj.children &&
        obj.children.map((item, idx) => renderTextItem(item, idx))) ||
        (modifiedText &&
          modifiedText.map((item, idx) => renderTextItem(item, idx))) || (
          <div className="text-green-500">Invalid paragraph</div>
        )}
    </p>
  );
};

export default Paragraph;
