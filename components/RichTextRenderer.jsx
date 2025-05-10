import React from "react";
import { RichText } from "@graphcms/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import TwitterEmbed from "./TwitterEmbed";
import {
  extractImageDimensions,
  createImageDebugUrl,
} from "../utils/imageUtils";

const RichTextRenderer = ({ content, references = [] }) => {
  // Handle case where content might be a string (JSON stringified)
  if (typeof content === "string") {
    try {
      content = JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse content string:", error);
      return <p>Error rendering content</p>;
    }
  }

  if (!content) {
    return (
      <p className="text-gray-700 p-4 text-center">No content available.</p>
    );
  }

  // Handle case where content is in the old format with children
  if (content.children && Array.isArray(content.children)) {
    try {
      // Use our custom rendering with the legacy content
      return (
        <div className="rich-text-content max-w-3xl mx-auto">
          <div className="prose prose-lg">
            {content.children.map((typeObj, index) => {
              if (typeObj.type === "paragraph") {
                return (
                  <p
                    key={index}
                    className="text-gray-700 mb-6 mt-4 leading-relaxed"
                  >
                    {Array.isArray(typeObj.children)
                      ? typeObj.children.map((item, i) => {
                          if (!item) return null;
                          if (item.bold) {
                            return <strong key={i}>{item.text || ""}</strong>;
                          }
                          if (item.italic) {
                            return <em key={i}>{item.text || ""}</em>;
                          }
                          if (item.underline) {
                            return <u key={i}>{item.text || ""}</u>;
                          }
                          if (item.code) {
                            return (
                              <code
                                key={i}
                                className="bg-gray-100 px-1 py-0.5 rounded"
                              >
                                {item.text || ""}
                              </code>
                            );
                          }
                          return item.text || "";
                        })
                      : "Paragraph content"}
                  </p>
                );
              }
              if (typeObj.type === "heading-one") {
                return (
                  <h1
                    key={index}
                    className="text-3xl font-bold mt-12 mb-6 text-gray-900"
                  >
                    {Array.isArray(typeObj.children)
                      ? typeObj.children
                          .map((child) => child.text || "")
                          .join("")
                      : "Heading"}
                  </h1>
                );
              }
              if (typeObj.type === "heading-two") {
                return (
                  <h2
                    key={index}
                    className="text-2xl font-bold mt-10 mb-5 text-gray-900"
                  >
                    {Array.isArray(typeObj.children)
                      ? typeObj.children
                          .map((child) => child.text || "")
                          .join("")
                      : "Heading"}
                  </h2>
                );
              }
              if (typeObj.type === "heading-three") {
                return (
                  <h3
                    key={index}
                    className="text-xl font-bold mt-8 mb-4 text-gray-900"
                  >
                    {Array.isArray(typeObj.children)
                      ? typeObj.children
                          .map((child) => child.text || "")
                          .join("")
                      : "Heading"}
                  </h3>
                );
              }
              return null;
            })}
          </div>
        </div>
      );
    } catch (error) {
      console.error("Error rendering legacy content format:", error);

      // Fallback to simple rendering if conversion fails
      return (
        <div className="rich-text-content max-w-3xl mx-auto">
          <div className="prose prose-lg">
            <p className="text-gray-700 mb-6 mt-4">
              The content could not be displayed properly. Please try refreshing
              the page.
            </p>
          </div>
        </div>
      );
    }
  }

  // Ensure references is in the correct format for the RichText component
  // The RichText component expects references to be an array, not an object
  let processedReferences = [];

  if (!references) {
    processedReferences = [];
  } else if (Array.isArray(references)) {
    processedReferences = references;
  } else if (typeof references === "object") {
    try {
      processedReferences = Object.values(references);
    } catch (e) {
      console.error("Failed to convert references object to array:", e);
      processedReferences = [];
    }
  }

  try {
    // Determine which content format to use (json or raw)
    let processedContent = content;

    if (typeof content === "object") {
      // Prefer json format if available
      if (content.json) {
        processedContent = content.json;
      } else if (content.raw) {
        processedContent = content.raw;
      }

      // If processedContent is a string, try to parse it as JSON
      if (typeof processedContent === "string") {
        try {
          processedContent = JSON.parse(processedContent);
        } catch (parseError) {
          console.error("Failed to parse content string as JSON:", parseError);
          // Create a minimal valid content structure
          processedContent = {
            nodeType: "document",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                content: [
                  {
                    nodeType: "text",
                    value: "Content could not be displayed properly.",
                    marks: [],
                    data: {},
                  },
                ],
                data: {},
              },
            ],
          };
        }
      }
    }

    return (
      <div className="rich-text-content max-w-3xl mx-auto">
        <RichText
          content={processedContent}
          references={processedReferences}
          renderers={{
            blockquote: ({ children }) => {
              // Extract text content from children, handling different types
              let childText = "";

              try {
                // Function to recursively extract text from React elements
                const extractTextFromReactElement = (element) => {
                  if (!element) return "";

                  // If it's a string or number, return it directly
                  if (typeof element === "string") return element;
                  if (typeof element === "number") return element.toString();

                  // If it's a React element
                  if (React.isValidElement(element)) {
                    // Get the children from props
                    const elementChildren =
                      element.props && element.props.children;

                    // Recursively extract text from children
                    return extractTextFromReactElement(elementChildren);
                  }

                  // If it's an array, process each item
                  if (Array.isArray(element)) {
                    return element
                      .map((item) => extractTextFromReactElement(item))
                      .join("");
                  }

                  // If it's an object with text property
                  if (element && typeof element === "object") {
                    if (element.text) return element.text;
                    if (element.content) return element.content;

                    // Try to extract from props.children if available
                    if (element.props && element.props.children) {
                      return extractTextFromReactElement(
                        element.props.children
                      );
                    }
                  }

                  // Last resort: try toString()
                  try {
                    return String(element);
                  } catch (e) {
                    return "";
                  }
                };

                // Extract text using our recursive function
                childText = extractTextFromReactElement(children);

                // Special handling for Hygraph rich text blockquotes
                // Check if this is a paragraph inside a blockquote
                if (
                  !childText &&
                  React.isValidElement(children) &&
                  children.props &&
                  children.props.children
                ) {
                  // Try to get text content from props
                  if (children.props && children.props.content) {
                    childText = children.props.content;
                  } else if (children.props && children.props.children) {
                    // If children has text as direct children
                    if (typeof children.props.children === "string") {
                      childText = children.props.children;
                    } else if (Array.isArray(children.props.children)) {
                      // Array of elements
                      childText = children.props.children
                        .map((child) => {
                          if (typeof child === "string") return child;
                          if (typeof child === "number")
                            return child.toString();
                          return "";
                        })
                        .join("");
                    } else {
                      // Try to stringify if it's an object
                      try {
                        childText = JSON.stringify(children.props.children);
                      } catch (e) {
                        console.log("Could not stringify children:", e);
                      }
                    }
                  }
                }

                // If we still don't have text, try one more approach with toString
                if (!childText && children) {
                  try {
                    const stringified = String(children);
                    if (stringified && stringified !== "[object Object]") {
                      childText = stringified;
                    }
                  } catch (e) {
                    console.error("Error in toString fallback:", e);
                  }
                }

                // Debug the structure in detail
                console.log(
                  "Blockquote children structure:",
                  React.isValidElement(children)
                    ? "React Element"
                    : typeof children,
                  React.isValidElement(children) && children.props
                    ? "Has props"
                    : "No props"
                );

                // More detailed debugging of the structure
                if (React.isValidElement(children) && children.props) {
                  console.log("Blockquote props:", Object.keys(children.props));

                  if (children.props.children) {
                    console.log(
                      "Blockquote children type:",
                      typeof children.props.children,
                      "isArray:",
                      Array.isArray(children.props.children),
                      "isReactElement:",
                      React.isValidElement(children.props.children)
                    );

                    // If it's a React element, log its props
                    if (React.isValidElement(children.props.children)) {
                      console.log(
                        "Blockquote children props:",
                        Object.keys(children.props.children.props || {})
                      );

                      // If it has children, log those too
                      if (
                        children.props.children.props &&
                        children.props.children.props.children
                      ) {
                        const grandchildren =
                          children.props.children.props.children;
                        console.log(
                          "Blockquote grandchildren type:",
                          typeof grandchildren,
                          "isArray:",
                          Array.isArray(grandchildren),
                          "isReactElement:",
                          React.isValidElement(grandchildren),
                          "value:",
                          typeof grandchildren === "string"
                            ? grandchildren
                            : "non-string"
                        );
                      }
                    }

                    // If it's an array, log the first few items
                    if (Array.isArray(children.props.children)) {
                      children.props.children
                        .slice(0, 3)
                        .forEach((child, i) => {
                          console.log(
                            `Blockquote child[${i}] type:`,
                            typeof child,
                            "isReactElement:",
                            React.isValidElement(child),
                            "value:",
                            typeof child === "string" ? child : "non-string"
                          );
                        });
                    }
                  }
                }
              } catch (error) {
                console.error("Error extracting text from blockquote:", error);
                childText = "";
              }

              // Clean up the text - ensure childText is a string before calling trim()
              let trimmedText = "";
              try {
                // Convert childText to string if it's not already
                const childTextStr =
                  typeof childText === "string"
                    ? childText
                    : String(childText || "");
                trimmedText = childTextStr.trim();
              } catch (error) {
                console.error("Error trimming childText:", error);
                trimmedText = "";
              }

              // Only treat as tweet ID if it's exactly a number and nothing else
              let isExactlyTweetId = false;
              let tweetId = null;

              try {
                // Make sure trimmedText is a string
                if (typeof trimmedText === "string") {
                  // Check if it's a numeric string with sufficient length
                  isExactlyTweetId =
                    /^\d+$/.test(trimmedText) && trimmedText.length > 8;

                  if (isExactlyTweetId) {
                    tweetId = trimmedText;
                  }
                }

                // If we didn't find a tweet ID yet, try a more direct approach
                if (!tweetId) {
                  // Try to find a numeric string that looks like a tweet ID in the props structure
                  const findTweetId = (element) => {
                    if (!element) return null;

                    // If it's a string and looks like a tweet ID
                    if (typeof element === "string") {
                      const cleaned = element.trim();
                      if (/^\d+$/.test(cleaned) && cleaned.length > 8) {
                        return cleaned;
                      }
                    }

                    // If it's a React element with props
                    if (React.isValidElement(element) && element.props) {
                      // Check children
                      if (element.props.children) {
                        const childResult = findTweetId(element.props.children);
                        if (childResult) return childResult;
                      }

                      // Check other props
                      for (const key in element.props) {
                        if (key !== "children") {
                          const propResult = findTweetId(element.props[key]);
                          if (propResult) return propResult;
                        }
                      }
                    }

                    // If it's an array
                    if (Array.isArray(element)) {
                      for (const item of element) {
                        const arrayResult = findTweetId(item);
                        if (arrayResult) return arrayResult;
                      }
                    }

                    // If it's an object
                    if (element && typeof element === "object") {
                      for (const key in element) {
                        const objResult = findTweetId(element[key]);
                        if (objResult) return objResult;
                      }
                    }

                    return null;
                  };

                  // Try to find a tweet ID in the children structure
                  const foundTweetId = findTweetId(children);
                  if (foundTweetId) {
                    tweetId = foundTweetId;
                    isExactlyTweetId = true;
                    console.log("Found tweet ID using direct search:", tweetId);
                  }
                }
              } catch (error) {
                console.error("Error checking if text is a tweet ID:", error);
                isExactlyTweetId = false;
              }

              console.log(
                "TWEET CHECK:",
                "Extracted text type:",
                typeof trimmedText,
                "Text:",
                trimmedText,
                "Is tweet ID:",
                isExactlyTweetId,
                "Length:",
                trimmedText ? trimmedText.length : 0,
                "Is numeric:",
                typeof trimmedText === "string"
                  ? /^\d+$/.test(trimmedText)
                  : false
              );

              if (isExactlyTweetId && (tweetId || trimmedText)) {
                // Use the found tweet ID or fall back to trimmedText
                const finalTweetId = tweetId || trimmedText;

                console.log("Rendering tweet with ID:", finalTweetId);

                // Create a direct Twitter embed as a fallback option
                const directTweetEmbed = () => {
                  return (
                    <div className="my-8 mx-auto max-w-xl">
                      <blockquote className="twitter-tweet" data-dnt="true">
                        <a
                          href={`https://twitter.com/i/status/${finalTweetId}`}
                        ></a>
                      </blockquote>
                      {/* Add Twitter widget script if needed */}
                      <script
                        async
                        src="https://platform.twitter.com/widgets.js"
                      ></script>
                    </div>
                  );
                };

                // Try our custom component first, with the direct embed as fallback
                return (
                  <div className="my-16 mx-auto max-w-4xl">
                    <TwitterEmbed tweetId={finalTweetId} />
                  </div>
                );
              }

              // Regular blockquote rendering for non-tweet content
              return (
                <blockquote className="border-l-4 border-primary pl-4 py-1 my-6 text-gray-700 italic">
                  <div className="text-lg font-serif">{children}</div>
                </blockquote>
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc pl-6 mb-6 mt-4 text-gray-800 space-y-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 mb-6 mt-4 text-gray-800 space-y-2">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-800 leading-relaxed mb-1">{children}</li>
            ),
            h1: ({ children }) => (
              <h1 className="text-3xl md:text-4xl font-bold mt-12 mb-6 text-gray-900 font-serif leading-tight tracking-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-5 text-gray-800 font-serif leading-tight tracking-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl md:text-2xl font-semibold mt-10 mb-4 text-gray-800 font-serif leading-tight">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-800 mb-7 mt-4 leading-relaxed text-lg font-sans tracking-normal">
                {children}
              </p>
            ),
            a: ({ children, href, openInNewTab }) => (
              <Link
                href={href || "#"}
                target={openInNewTab ? "_blank" : "_self"}
                className="text-red-500 hover:text-red-700 underline transition-colors"
                rel={openInNewTab ? "noopener noreferrer" : ""}
              >
                {children}
              </Link>
            ),
            img: ({ src, altText, height, width }) => {
              // Extract dimensions from URL if not provided
              const extractedDimensions = extractImageDimensions(src);

              // Use extracted dimensions as fallback
              const imageHeight = height || extractedDimensions.height || 600;
              const imageWidth = width || extractedDimensions.width || 1200;

              // If no source, render placeholder
              if (!src) {
                return (
                  <div className="my-8 bg-gray-200 rounded-lg shadow-md h-64 flex items-center justify-center">
                    <p className="text-gray-500">Image not available</p>
                  </div>
                );
              }

              return (
                <div className="my-8">
                  <Image
                    src={src}
                    alt={altText || "Blog image"}
                    height={imageHeight}
                    width={imageWidth}
                    className="rounded-lg shadow-md"
                    priority={false}
                    quality={85}
                  />
                  {altText && (
                    <figcaption className="text-center text-gray-500 text-sm mt-2 italic">
                      {altText}
                    </figcaption>
                  )}
                </div>
              );
            },
            code_block: ({ children }) => {
              // Extract language and code
              const language =
                children?.props?.className?.replace("language-", "") ||
                "javascript";
              const code = children?.props?.children || "";

              return (
                <div className="my-6 rounded-md overflow-hidden">
                  <SyntaxHighlighter
                    language={language}
                    style={atomDark}
                    showLineNumbers
                    wrapLines
                    className="text-sm"
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            },
            // Custom embeds for Twitter, YouTube, and Social embeds
            embeds: {
              SocialEmbed: ({ nodeId, children }) => {
                // Extract text using the same robust method as blockquotes
                let childText = "";

                try {
                  // Function to recursively extract text from React elements
                  const extractTextFromReactElement = (element) => {
                    if (!element) return "";

                    // If it's a string or number, return it directly
                    if (typeof element === "string") return element;
                    if (typeof element === "number") return element.toString();

                    // If it's a React element
                    if (React.isValidElement(element)) {
                      // Get the children from props
                      const elementChildren =
                        element.props && element.props.children;

                      // Recursively extract text from children
                      return extractTextFromReactElement(elementChildren);
                    }

                    // If it's an array, process each item
                    if (Array.isArray(element)) {
                      return element
                        .map((item) => extractTextFromReactElement(item))
                        .join("");
                    }

                    // If it's an object with text property
                    if (element && typeof element === "object") {
                      if (element.text) return element.text;
                      if (element.content) return element.content;
                    }

                    // Last resort: try toString()
                    try {
                      return String(element);
                    } catch (e) {
                      return "";
                    }
                  };

                  // Extract text using our recursive function
                  childText = extractTextFromReactElement(children);
                } catch (error) {
                  console.error(
                    "Error extracting text from SocialEmbed:",
                    error
                  );
                  childText = children?.toString() || "";
                }

                // Clean up the text
                let trimmedText = "";
                try {
                  const childTextStr =
                    typeof childText === "string"
                      ? childText
                      : String(childText || "");
                  trimmedText = childTextStr.trim();
                } catch (error) {
                  console.error("Error trimming SocialEmbed childText:", error);
                  trimmedText = "";
                }

                // Only treat as tweet ID if it's exactly a number and nothing else
                let isExactlyTweetId = false;
                let tweetId = null;

                try {
                  // Check if trimmedText is a tweet ID
                  if (typeof trimmedText === "string") {
                    isExactlyTweetId =
                      /^\d+$/.test(trimmedText) && trimmedText.length > 8;

                    if (isExactlyTweetId) {
                      tweetId = trimmedText;
                    }
                  }

                  // If we didn't find a tweet ID yet, try a more direct approach
                  if (!tweetId) {
                    // Try to find a numeric string that looks like a tweet ID in the props structure
                    const findTweetId = (element) => {
                      if (!element) return null;

                      // If it's a string and looks like a tweet ID
                      if (typeof element === "string") {
                        const cleaned = element.trim();
                        if (/^\d+$/.test(cleaned) && cleaned.length > 8) {
                          return cleaned;
                        }
                      }

                      // If it's a React element with props
                      if (React.isValidElement(element) && element.props) {
                        // Check children
                        if (element.props.children) {
                          const childResult = findTweetId(
                            element.props.children
                          );
                          if (childResult) return childResult;
                        }
                      }

                      // If it's an array
                      if (Array.isArray(element)) {
                        for (const item of element) {
                          const arrayResult = findTweetId(item);
                          if (arrayResult) return arrayResult;
                        }
                      }

                      return null;
                    };

                    // Try to find a tweet ID in the children structure
                    const foundTweetId = findTweetId(children);
                    if (foundTweetId) {
                      tweetId = foundTweetId;
                      isExactlyTweetId = true;
                      console.log(
                        "SocialEmbed: Found tweet ID using direct search:",
                        tweetId
                      );
                    }
                  }
                } catch (error) {
                  console.error(
                    "Error checking if SocialEmbed text is a tweet ID:",
                    error
                  );
                  isExactlyTweetId = false;
                }

                console.log(
                  "SocialEmbed content:",
                  "Type:",
                  typeof trimmedText,
                  "Text:",
                  trimmedText,
                  "Is tweet ID:",
                  isExactlyTweetId,
                  "Length:",
                  trimmedText ? trimmedText.length : 0
                );

                if (isExactlyTweetId && (tweetId || trimmedText)) {
                  // Use the found tweet ID or fall back to trimmedText
                  const finalTweetId = tweetId || trimmedText;

                  console.log(
                    "SocialEmbed: Rendering tweet with ID:",
                    finalTweetId
                  );

                  return (
                    <div className="my-16 mx-auto max-w-4xl">
                      <TwitterEmbed tweetId={finalTweetId} />
                    </div>
                  );
                }

                // Handle specific social embeds based on nodeId
                // This is useful for mapping known embeds to specific tweet IDs
                const knownTweetIds = {
                  // Add your known tweet IDs here if needed
                };

                if (knownTweetIds[nodeId]) {
                  return (
                    <div className="my-16 mx-auto max-w-4xl">
                      <TwitterEmbed tweetId={knownTweetIds[nodeId]} />
                    </div>
                  );
                }

                // Default fallback for unknown social embeds
                return (
                  <div className="my-8 p-4 border border-gray-300 rounded-lg bg-gray-50 text-center">
                    <p className="text-gray-500">
                      Social embed content (ID: {nodeId})
                    </p>
                  </div>
                );
              },
              Twitter: ({ nodeId, url }) => {
                if (!url) return <p>Twitter embed (URL not available)</p>;

                // Extract tweet ID from URL with better parsing
                let tweetId;
                try {
                  // Handle different Twitter URL formats
                  if (url.includes("/status/")) {
                    // Standard format: https://twitter.com/username/status/1234567890
                    const statusMatch = url.match(/\/status\/(\d+)/);
                    tweetId = statusMatch ? statusMatch[1] : null;
                  } else if (url.includes("x.com")) {
                    // Handle x.com URLs: https://x.com/username/status/1234567890
                    const statusMatch = url.match(/\/status\/(\d+)/);
                    tweetId = statusMatch ? statusMatch[1] : null;
                  } else {
                    // Fallback to simple extraction
                    tweetId = url.split("/").pop();
                  }

                  // Remove any query parameters
                  if (tweetId && tweetId.includes("?")) {
                    tweetId = tweetId.split("?")[0];
                  }
                } catch (error) {
                  console.error("Error parsing Twitter URL:", error);
                  tweetId = url.split("/").pop(); // Fallback
                }

                if (!tweetId) {
                  return <p>Invalid Twitter URL: {url}</p>;
                }

                return (
                  <div className="my-16 mx-auto max-w-4xl">
                    <TwitterEmbed tweetId={tweetId} />
                  </div>
                );
              },
              YouTube: ({ nodeId, url }) => {
                if (!url) return <p>YouTube embed (URL not available)</p>;
                try {
                  // Extract video ID from URL
                  const videoId = new URL(url).searchParams.get("v");
                  return (
                    <div className="aspect-w-16 aspect-h-9 my-8">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg shadow-md"
                      />
                    </div>
                  );
                } catch (error) {
                  console.error("Error parsing YouTube URL:", error);
                  return <p>YouTube embed (invalid URL)</p>;
                }
              },
            },
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("Error rendering rich text content:", error);

    // Simplified fallback rendering for all error cases
    return (
      <div className="rich-text-content max-w-3xl mx-auto">
        <div className="prose prose-lg">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-600 font-medium">Error rendering content</p>
            {process.env.NODE_ENV === "development" && (
              <p className="text-red-500 text-sm mt-1">{error.message}</p>
            )}
          </div>
          <p className="text-gray-700">
            We encountered an error while trying to display this content. Please
            try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
};

export default RichTextRenderer;
