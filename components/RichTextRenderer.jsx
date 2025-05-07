import React from "react";
import { RichText } from "@graphcms/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { TwitterTweetEmbed } from "react-twitter-embed";

const RichTextRenderer = ({ content, references = [] }) => {
  // Enhanced debugging for content structure
  console.log("RichTextRenderer content type:", typeof content);
  console.log(
    "RichTextRenderer references type:",
    typeof references,
    Array.isArray(references)
  );

  // Log detailed information about content structure
  if (content && typeof content === "object") {
    console.log("Content keys:", Object.keys(content));

    if (content.json) {
      console.log("Using json content format");
      try {
        console.log(
          "JSON content structure:",
          typeof content.json === "object"
            ? `Object with keys: ${Object.keys(content.json).join(", ")}`
            : typeof content.json
        );
      } catch (e) {
        console.error("Error inspecting json content:", e);
      }
    }

    if (content.raw) {
      console.log("Using raw content format");
      try {
        console.log(
          "Raw content structure:",
          typeof content.raw === "object"
            ? `Object with keys: ${Object.keys(content.raw).join(", ")}`
            : typeof content.raw
        );
      } catch (e) {
        console.error("Error inspecting raw content:", e);
      }
    }
  }

  // Log detailed information about references
  if (references && references.length > 0) {
    console.log(`References count: ${references.length}`);
    console.log("First reference type:", references[0].__typename || "unknown");
    console.log("Reference IDs:", references.map((ref) => ref.id).join(", "));
  }

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

  // Convert object to array if needed
  // This is critical for handling the "Expected array data but received: object" error
  const convertObjectsToArrays = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    // If it's an array, process each item
    if (Array.isArray(obj)) {
      return obj.map((item) => convertObjectsToArrays(item));
    }

    // It's an object, process each property
    const result = { ...obj };

    // Check for children property specifically
    if (
      result.children &&
      !Array.isArray(result.children) &&
      typeof result.children === "object"
    ) {
      console.log("Converting children object to array");
      result.children = Object.values(result.children).map((child) =>
        convertObjectsToArrays(child)
      );
    }

    // Process other properties
    Object.keys(result).forEach((key) => {
      if (
        key !== "children" &&
        result[key] &&
        typeof result[key] === "object"
      ) {
        // If property has numeric keys, it might be an object that should be an array
        if (
          !Array.isArray(result[key]) &&
          Object.keys(result[key]).some((k) => !isNaN(parseInt(k)))
        ) {
          console.log(`Converting ${key} from object to array`);
          result[key] = Object.values(result[key]).map((item) =>
            convertObjectsToArrays(item)
          );
        } else {
          result[key] = convertObjectsToArrays(result[key]);
        }
      }
    });

    return result;
  };

  // Apply the conversion to the entire content object
  content = convertObjectsToArrays(content);
  console.log(
    "Content structure after conversion:",
    content && content.children
      ? `children is array: ${Array.isArray(content.children)}, length: ${
          content.children.length
        }`
      : "No children property"
  );

  // Handle case where content is in the old format with children
  if (content.children && Array.isArray(content.children)) {
    console.log("Using legacy content format with children");
    // This is the old format, we'll use the existing rendering logic
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
                  {typeObj.children.map((item, i) => {
                    if (item.bold) {
                      return <strong key={i}>{item.text}</strong>;
                    }
                    if (item.italic) {
                      return <em key={i}>{item.text}</em>;
                    }
                    if (item.underline) {
                      return <u key={i}>{item.text}</u>;
                    }
                    if (item.code) {
                      return (
                        <code
                          key={i}
                          className="bg-gray-100 px-1 py-0.5 rounded"
                        >
                          {item.text}
                        </code>
                      );
                    }
                    return item.text;
                  })}
                </p>
              );
            }
            if (typeObj.type === "heading-one") {
              return (
                <h1
                  key={index}
                  className="text-3xl font-bold mt-12 mb-6 text-gray-900"
                >
                  {typeObj.children.map((child) => child.text).join("")}
                </h1>
              );
            }
            if (typeObj.type === "heading-two") {
              return (
                <h2
                  key={index}
                  className="text-2xl font-bold mt-10 mb-5 text-gray-900"
                >
                  {typeObj.children.map((child) => child.text).join("")}
                </h2>
              );
            }
            if (typeObj.type === "heading-three") {
              return (
                <h3
                  key={index}
                  className="text-xl font-bold mt-8 mb-4 text-gray-900"
                >
                  {typeObj.children.map((child) => child.text).join("")}
                </h3>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // Create a map of references for easy lookup with improved error handling
  const referenceMap = {};
  if (references && Array.isArray(references) && references.length > 0) {
    references.forEach((reference) => {
      if (reference && reference.id) {
        referenceMap[reference.id] = reference;
        console.log(`Added reference with ID ${reference.id} to referenceMap`);
      } else {
        console.warn("Found reference without ID:", reference);
      }
    });
    console.log(
      `Created referenceMap with ${Object.keys(referenceMap).length} entries`
    );
  } else if (references && typeof references === "object") {
    // Handle case where references is an object instead of an array
    console.log("References is an object, not an array");
    Object.values(references).forEach((reference) => {
      if (reference && reference.id) {
        referenceMap[reference.id] = reference;
        console.log(`Added reference with ID ${reference.id} to referenceMap`);
      } else {
        console.warn("Found reference without ID:", reference);
      }
    });
    console.log(
      `Created referenceMap with ${Object.keys(referenceMap).length} entries`
    );
  } else {
    console.warn("No valid references provided:", references);
  }

  try {
    // Ensure content is in the correct format for RichText component
    // This addresses the "Expected array data but received: object" error
    let processedContent = content;

    // Determine which content format to use (json or raw)
    if (typeof content === "object") {
      // Prefer json format if available
      if (content.json) {
        console.log("Using json format for RichText rendering");
        processedContent = content.json;
      } else if (content.raw) {
        console.log("Using raw format for RichText rendering");
        processedContent = content.raw;
      } else {
        console.log("Using direct content object for RichText rendering");
      }

      // Process the content to ensure arrays are properly formatted
      const processObject = (obj) => {
        if (!obj || typeof obj !== "object") return obj;

        const result = { ...obj };

        // Process each property
        Object.keys(result).forEach((key) => {
          // If property is an object but not an array, and it has numeric keys, convert to array
          if (
            result[key] &&
            typeof result[key] === "object" &&
            !Array.isArray(result[key]) &&
            Object.keys(result[key]).some((k) => !isNaN(parseInt(k)))
          ) {
            console.log(`Converting ${key} from object to array`);
            result[key] = Object.values(result[key]);
          }

          // Recursively process nested objects
          if (result[key] && typeof result[key] === "object") {
            result[key] = processObject(result[key]);
          }
        });

        return result;
      };

      processedContent = processObject(processedContent);

      // Special handling for children property
      if (
        processedContent.children &&
        !Array.isArray(processedContent.children)
      ) {
        console.log("Converting children from object to array");
        processedContent.children = Object.values(processedContent.children);
      }
    }

    return (
      <div className="rich-text-content max-w-3xl mx-auto">
        <RichText
          content={processedContent}
          references={referenceMap}
          renderers={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mt-12 mb-6 text-gray-900">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold mt-10 mb-5 text-gray-900">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-bold mt-8 mb-4 text-gray-900">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-6 mt-4 leading-relaxed">
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
            img: ({ src, altText, height, width }) => (
              <div className="my-8">
                {src ? (
                  <Image
                    src={src}
                    alt={altText || "Blog image"}
                    height={height || 600}
                    width={width || 1200}
                    className="rounded-lg shadow-md"
                  />
                ) : (
                  <div className="bg-gray-200 rounded-lg shadow-md h-64 flex items-center justify-center">
                    <p className="text-gray-500">Image not available</p>
                  </div>
                )}
              </div>
            ),
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
            // Custom embeds for Twitter and YouTube
            embeds: {
              Twitter: ({ nodeId, url }) => {
                if (!url) return <p>Twitter embed (URL not available)</p>;
                // Extract tweet ID from URL
                const tweetId = url.split("/").pop();
                return <TwitterTweetEmbed tweetId={tweetId} />;
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
            // Add custom renderers for other elements as needed
          }}
        />
      </div>
    );
  } catch (error) {
    console.error("Error rendering rich text content:", error);

    // Check for specific error about expected array
    if (error.message && error.message.includes("Expected array")) {
      console.log(
        "Detected array type error, attempting alternative rendering"
      );

      try {
        // Try to convert any object properties to arrays
        const convertObjectsToArrays = (obj) => {
          if (!obj || typeof obj !== "object") return obj;

          // If it's an array, process each item
          if (Array.isArray(obj)) {
            return obj.map((item) => convertObjectsToArrays(item));
          }

          // It's an object, process each property
          const result = {};
          Object.keys(obj).forEach((key) => {
            // If the key is numeric, this might be an object that should be an array
            if (typeof obj[key] === "object") {
              result[key] = convertObjectsToArrays(obj[key]);
            } else {
              result[key] = obj[key];
            }
          });

          return result;
        };

        // Create a simplified version of the content for basic rendering
        const simplifiedContent = convertObjectsToArrays(content);

        // Render a basic version of the content
        return (
          <div className="rich-text-content max-w-3xl mx-auto">
            <div className="prose prose-lg">
              {typeof simplifiedContent === "object" &&
              simplifiedContent.children ? (
                // Try to render children if they exist
                (Array.isArray(simplifiedContent.children)
                  ? simplifiedContent.children
                  : Object.values(simplifiedContent.children)
                ).map((block, index) => {
                  if (!block || typeof block !== "object") return null;

                  // Handle paragraph blocks
                  if (block.type === "paragraph") {
                    return (
                      <p key={index} className="mb-4 text-gray-700">
                        {Array.isArray(block.children)
                          ? block.children
                              .map((item, i) => {
                                if (!item) return "";
                                if (item.bold)
                                  return (
                                    <strong key={i}>{item.text || ""}</strong>
                                  );
                                if (item.italic)
                                  return <em key={i}>{item.text || ""}</em>;
                                if (item.underline)
                                  return <u key={i}>{item.text || ""}</u>;
                                return item.text || "";
                              })
                              .join("")
                          : typeof block.children === "object"
                          ? Object.values(block.children)
                              .map((item, i) => {
                                if (!item) return "";
                                if (item.bold)
                                  return (
                                    <strong key={i}>{item.text || ""}</strong>
                                  );
                                if (item.italic)
                                  return <em key={i}>{item.text || ""}</em>;
                                if (item.underline)
                                  return <u key={i}>{item.text || ""}</u>;
                                return item.text || "";
                              })
                              .join("")
                          : "Paragraph content"}
                      </p>
                    );
                  }

                  // Handle heading blocks
                  if (block.type === "heading-one") {
                    return (
                      <h1
                        key={index}
                        className="text-3xl font-bold mt-8 mb-4 text-gray-900"
                      >
                        {Array.isArray(block.children)
                          ? block.children
                              .map((child) => child.text || "")
                              .join("")
                          : typeof block.children === "object"
                          ? Object.values(block.children)
                              .map((child) => child.text || "")
                              .join("")
                          : "Heading"}
                      </h1>
                    );
                  }

                  if (block.type === "heading-two") {
                    return (
                      <h2
                        key={index}
                        className="text-2xl font-bold mt-6 mb-3 text-gray-900"
                      >
                        {Array.isArray(block.children)
                          ? block.children
                              .map((child) => child.text || "")
                              .join("")
                          : typeof block.children === "object"
                          ? Object.values(block.children)
                              .map((child) => child.text || "")
                              .join("")
                          : "Heading"}
                      </h2>
                    );
                  }

                  if (block.type === "heading-three") {
                    return (
                      <h3
                        key={index}
                        className="text-xl font-bold mt-5 mb-2 text-gray-900"
                      >
                        {Array.isArray(block.children)
                          ? block.children
                              .map((child) => child.text || "")
                              .join("")
                          : typeof block.children === "object"
                          ? Object.values(block.children)
                              .map((child) => child.text || "")
                              .join("")
                          : "Heading"}
                      </h3>
                    );
                  }

                  return null;
                })
              ) : (
                <p className="text-gray-700">
                  Content could not be displayed in the expected format.
                </p>
              )}
            </div>
          </div>
        );
      } catch (fallbackError) {
        console.error("Fallback rendering also failed:", fallbackError);
      }
    }

    // If we get here, all attempts have failed - show error message
    return (
      <div className="rich-text-content max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600 font-medium">
            Error rendering rich content
          </p>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        </div>

        <div className="prose prose-lg">
          <p>
            We encountered an error while trying to display this content. The
            technical team has been notified.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Error details: {error.toString()}
          </p>
        </div>
      </div>
    );
  }
};

export default RichTextRenderer;
