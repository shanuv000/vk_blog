import React, { useState, useEffect, useRef } from "react";
import { InstagramEmbed as ReactInstagramEmbed } from "react-social-media-embed";

const InstagramEmbed = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  // Extract Instagram URL if it's wrapped in an anchor tag or other HTML
  const extractInstagramUrl = (inputUrl) => {
    if (!inputUrl) return null;

    // If it's already a clean URL, just return it
    if (
      typeof inputUrl === "string" &&
      (inputUrl.includes("instagram.com") || inputUrl.includes("instagr.am"))
    ) {
      return inputUrl.trim();
    }

    // Try to extract URL from HTML
    try {
      // Check for href attribute in an anchor tag
      const hrefMatch = inputUrl.match(
        /href=["'](https?:\/\/(www\.)?(instagram|instagr)\.(com|am)[^"']+)["']/i
      );
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }

      // Check for a URL pattern in the text
      const urlMatch = inputUrl.match(
        /(https?:\/\/(www\.)?(instagram|instagr)\.(com|am)[^\s"'<>]+)/i
      );
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
    } catch (e) {
      console.error("Error extracting Instagram URL:", e);
    }

    return inputUrl; // Return original if extraction failed
  };

  // Clean and validate the Instagram URL
  const cleanUrl = extractInstagramUrl(url);

  // Check if URL is a valid Instagram URL
  const isValidInstagramUrl =
    cleanUrl &&
    (cleanUrl.includes("instagram.com") || cleanUrl.includes("instagr.am"));

  // Skip if no URL or invalid format
  if (!isValidInstagramUrl) {
    return (
      <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">Invalid Instagram URL: {url}</p>
      </div>
    );
  }

  // Direct embed fallback using iframe
  const directEmbedFallback = () => {
    try {
      // Create an Instagram embed iframe
      const iframe = document.createElement("iframe");

      // Extract post ID from URL
      let postId = "";
      try {
        const match = cleanUrl.match(/instagram\.com\/p\/([^\/\?]+)/);
        if (match && match[1]) {
          postId = match[1];
        }
      } catch (e) {
        console.error("Error extracting Instagram post ID:", e);
      }

      iframe.setAttribute(
        "src",
        `https://www.instagram.com/p/${postId}/embed/`
      );
      iframe.setAttribute("width", "100%");
      iframe.setAttribute("height", "500px");
      iframe.setAttribute("frameBorder", "0");
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("allowTransparency", "true");

      // Clear any existing content and append the iframe
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(iframe);
        setLoading(false);
      }
    } catch (e) {
      console.error("Error creating Instagram fallback:", e);
      setError(true);
    }
  };

  // Set a timeout to handle cases where the embed doesn't load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        // Instagram embed failed to load, try fallback
        directEmbedFallback();
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeoutId);
  }, [cleanUrl, loading]);

  // If we've hit an error after timeout and fallback
  if (error) {
    return (
      <div className="my-6 p-4 border border-red-100 rounded-lg bg-red-50 text-center">
        <p className="text-red-500">
          Could not load Instagram post. It may have been deleted or is private.
        </p>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="instagram-embed-container flex justify-center items-center">
        <div style={{ width: "100%", maxWidth: "550px" }} ref={containerRef}>
          {/* Method 1: Using react-social-media-embed */}
          <ReactInstagramEmbed
            url={cleanUrl}
            width="100%"
            captioned={true}
            onLoad={() => setLoading(false)}
            onError={() => {
              console.error("Instagram embed error, trying fallback");
              directEmbedFallback();
            }}
            placeholder={
              <div className="animate-pulse flex flex-col items-center justify-center p-4 w-full min-h-[450px] border border-gray-200 rounded-lg">
                <div className="h-10 bg-gray-200 rounded-full w-10 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
                <div className="mt-4 text-blue-400 text-sm">
                  Loading Instagram post...
                </div>
              </div>
            }
          />

          {/* Fallback link that appears if the post doesn't load */}
          {loading && (
            <div
              className="mt-4 text-center opacity-0 animate-fadeIn"
              style={{ animationDelay: "4s", animationFillMode: "forwards" }}
            >
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                If the post doesn't load, click here to view it on Instagram
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstagramEmbed;
