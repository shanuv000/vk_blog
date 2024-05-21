import React from "react";
function Paragraph({ obj, modifiedText }) {
  const renderTextItem = (item, index) => {
    if (item.type === "link") {
      // Render links
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
            <a href={`/search?q=${word.slice(1)}`} className="text-pink-500">
              {word}{" "}
            </a>
          ) : (
            word + " " // Add space after each word
          )}
        </React.Fragment>
      ));
    }
  };

  return (
    <p className="mb-6 leading-relaxed text-gray-800 font-sans text-base md:text-lg lg:text-xl">
      {(obj.children && obj.children.map(renderTextItem)) ||
        (modifiedText && modifiedText.map(renderTextItem)) || (
          <div className="text-green-500">Invalid paragraph</div>
        )}
    </p>
  );
}

export default Paragraph;
