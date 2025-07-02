import React, { useState, useEffect, useRef } from "react";
import { FacebookEmbed as ReactFacebookEmbed } from "react-social-media-embed";

const FacebookEmbed = ({ url }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  // Extract Facebook URL if it's wrapped in an anchor tag or other HTML
  const extractFacebookUrl = (inputUrl) => {
    if (!inputUrl) return null;

    // If it's already a clean URL, just return it
    if (
      typeof inputUrl === "string" &&
      (inputUrl.includes("facebook.com") ||
        inputUrl.includes("fb.com") ||
        inputUrl.includes("fb.watch"))
    ) {
      return inputUrl.trim();
    }

    // Try to extract URL from HTML
    try {
      // Check for href attribute in an anchor tag
      const hrefMatch = inputUrl.match(
        /href=["'](https?:\/\/(www\.)?(facebook|fb)\.(com|watch)[^"']+)["']/i
      );
      if (hrefMatch && hrefMatch[1]) {
        return hrefMatch[1];
      }

      // Check for a URL pattern in the text
      const urlMatch = inputUrl.match(
        /(https?:\/\/(www\.)?(facebook|fb)\.(com|watch)[^\s"'<>]+)/i
      );
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1];
      }
    } catch (e) {
      console.error("Error extracting Facebook URL:", e);
    }

    return inputUrl; // Return original if extraction failed
  };

  // Clean and validate the Facebook URL
  const cleanUrl = extractFacebookUrl(url);

  // Check if URL is a valid Facebook URL
  const isValidFacebookUrl =
    cleanUrl &&
    (cleanUrl.includes("facebook.com") ||
      cleanUrl.includes("fb.com") ||
      cleanUrl.includes("fb.watch"));

  // Skip if no URL or invalid format
  if (!isValidFacebookUrl) {
    if (process.env.NODE_ENV === "development") {
      console.error("FacebookEmbed: Invalid URL", {
        original: url,
        cleaned: cleanUrl,
        isValid: isValidFacebookUrl,
      });
    }
    return (
      <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">Invalid Facebook URL: {url}</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-gray-400 mt-2">
            Expected URL containing facebook.com, fb.com, or fb.watch
          </p>
        )}
      </div>
    );
  }

  // Direct embed fallback using iframe
  const directEmbedFallback = () => {
    try {
      // Create a Facebook embed iframe
      const iframe = document.createElement("iframe");
      iframe.setAttribute(
        "src",
        `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(
          cleanUrl
        )}&width=500`
      );
      iframe.setAttribute("width", "100%");
      iframe.setAttribute("height", "500px");
      iframe.setAttribute("frameBorder", "0");
      iframe.setAttribute("allowTransparency", "true");
      iframe.setAttribute("allow", "encrypted-media");
      iframe.style.overflow = "hidden";

      // Clear any existing content and append the iframe
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(iframe);
        setLoading(false);
      }
    } catch (e) {
      console.error("Error creating Facebook fallback:", e);
      setError(true);
    }
  };

  // Set a timeout to handle cases where the embed doesn't load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        // Facebook embed failed to load, try fallback
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
          Could not load Facebook post. It may have been deleted or is private.
        </p>
        <a
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          View on Facebook
        </a>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="facebook-embed-container flex justify-center items-center">
        <div style={{ width: "100%", maxWidth: "550px" }} ref={containerRef}>
          {/* Method 1: Using react-social-media-embed */}
          <ReactFacebookEmbed
            url={cleanUrl}
            width="100%"
            onLoad={() => setLoading(false)}
            onError={() => {
              console.error("Facebook embed error, trying fallback");
              directEmbedFallback();
            }}
            placeholder={
              <div className="animate-pulse flex flex-col items-center justify-center p-4 w-full min-h-[300px] border border-gray-200 rounded-lg">
                <div className="h-10 bg-gray-200 rounded-full w-10 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded w-full mb-2"></div>
                <div className="mt-4 text-blue-400 text-sm">
                  Loading Facebook post...
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
                If the post doesn't load, click here to view it on Facebook
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacebookEmbed;
