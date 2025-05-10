import React, { useState, useEffect, useRef } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";

const TwitterEmbed = ({ tweetId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);

  // Clean and validate the tweet ID
  const cleanTweetId = tweetId ? tweetId.toString().trim() : "";
  const isValidTweetId =
    cleanTweetId && /^\d+$/.test(cleanTweetId) && cleanTweetId.length > 8;

  // No debugging logs in production

  // Skip if no tweet ID or invalid format
  if (!isValidTweetId) {
    // Invalid tweet ID
    return (
      <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">Invalid tweet ID: {tweetId}</p>
      </div>
    );
  }

  // We already have cleanTweetId defined above

  // Direct embed fallback using Twitter's oEmbed API
  const directEmbedFallback = () => {
    // Using direct embed fallback

    // Create an iframe element
    const iframe = document.createElement("iframe");
    iframe.setAttribute(
      "src",
      `https://platform.twitter.com/embed/Tweet.html?id=${cleanTweetId}`
    );
    iframe.setAttribute("width", "100%");
    iframe.setAttribute("height", "300px");
    iframe.setAttribute("frameBorder", "0");
    iframe.setAttribute("allowTransparency", "true");
    iframe.setAttribute("allow", "encrypted-media");

    // Clear any existing content and append the iframe
    if (iframeRef.current) {
      iframeRef.current.innerHTML = "";
      iframeRef.current.appendChild(iframe);
      setLoading(false);
    }
  };

  // Set a timeout to handle cases where the tweet doesn't load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        // Tweet failed to load, try fallback
        directEmbedFallback();
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timeoutId);
  }, [cleanTweetId, loading]);

  // If we've hit an error after timeout and fallback
  if (error) {
    return (
      <div className="my-6 p-4 border border-red-100 rounded-lg bg-red-50 text-center">
        <p className="text-red-500">
          Could not load tweet {cleanTweetId}. It may have been deleted or is
          private.
        </p>
        <a
          href={`https://twitter.com/i/status/${cleanTweetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          View on Twitter
        </a>
      </div>
    );
  }

  // Try both embedding methods for better chances of success
  return (
    <div className="my-6">
      <div className="twitter-tweet-container flex justify-center items-center">
        <div style={{ width: "100%", maxWidth: "550px" }}>
          {/* Method 1: Using react-twitter-embed */}
          <TwitterTweetEmbed
            tweetId={cleanTweetId}
            options={{
              theme: "light",
              align: "center",
              dnt: true,
              width: "550",
            }}
            placeholder={
              <div className="animate-pulse flex flex-col items-center justify-center p-4 w-full min-h-[200px]">
                <div className="h-10 bg-gray-200 rounded-full w-10 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-4 text-blue-400 text-sm">
                  Loading tweet {cleanTweetId}...
                </div>
              </div>
            }
            onLoad={() => {
              setLoading(false);
            }}
          />

          {/* Method 2: Direct iframe fallback */}
          <div ref={iframeRef} className={`${loading ? "hidden" : ""}`}></div>

          {/* Method 3: Native Twitter embed - only shown if primary method fails */}
          {loading && (
            <div className={`mt-4 ${loading ? "block" : "hidden"}`}>
              <blockquote
                className="twitter-tweet"
                data-dnt="true"
                data-theme="light"
              >
                <a href={`https://twitter.com/i/status/${cleanTweetId}`}></a>
              </blockquote>
              <script
                async
                src="https://platform.twitter.com/widgets.js"
              ></script>
            </div>
          )}

          {/* Fallback link that appears if the tweet doesn't load */}
          {loading && (
            <div
              className="mt-4 text-center opacity-0 animate-fadeIn"
              style={{ animationDelay: "4s", animationFillMode: "forwards" }}
            >
              <a
                href={`https://twitter.com/i/status/${cleanTweetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                If the tweet doesn't load, click here to view it on Twitter
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwitterEmbed;
