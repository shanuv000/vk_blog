import React from "react";
import { RichText } from "@graphcms/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { TwitterTweetEmbed } from "react-twitter-embed";
import {
  extractImageDimensions,
  createImageDebugUrl,
} from "../utils/imageUtils";

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

    // Convert the legacy format to the format expected by RichText component
    try {
      // Create a properly formatted content object for the RichText component
      const formattedContent = {
        nodeType: "document",
        data: {},
        content: content.children.map((block) => {
          // Convert paragraph blocks
          if (block.type === "paragraph") {
            return {
              nodeType: "paragraph",
              data: {},
              content: Array.isArray(block.children)
                ? block.children.map((child) => {
                    const textNode = {
                      nodeType: "text",
                      value: child.text || "",
                      data: {},
                      marks: [],
                    };

                    // Add appropriate marks
                    if (child.bold) textNode.marks.push({ type: "bold" });
                    if (child.italic) textNode.marks.push({ type: "italic" });
                    if (child.underline)
                      textNode.marks.push({ type: "underline" });
                    if (child.code) textNode.marks.push({ type: "code" });

                    return textNode;
                  })
                : [],
            };
          }

          // Convert heading blocks
          if (block.type === "heading-one") {
            return {
              nodeType: "heading-1",
              data: {},
              content: Array.isArray(block.children)
                ? block.children.map((child) => ({
                    nodeType: "text",
                    value: child.text || "",
                    data: {},
                    marks: [],
                  }))
                : [],
            };
          }

          if (block.type === "heading-two") {
            return {
              nodeType: "heading-2",
              data: {},
              content: Array.isArray(block.children)
                ? block.children.map((child) => ({
                    nodeType: "text",
                    value: child.text || "",
                    data: {},
                    marks: [],
                  }))
                : [],
            };
          }

          if (block.type === "heading-three") {
            return {
              nodeType: "heading-3",
              data: {},
              content: Array.isArray(block.children)
                ? block.children.map((child) => ({
                    nodeType: "text",
                    value: child.text || "",
                    data: {},
                    marks: [],
                  }))
                : [],
            };
          }

          // Default for unrecognized blocks
          return {
            nodeType: "paragraph",
            data: {},
            content: [
              {
                nodeType: "text",
                value: "Unsupported content block",
                data: {},
                marks: [],
              },
            ],
          };
        }),
      };

      console.log("Successfully converted legacy format to RichText format");

      // Use our custom rendering with the converted content
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

  // Create a map of references for easy lookup with improved error handling
  const referenceMap = {};

  // Ensure references is always an array
  let referencesArray = [];

  if (!references) {
    console.log("No references provided, using empty array");
    referencesArray = [];
  } else if (Array.isArray(references)) {
    console.log(`References is an array with ${references.length} items`);
    referencesArray = references;
  } else if (typeof references === "object") {
    // Handle case where references is an object instead of an array
    console.log("References is an object, converting to array");
    try {
      referencesArray = Object.values(references);
    } catch (e) {
      console.error("Failed to convert references object to array:", e);
      referencesArray = [];
    }
  } else {
    console.warn(
      `Unexpected references type: ${typeof references}, using empty array`
    );
    referencesArray = [];
  }

  // Process the references array
  referencesArray.forEach((reference) => {
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

      // If processedContent is a string, try to parse it as JSON
      if (typeof processedContent === "string") {
        try {
          console.log("Content is a string, attempting to parse as JSON");
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
        try {
          processedContent.children = Object.values(processedContent.children);
        } catch (e) {
          console.error("Failed to convert children to array:", e);
          processedContent.children = [];
        }
      }

      // Ensure required properties exist
      if (!processedContent.nodeType) {
        console.log("Adding missing nodeType property");
        processedContent.nodeType = "document";
      }

      if (!processedContent.data) {
        console.log("Adding missing data property");
        processedContent.data = {};
      }

      if (!processedContent.content && !processedContent.children) {
        console.log("Adding missing content property");
        processedContent.content = [];
      }
    }

    try {
      // Ensure processedContent is in the correct format
      // Check if we need to convert an object to an array
      if (
        processedContent &&
        processedContent.content &&
        !Array.isArray(processedContent.content)
      ) {
        console.log("Converting content from object to array");
        try {
          processedContent.content = Object.values(processedContent.content);
        } catch (e) {
          console.error("Failed to convert content to array:", e);
          // Create a minimal valid content
          processedContent = {
            nodeType: "document",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                data: {},
                content: [
                  {
                    nodeType: "text",
                    value: "Content could not be displayed properly.",
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          };
        }
      }

      // Ensure all required properties exist
      if (!processedContent.nodeType) {
        processedContent.nodeType = "document";
      }

      if (!processedContent.data) {
        processedContent.data = {};
      }

      // Final check - if content is still not an array, use manual rendering
      if (
        processedContent.content &&
        !Array.isArray(processedContent.content)
      ) {
        console.error(
          "Content is still not an array after conversion attempts"
        );
        throw new Error("Content format is invalid");
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
              img: ({ src, altText, height, width }) => {
                // Log image details for debugging
                console.log(
                  `Rendering image: ${src}, height: ${height}, width: ${width}`
                );

                // Extract dimensions from URL if not provided
                const extractedDimensions = extractImageDimensions(src);

                // Use extracted dimensions as fallback
                const imageHeight =
                  height && !isNaN(parseInt(height))
                    ? parseInt(height)
                    : extractedDimensions.height || 600;

                const imageWidth =
                  width && !isNaN(parseInt(width))
                    ? parseInt(width)
                    : extractedDimensions.width || 1200;

                // If no source, render placeholder
                if (!src) {
                  console.log(
                    "No image source provided, rendering placeholder"
                  );
                  return (
                    <div className="my-8 bg-gray-200 rounded-lg shadow-md h-64 flex items-center justify-center">
                      <p className="text-gray-500">Image not available</p>
                    </div>
                  );
                }

                // Create debug URL for troubleshooting
                const debugUrl = createImageDebugUrl(src);

                // Use a try-catch block to handle any rendering errors
                try {
                  return (
                    <div className="my-8 relative">
                      {/* For development, use Next.js Image with fallback */}
                      {process.env.NODE_ENV === "development" ? (
                        <>
                          <Image
                            src={src}
                            alt={altText || "Blog image"}
                            height={imageHeight}
                            width={imageWidth}
                            className="rounded-lg shadow-md"
                            onError={(e) => {
                              console.error(`Failed to load image: ${src}`);
                              e.target.style.display = "none";
                              const fallback = document.createElement("div");
                              fallback.className =
                                "bg-gray-200 rounded-lg shadow-md h-64 flex items-center justify-center";
                              fallback.innerHTML =
                                '<p class="text-gray-500">Image failed to load</p>';
                              e.target.parentNode.appendChild(fallback);
                            }}
                          />
                          <div className="mt-1 text-xs text-gray-500">
                            <details>
                              <summary className="cursor-pointer">
                                Image Debug
                              </summary>
                              <p>Source: {src}</p>
                              <p>
                                Dimensions: {imageWidth}x{imageHeight}
                              </p>
                              <a
                                href={debugUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                Check Image
                              </a>
                            </details>
                          </div>
                        </>
                      ) : (
                        // For production, use a more robust approach with multiple fallbacks
                        <>
                          {/* First try with Next.js Image */}
                          <div className="relative">
                            <img
                              src={src}
                              alt={altText || "Blog image"}
                              className="rounded-lg shadow-md w-full"
                              style={{
                                maxHeight: "800px",
                                objectFit: "contain",
                              }}
                              onError={(e) => {
                                console.error(`Failed to load image: ${src}`);
                                e.target.style.display = "none";

                                // Try with a direct img tag as fallback
                                const fallbackImg =
                                  document.createElement("img");
                                fallbackImg.src = src;
                                fallbackImg.alt = altText || "Blog image";
                                fallbackImg.className =
                                  "rounded-lg shadow-md w-full";
                                fallbackImg.style =
                                  "max-height: 800px; object-fit: contain;";

                                // If that also fails, show a placeholder
                                fallbackImg.onerror = () => {
                                  fallbackImg.style.display = "none";
                                  const fallbackDiv =
                                    document.createElement("div");
                                  fallbackDiv.className =
                                    "bg-gray-200 rounded-lg shadow-md h-64 flex items-center justify-center";
                                  fallbackDiv.innerHTML =
                                    '<p class="text-gray-500">Image failed to load</p>';
                                  e.target.parentNode.appendChild(fallbackDiv);
                                };

                                e.target.parentNode.appendChild(fallbackImg);
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                } catch (error) {
                  console.error(`Error rendering image ${src}:`, error);
                  return (
                    <div className="my-8 bg-gray-200 rounded-lg shadow-md h-64 flex items-center justify-center">
                      <p className="text-gray-500">Error displaying image</p>
                      {process.env.NODE_ENV === "development" && (
                        <p className="text-xs text-red-500 mt-2">
                          Error: {error.message}
                        </p>
                      )}
                    </div>
                  );
                }
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
      console.error("Error rendering with RichText component:", error);

      // Fallback to simple rendering
      return (
        <div className="rich-text-content max-w-3xl mx-auto">
          <div className="prose prose-lg">
            <p className="text-gray-700 mb-6 mt-4">
              The content could not be displayed properly. Please try refreshing
              the page.
            </p>
            <p className="text-sm text-gray-500">
              Error details: {error.message}
            </p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error("Error rendering rich text content:", error);

    // Simplified fallback rendering for all error cases
    return (
      <div className="rich-text-content max-w-3xl mx-auto">
        <div className="prose prose-lg">
          {/* If we have content with children, try to render it directly */}
          {content && content.children && Array.isArray(content.children) ? (
            <>
              {content.children.map((block, index) => {
                if (!block) return null;

                // Handle paragraph blocks
                if (block.type === "paragraph") {
                  return (
                    <p
                      key={index}
                      className="text-gray-700 mb-6 mt-4 leading-relaxed"
                    >
                      {Array.isArray(block.children)
                        ? block.children.map((item, i) => {
                            if (!item) return null;
                            if (item.bold)
                              return <strong key={i}>{item.text || ""}</strong>;
                            if (item.italic)
                              return <em key={i}>{item.text || ""}</em>;
                            if (item.underline)
                              return <u key={i}>{item.text || ""}</u>;
                            if (item.code)
                              return (
                                <code
                                  key={i}
                                  className="bg-gray-100 px-1 py-0.5 rounded"
                                >
                                  {item.text || ""}
                                </code>
                              );
                            return item.text || "";
                          })
                        : "Paragraph content"}
                    </p>
                  );
                }

                // Handle heading blocks
                if (block.type === "heading-one") {
                  return (
                    <h1
                      key={index}
                      className="text-3xl font-bold mt-12 mb-6 text-gray-900"
                    >
                      {Array.isArray(block.children)
                        ? block.children
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
                      className="text-2xl font-bold mt-10 mb-5 text-gray-900"
                    >
                      {Array.isArray(block.children)
                        ? block.children
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
                      className="text-xl font-bold mt-8 mb-4 text-gray-900"
                    >
                      {Array.isArray(block.children)
                        ? block.children
                            .map((child) => child.text || "")
                            .join("")
                        : "Heading"}
                    </h3>
                  );
                }

                return null;
              })}
            </>
          ) : (
            // If we can't render the content, show an error message
            <>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <p className="text-red-600 font-medium">
                  Error rendering content
                </p>
                <p className="text-red-500 text-sm mt-1">{error.message}</p>
              </div>
              <p className="text-gray-700">
                We encountered an error while trying to display this content.
                Please try refreshing the page.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
};

export default RichTextRenderer;
