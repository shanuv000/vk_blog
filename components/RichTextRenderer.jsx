import React from "react";
import { RichText } from "@graphcms/rich-text-react-renderer";
import Image from "next/legacy/image";
import Link from "next/link";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FaTwitter, FaYoutube } from "react-icons/fa";
import { motion } from "framer-motion";

// Default fallback image
const FALLBACK_IMAGE = "/iconified/logo4.ico";

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

  // Create a map of references for easy lookup
  const referenceMap = {};
  if (references && references.length > 0) {
    references.forEach((reference) => {
      if (reference.id) {
        referenceMap[reference.id] = reference;
      }
    });
  }

  return (
    <div className="rich-text-content max-w-3xl mx-auto">
      <RichText
        content={content}
        references={referenceMap}
        renderers={{
          h1: ({ children }) => (
            <motion.h1
              className="text-3xl font-bold mt-12 mb-6 text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.h1>
          ),
          h2: ({ children }) => (
            <motion.h2
              className="text-2xl font-bold mt-10 mb-5 text-gray-900"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {children}
            </motion.h2>
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
              href={href}
              target={openInNewTab ? "_blank" : "_self"}
              className="text-red-500 hover:text-red-700 underline transition-colors"
              rel={openInNewTab ? "noopener noreferrer" : ""}
            >
              {children}
            </Link>
          ),
          img: ({ src, altText, height, width }) => (
            <div className="my-8">
              <Image
                src={src}
                alt={altText || "Blog image"}
                height={height || 600}
                width={width || 1200}
                className="rounded-lg shadow-md"
                layout="responsive"
                objectFit="cover"
                unoptimized={src && src.includes("external-domain")}
                onError={(e) => {
                  console.error("Image load error, using fallback");
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>
          ),
          code_block: ({ children }) => {
            // Extract language and code
            const language =
              children.props?.className?.replace("language-", "") ||
              "javascript";
            const code = children.props?.children || "";

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
          code: ({ children }) => (
            <code className="bg-gray-100 text-red-500 font-mono rounded px-2 py-1">
              {children}
            </code>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 text-gray-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 text-gray-700">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-2">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-red-500 pl-4 italic my-6 py-2 text-gray-600">
              {children}
            </blockquote>
          ),
          // Custom embeds for Twitter and YouTube
          embeds: {
            Twitter: ({ nodeId, url }) => {
              // Extract tweet ID from URL
              const tweetId = url.split("/").pop();
              return (
                <div className="my-6 flex items-center justify-center">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <FaTwitter className="mr-2" size={24} />
                    <span>View Tweet</span>
                  </a>
                </div>
              );
            },
            YouTube: ({ nodeId, url }) => {
              // Extract video ID from URL
              let videoId;
              try {
                videoId = new URL(url).searchParams.get("v");
                if (!videoId) {
                  // Handle youtu.be format
                  const pathname = new URL(url).pathname;
                  videoId = pathname.split("/").pop();
                }
              } catch (error) {
                console.error("Failed to parse YouTube URL:", error);
                return (
                  <div className="my-6 flex items-center justify-center">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaYoutube className="mr-2" size={24} />
                      <span>Watch on YouTube</span>
                    </a>
                  </div>
                );
              }

              return (
                <div className="aspect-w-16 aspect-h-9 my-8">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="rounded-lg shadow-md w-full h-full"
                  />
                </div>
              );
            },
          },
        }}
      />
    </div>
  );
};

export default RichTextRenderer;
