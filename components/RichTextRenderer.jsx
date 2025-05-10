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
              // Check if children contains ONLY a numeric tweet ID
              const childText = children?.toString() || "";
              const trimmedText = childText.trim();

              // Only treat as tweet ID if it's exactly a number and nothing else
              const isExactlyTweetId =
                /^\d+$/.test(trimmedText) && trimmedText.length > 8;

              console.log(
                "Blockquote content:",
                trimmedText,
                "Is tweet ID:",
                isExactlyTweetId
              );

              if (isExactlyTweetId) {
                return (
                  <div className="my-16 mx-auto max-w-4xl">
                    <TwitterEmbed tweetId={trimmedText} />
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
                // Check if children contains ONLY a numeric tweet ID
                const childText = children?.toString() || "";
                const trimmedText = childText.trim();

                // Only treat as tweet ID if it's exactly a number and nothing else
                const isExactlyTweetId =
                  /^\d+$/.test(trimmedText) && trimmedText.length > 8;

                console.log(
                  "SocialEmbed content:",
                  trimmedText,
                  "Is tweet ID:",
                  isExactlyTweetId
                );

                if (isExactlyTweetId) {
                  return (
                    <div className="my-16 mx-auto max-w-4xl">
                      <TwitterEmbed tweetId={trimmedText} />
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
