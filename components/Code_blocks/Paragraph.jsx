import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import errorImg from "../../public/error_image/11104.jpg";

const FallbackImage = errorImg; // Set your fallback image path

const ImageRenderer = ({ item, index }) => {
  const [src, setSrc] = useState(item.href);

  const handleError = (event) => {
    console.error("Image failed to load:", event.target.src);
    setSrc(FallbackImage);
  };

  return (
    <LazyLoadImage
      key={index}
      src={src}
      className="rounded-lg my-4 shadow-lg"
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
      } else {
        // Render regular links
        return (
          <a
            key={index}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-sky-400 decoration-2 underline-offset-8 hover:text-sky-600 hover:underline transition duration-200"
          >
            {item.children[0]?.text || "link"}
          </a>
        );
      }
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
          className="underline underline-offset-6 decoration-3 decoration-orange-500"
        >
          {item.text}
        </u>
      );
    } else if (item.code) {
      // Render code
      return (
        <code
          key={index}
          className="bg-gray-100 text-gray-800 font-mono rounded px-2 py-1"
        >
          {item.text}
        </code>
      );
    } else {
      // Render plain text with hashtags in pink and links for hashtags
      return item.text.split(" ").map((word, i) => (
        <React.Fragment key={i}>
          {word.startsWith("#") ? (
            <span className="text-pink-500">{word} </span>
          ) : (
            word + " " // Add space after each word
          )}
        </React.Fragment>
      ));
    }
  };

  return (
    <p className="mb-6 text-gray-800 font-sans text-base md:text-lg lg:text-xl leading-relaxed lg:leading-8 lg:my-9">
      {(obj.children && obj.children.map(renderTextItem)) ||
        (modifiedText && modifiedText.map(renderTextItem)) || (
          <div className="text-green-500">Invalid paragraph</div>
        )}
    </p>
  );
};

export default Paragraph;
