import React, { useState, useEffect } from "react";
import { RichText } from "@graphcms/rich-text-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  atomDark,
  dracula,
  materialDark,
} from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiCopy, FiCheck } from "react-icons/fi";
import TwitterEmbed from "./TwitterEmbed";
import FacebookEmbed from "./FacebookEmbed";
import InstagramEmbed from "./InstagramEmbed";
import {
  extractImageDimensions,
  createImageDebugUrl,
} from "../utils/imageUtils";

// Code block component with copy functionality
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Process and clean up the code content
  const processCodeContent = (rawCode) => {
    if (!rawCode) return "// No code content available";

    // Ensure code is a string
    let codeStr =
      typeof rawCode === "string"
        ? rawCode
        : rawCode?.toString
        ? rawCode.toString()
        : "// No code content available";

    // Clean up common issues in code blocks from CMS
    codeStr = codeStr
      // Replace HTML entities
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Fix common Hygraph issues
      .replace(/\u00A0/g, " ") // Replace non-breaking spaces with regular spaces
      .replace(/\u2028/g, "\n") // Replace line separator with newline
      .replace(/\u2029/g, "\n\n") // Replace paragraph separator with double newline
      // Remove extra newlines at start and end
      .trim();

    // If code is still empty or just whitespace, return a message
    if (!codeStr.trim()) {
      return "// No code content available";
    }

    return codeStr;
  };

  const codeContent = processCodeContent(code);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent).then(() => {
      setCopied(true);
    });
  };

  // Normalize language name
  const normalizedLanguage = language?.toLowerCase() || "javascript";

  // Map common language aliases
  const languageMap = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    html: "markup",
    css: "css",
    json: "json",
    md: "markdown",
    jsx: "jsx",
    tsx: "tsx",
    php: "php",
    go: "go",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "csharp",
    rust: "rust",
    swift: "swift",
    kotlin: "kotlin",
    sql: "sql",
  };

  const mappedLanguage = languageMap[normalizedLanguage] || normalizedLanguage;

  // Debug log in development only
  if (process.env.NODE_ENV === "development") {
    console.log("Code block content:", {
      language: mappedLanguage,
      codeLength: codeContent?.length,
      codePreview: codeContent?.substring(0, 50),
    });
  }

  return (
    <div className="relative my-8 rounded-lg overflow-hidden bg-[#1e1e1e]">
      {/* Language badge */}
      <div className="absolute top-0 right-0 bg-gray-800 text-xs text-gray-300 px-3 py-1 rounded-bl-lg font-mono z-10">
        {mappedLanguage}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-0 right-16 bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-bl-lg transition-colors z-10"
        aria-label={copied ? "Copied!" : "Copy code"}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <FiCheck className="w-4 h-4" />
        ) : (
          <FiCopy className="w-4 h-4" />
        )}
      </button>

      {codeContent && codeContent.trim() !== "" ? (
        <SyntaxHighlighter
          language={mappedLanguage}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
            fontSize: "0.9rem",
            lineHeight: 1.5,
            padding: "1.5rem 1rem",
            fontFamily:
              '"JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
            backgroundColor: "#1e1e1e", // Ensure background color is set
            color: "#d4d4d4", // Ensure text color is visible
          }}
          lineNumberStyle={{
            minWidth: "2.5em",
            paddingRight: "1em",
            color: "rgba(156, 163, 175, 0.5)",
            textAlign: "right",
            userSelect: "none",
          }}
          codeTagProps={{
            style: {
              color: "#d4d4d4", // Ensure text color is visible
              fontSize: "0.9rem",
              fontFamily:
                '"JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
            },
          }}
          // Force re-render when code changes to avoid stale content
          key={`${mappedLanguage}-${codeContent.length}-${Date.now()}`}
          PreTag={({ children, ...props }) => (
            <pre {...props} className="prism-code" style={{ margin: 0 }}>
              {children}
            </pre>
          )}
        >
          {codeContent}
        </SyntaxHighlighter>
      ) : (
        <div className="p-6 text-gray-300 font-mono text-sm">
          // No code content available
        </div>
      )}
    </div>
  );
};

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
                                className="bg-gray-100 text-red-600 px-2 py-0.5 rounded font-mono text-sm"
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

                // No debugging in production

                // No detailed debugging in production
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
                  const findTweetId = (element, depth = 0) => {
                    // Prevent infinite recursion by limiting depth
                    if (!element || depth > 10) return null;

                    // If it's a string and looks like a tweet ID
                    if (typeof element === "string") {
                      const cleaned = element.trim();
                      if (/^\d+$/.test(cleaned) && cleaned.length > 8) {
                        return cleaned;
                      }
                      return null; // Return null for strings that aren't tweet IDs
                    }

                    // If it's a React element with props
                    if (React.isValidElement(element) && element.props) {
                      // Check children
                      if (element.props.children) {
                        const childResult = findTweetId(
                          element.props.children,
                          depth + 1
                        );
                        if (childResult) return childResult;
                      }

                      // Check other props (limit to common text props)
                      const textProps = [
                        "title",
                        "alt",
                        "label",
                        "value",
                        "placeholder",
                      ];
                      for (const key of textProps) {
                        if (key !== "children" && element.props[key]) {
                          const propResult = findTweetId(
                            element.props[key],
                            depth + 1
                          );
                          if (propResult) return propResult;
                        }
                      }

                      return null; // Return null if no tweet ID found in props
                    }

                    // If it's an array
                    if (Array.isArray(element)) {
                      for (const item of element) {
                        const arrayResult = findTweetId(item, depth + 1);
                        if (arrayResult) return arrayResult;
                      }
                      return null; // Return null if no tweet ID found in array
                    }

                    // If it's a simple object (not a React element, DOM node, etc.)
                    if (
                      element &&
                      typeof element === "object" &&
                      !React.isValidElement(element) &&
                      !(element instanceof Node) &&
                      !element.$$typeof
                    ) {
                      // Skip React elements and DOM nodes

                      // Only check a few common properties that might contain text
                      const textKeys = [
                        "text",
                        "content",
                        "value",
                        "label",
                        "title",
                        "description",
                      ];
                      for (const key of textKeys) {
                        if (element[key]) {
                          const objResult = findTweetId(
                            element[key],
                            depth + 1
                          );
                          if (objResult) return objResult;
                        }
                      }
                    }

                    return null;
                  };

                  // Try to find a tweet ID in the children structure
                  const foundTweetId = findTweetId(children);
                  if (foundTweetId) {
                    tweetId = foundTweetId;
                    isExactlyTweetId = true;
                    // Tweet ID found
                  }
                }
              } catch (error) {
                console.error("Error checking if text is a tweet ID:", error);
                isExactlyTweetId = false;
              }

              // No debugging logs in production

              if (isExactlyTweetId && (tweetId || trimmedText)) {
                // Use the found tweet ID or fall back to trimmedText
                const finalTweetId = tweetId || trimmedText;

                // Log the tweet ID for debugging
                console.log(`RichTextRenderer found tweet ID: ${finalTweetId}`);

                // Render tweet with the found ID
                return (
                  <div
                    className="my-16 mx-auto max-w-4xl"
                    data-embed-type="twitter"
                    data-embed-processed="true"
                  >
                    <TwitterEmbed tweetId={finalTweetId} />
                    {/* Add a direct Twitter embed as fallback */}
                    <div className="twitter-fallback mt-2">
                      <blockquote className="twitter-tweet" data-dnt="true">
                        <a
                          href={`https://twitter.com/i/status/${finalTweetId}`}
                        ></a>
                      </blockquote>
                      <script
                        async
                        src="https://platform.twitter.com/widgets.js"
                      ></script>
                    </div>
                  </div>
                );
              }

              // Check for social media URLs in the blockquote
              // First, check if there's a direct URL in the text
              let facebookUrl = null;
              let instagramUrl = null;

              // Check if the trimmed text directly contains a social media URL
              if (trimmedText) {
                if (
                  trimmedText.includes("facebook.com") ||
                  trimmedText.includes("fb.com") ||
                  trimmedText.includes("fb.watch")
                ) {
                  facebookUrl = trimmedText;
                } else if (
                  trimmedText.includes("instagram.com") ||
                  trimmedText.includes("instagr.am")
                ) {
                  instagramUrl = trimmedText;
                }
              }

              // If no direct URL found, check if there's an anchor tag with a social media URL
              if (
                !facebookUrl &&
                !instagramUrl &&
                React.isValidElement(children)
              ) {
                // Function to recursively search for anchor tags with social media URLs
                const findSocialMediaUrl = (element) => {
                  if (!element)
                    return { facebookUrl: null, instagramUrl: null };

                  // If it's a React element
                  if (React.isValidElement(element)) {
                    // Check if it's an anchor tag with href
                    if (
                      element.type === "a" &&
                      element.props &&
                      element.props.href
                    ) {
                      const href = element.props.href;
                      if (
                        href.includes("facebook.com") ||
                        href.includes("fb.com") ||
                        href.includes("fb.watch")
                      ) {
                        return { facebookUrl: href, instagramUrl: null };
                      } else if (
                        href.includes("instagram.com") ||
                        href.includes("instagr.am")
                      ) {
                        return { facebookUrl: null, instagramUrl: href };
                      }
                    }

                    // Check children recursively
                    if (element.props && element.props.children) {
                      return findSocialMediaUrl(element.props.children);
                    }
                  }

                  // If it's an array, check each item
                  if (Array.isArray(element)) {
                    for (const child of element) {
                      const result = findSocialMediaUrl(child);
                      if (result.facebookUrl || result.instagramUrl) {
                        return result;
                      }
                    }
                  }

                  return { facebookUrl: null, instagramUrl: null };
                };

                // Search for social media URLs in the children
                const { facebookUrl: fbUrl, instagramUrl: igUrl } =
                  findSocialMediaUrl(children);
                facebookUrl = fbUrl;
                instagramUrl = igUrl;
              }

              // Render Facebook embed if a Facebook URL was found
              if (facebookUrl) {
                return (
                  <div
                    className="my-16 mx-auto max-w-4xl"
                    data-embed-type="facebook"
                  >
                    <FacebookEmbed url={facebookUrl} />
                  </div>
                );
              }

              // Render Instagram embed if an Instagram URL was found
              if (instagramUrl) {
                return (
                  <div
                    className="my-16 mx-auto max-w-4xl"
                    data-embed-type="instagram"
                  >
                    <InstagramEmbed url={instagramUrl} />
                  </div>
                );
              }

              // Regular blockquote rendering for non-embed content
              // Add a special class for the SocialMediaEmbedder to target
              // Do NOT mark this blockquote as processed so SocialMediaEmbedder can handle it
              return (
                <blockquote className="border-l-4 border-primary pl-4 py-1 my-6 text-gray-700 italic rich-text-blockquote">
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
              // According to Hygraph docs, code blocks follow a specific structure
              let language = "javascript";
              let code = "";

              try {
                // Debug the structure in development
                if (process.env.NODE_ENV === "development") {
                  console.log("Code block structure:", children);
                }

                // In Hygraph, code blocks are typically rendered as pre > code elements
                // The language is in the className of the code element
                if (children && React.isValidElement(children)) {
                  // Extract code directly from children if it's a string
                  if (typeof children === "string") {
                    code = children;
                  }
                  // Handle pre > code structure
                  else if (children.props) {
                    // Try to get language from className
                    if (children.props.className) {
                      const langMatch =
                        children.props.className.match(/language-(\w+)/);
                      if (langMatch && langMatch[1]) {
                        language = langMatch[1];
                      }
                    }

                    // Extract code content
                    if (typeof children.props.children === "string") {
                      // Direct string content
                      code = children.props.children;
                    } else if (
                      children.props.children &&
                      React.isValidElement(children.props.children)
                    ) {
                      // Handle pre > code structure
                      const codeElement = children.props.children;

                      // Try to get language from code element
                      if (codeElement.props && codeElement.props.className) {
                        const langMatch =
                          codeElement.props.className.match(/language-(\w+)/);
                        if (langMatch && langMatch[1]) {
                          language = langMatch[1];
                        }
                      }

                      // Get the actual code content
                      if (typeof codeElement.props.children === "string") {
                        code = codeElement.props.children;
                      } else if (Array.isArray(codeElement.props.children)) {
                        code = codeElement.props.children
                          .map((child) =>
                            typeof child === "string" ? child : ""
                          )
                          .join("");
                      }
                    } else if (Array.isArray(children.props.children)) {
                      // Handle array of children
                      code = children.props.children
                        .map((child) => {
                          if (typeof child === "string") return child;
                          if (!child || !child.props) return "";

                          // Check if this child has the language class
                          if (
                            child.props.className &&
                            child.props.className.match(/language-(\w+)/)
                          ) {
                            const langMatch =
                              child.props.className.match(/language-(\w+)/);
                            if (langMatch && langMatch[1]) {
                              language = langMatch[1];
                            }
                          }

                          // Extract text content
                          if (typeof child.props.children === "string") {
                            return child.props.children;
                          } else if (Array.isArray(child.props.children)) {
                            return child.props.children
                              .map((c) => (typeof c === "string" ? c : ""))
                              .join("");
                          }
                          return "";
                        })
                        .join("");
                    }
                  }
                }

                // Handle Slate.js node structure (used by Hygraph)
                if (!code && children && typeof children === "object") {
                  // Try to access the Slate node structure
                  const extractFromSlateNode = (node) => {
                    if (!node) return "";

                    // Direct text content
                    if (typeof node === "string") return node;

                    // Text node with text property
                    if (node.text) return node.text;

                    // Node with children
                    if (node.children && Array.isArray(node.children)) {
                      return node.children.map(extractFromSlateNode).join("");
                    }

                    // Node with props and children
                    if (node.props && node.props.children) {
                      if (typeof node.props.children === "string") {
                        return node.props.children;
                      } else if (Array.isArray(node.props.children)) {
                        return node.props.children
                          .map((child) => extractFromSlateNode(child))
                          .join("");
                      } else if (
                        node.props.children &&
                        typeof node.props.children === "object"
                      ) {
                        return extractFromSlateNode(node.props.children);
                      }
                    }

                    return "";
                  };

                  code = extractFromSlateNode(children);
                }

                // Log the extracted code in development
                if (process.env.NODE_ENV === "development") {
                  console.log("Extracted code:", {
                    language,
                    codePreview: code
                      ? code.substring(0, 100) + "..."
                      : "No code extracted",
                    codeLength: code?.length || 0,
                  });
                }
              } catch (error) {
                console.error("Error extracting code content:", error);
                code = "// Error extracting code content: " + error.message;
              }

              // Provide a default code snippet if nothing was extracted
              if (!code || code.trim() === "") {
                code = "// No code content could be extracted from this block";
              }

              return <CodeBlock language={language} code={code} />;
            },
            code: ({ children }) => {
              // Extract the text content from the children
              let codeText = "";

              try {
                if (typeof children === "string") {
                  codeText = children;
                } else if (
                  children &&
                  children.props &&
                  children.props.content
                ) {
                  codeText = children.props.content;
                } else if (
                  children &&
                  children.props &&
                  children.props.children
                ) {
                  if (typeof children.props.children === "string") {
                    codeText = children.props.children;
                  } else if (Array.isArray(children.props.children)) {
                    codeText = children.props.children
                      .map((child) => (typeof child === "string" ? child : ""))
                      .join("");
                  }
                } else if (children && children.text) {
                  codeText = children.text;
                } else if (
                  children &&
                  children.toString &&
                  typeof children.toString === "function"
                ) {
                  const str = children.toString();
                  if (str !== "[object Object]") {
                    codeText = str;
                  }
                }

                // Clean up the code text
                codeText = codeText
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&amp;/g, "&")
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")
                  .replace(/\u00A0/g, " ")
                  .trim();

                if (!codeText) {
                  codeText = "code";
                }
              } catch (error) {
                console.error("Error extracting inline code content:", error);
                codeText = "code";
              }

              // Inline code styling
              return (
                <code className="bg-gray-100 text-red-600 px-2 py-0.5 rounded font-mono text-sm">
                  {codeText}
                </code>
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
                      // Tweet ID found in SocialEmbed
                    }
                  }
                } catch (error) {
                  console.error(
                    "Error checking if SocialEmbed text is a tweet ID:",
                    error
                  );
                  isExactlyTweetId = false;
                }

                // No debugging logs in production

                if (isExactlyTweetId && (tweetId || trimmedText)) {
                  // Use the found tweet ID or fall back to trimmedText
                  const finalTweetId = tweetId || trimmedText;

                  // Render tweet with the found ID

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
              Facebook: ({ nodeId, url, children }) => {
                // First try to use the provided URL
                let finalUrl = url;

                // If no URL provided or it's not valid, try to extract from children
                if (!finalUrl || !finalUrl.includes("facebook.com")) {
                  // Function to recursively search for Facebook URLs in children
                  const findFacebookUrl = (element) => {
                    if (!element) return null;

                    // If it's a string, check if it contains a Facebook URL
                    if (typeof element === "string") {
                      if (
                        element.includes("facebook.com") ||
                        element.includes("fb.com") ||
                        element.includes("fb.watch")
                      ) {
                        return element;
                      }
                      return null;
                    }

                    // If it's a React element
                    if (React.isValidElement(element)) {
                      // Check if it's an anchor tag with href
                      if (
                        element.type === "a" &&
                        element.props &&
                        element.props.href
                      ) {
                        const href = element.props.href;
                        if (
                          href.includes("facebook.com") ||
                          href.includes("fb.com") ||
                          href.includes("fb.watch")
                        ) {
                          return href;
                        }
                      }

                      // Check children recursively
                      if (element.props && element.props.children) {
                        return findFacebookUrl(element.props.children);
                      }
                    }

                    // If it's an array, check each item
                    if (Array.isArray(element)) {
                      for (const child of element) {
                        const result = findFacebookUrl(child);
                        if (result) return result;
                      }
                    }

                    return null;
                  };

                  // Try to find a Facebook URL in children
                  finalUrl = findFacebookUrl(children);
                }

                if (!finalUrl) {
                  return <p>Facebook embed (URL not available)</p>;
                }

                // Clean and validate the Facebook URL
                const cleanUrl = finalUrl.trim();

                // Check if URL is a valid Facebook URL
                const isValidFacebookUrl =
                  cleanUrl &&
                  (cleanUrl.includes("facebook.com") ||
                    cleanUrl.includes("fb.com") ||
                    cleanUrl.includes("fb.watch"));

                if (!isValidFacebookUrl) {
                  return <p>Invalid Facebook URL: {cleanUrl}</p>;
                }

                return (
                  <div className="my-16 mx-auto max-w-4xl">
                    <FacebookEmbed url={cleanUrl} />
                  </div>
                );
              },
              Instagram: ({ nodeId, url, children }) => {
                // First try to use the provided URL
                let finalUrl = url;

                // If no URL provided or it's not valid, try to extract from children
                if (!finalUrl || !finalUrl.includes("instagram.com")) {
                  // Function to recursively search for Instagram URLs in children
                  const findInstagramUrl = (element) => {
                    if (!element) return null;

                    // If it's a string, check if it contains an Instagram URL
                    if (typeof element === "string") {
                      if (
                        element.includes("instagram.com") ||
                        element.includes("instagr.am")
                      ) {
                        return element;
                      }
                      return null;
                    }

                    // If it's a React element
                    if (React.isValidElement(element)) {
                      // Check if it's an anchor tag with href
                      if (
                        element.type === "a" &&
                        element.props &&
                        element.props.href
                      ) {
                        const href = element.props.href;
                        if (
                          href.includes("instagram.com") ||
                          href.includes("instagr.am")
                        ) {
                          return href;
                        }
                      }

                      // Check children recursively
                      if (element.props && element.props.children) {
                        return findInstagramUrl(element.props.children);
                      }
                    }

                    // If it's an array, check each item
                    if (Array.isArray(element)) {
                      for (const child of element) {
                        const result = findInstagramUrl(child);
                        if (result) return result;
                      }
                    }

                    return null;
                  };

                  // Try to find an Instagram URL in children
                  finalUrl = findInstagramUrl(children);
                }

                if (!finalUrl) {
                  return <p>Instagram embed (URL not available)</p>;
                }

                // Clean and validate the Instagram URL
                const cleanUrl = finalUrl.trim();

                // Check if URL is a valid Instagram URL
                const isValidInstagramUrl =
                  cleanUrl &&
                  (cleanUrl.includes("instagram.com") ||
                    cleanUrl.includes("instagr.am"));

                if (!isValidInstagramUrl) {
                  return <p>Invalid Instagram URL: {cleanUrl}</p>;
                }

                return (
                  <div className="my-16 mx-auto max-w-4xl">
                    <InstagramEmbed url={cleanUrl} />
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
