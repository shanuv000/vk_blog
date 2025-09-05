import React, { useState, useEffect, useRef, useCallback } from "react";
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

  // Fix for deprecation warning
  useEffect(() => {
    // Check if our fix is already applied to avoid duplicate declarations
    if (window._twitterEmbedFixApplied) {
      return; // Fix already applied, no need to do it again
    }

    // Add a script to fix the DOMSubtreeModified deprecation warning
    const fixScript = document.createElement("script");
    fixScript.id = "twitter-embed-fix";
    fixScript.textContent = `
      // Only apply the fix if it hasn't been applied yet
      if (!window._twitterEmbedFixApplied) {
        // Override the deprecated DOMSubtreeModified event listener
        window._originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          if (type === 'DOMSubtreeModified') {
            // Use MutationObserver instead
            const observer = new MutationObserver((mutations) => {
              if (mutations[0] && mutations[0].target) {
                listener({ target: mutations[0].target });
              }
            });
            observer.observe(this, { childList: true, subtree: true });
            return observer;
          }
          return window._originalAddEventListener.call(this, type, listener, options);
        };

        // Mark as applied
        window._twitterEmbedFixApplied = true;
      }
    `;

    // Only add the script once
    if (!document.getElementById("twitter-embed-fix")) {
      document.head.appendChild(fixScript);
    }

    // No need to remove the script on unmount as it's a global fix
    // that should persist for the entire session
  }, []);

  // Skip if no tweet ID or invalid format
  if (!isValidTweetId) {
    // Invalid tweet ID - add more debugging info in development
    if (process.env.NODE_ENV === "development") {
      console.error("TwitterEmbed: Invalid tweet ID", {
        original: tweetId,
        cleaned: cleanTweetId,
        isValid: isValidTweetId,
        length: cleanTweetId?.length,
      });
    }
    return (
      <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">Invalid tweet ID: {tweetId}</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-gray-400 mt-2">
            Expected: numeric string with length &gt; 8, got: "{cleanTweetId}"
            (length: {cleanTweetId?.length})
          </p>
        )}
      </div>
    );
  }

  // We already have cleanTweetId defined above

  // Direct embed fallback using Twitter's oEmbed API
  const directEmbedFallback = useCallback(() => {
    // Using direct embed fallback
    try {
      // Create an iframe element
      const iframe = document.createElement("iframe");
      iframe.setAttribute(
        "src",
        `https://platform.twitter.com/embed/Tweet.html?id=${cleanTweetId}`
      );
      iframe.setAttribute("width", "100%");
      iframe.setAttribute("height", "auto");
      iframe.setAttribute(
        "style",
        "min-height: 300px; max-height: 600px; border: none; overflow: hidden;"
      );
      iframe.setAttribute("frameBorder", "0");
      iframe.setAttribute("allowTransparency", "true");
      iframe.setAttribute("allow", "encrypted-media");
      iframe.setAttribute("scrolling", "no");

      // Add responsive behavior
      const updateIframeSize = () => {
        const containerWidth = iframeRef.current?.offsetWidth || 550;
        const maxWidth = Math.min(containerWidth, 550);
        iframe.style.maxWidth = `${maxWidth}px`;
      };

      // Clear any existing content and append the iframe
      if (iframeRef.current) {
        iframeRef.current.innerHTML = "";
        iframeRef.current.appendChild(iframe);

        // Update size initially and on resize
        updateIframeSize();
        window.addEventListener("resize", updateIframeSize);

        setLoading(false);

        // Cleanup resize listener when component unmounts
        return () => {
          window.removeEventListener("resize", updateIframeSize);
        };
      }
    } catch (err) {
      // If fallback fails, show error state
      setError(true);
      setLoading(false);
      console.error("Twitter embed fallback failed:", err);
    }
  }, [cleanTweetId, iframeRef]);

  // Set a timeout to handle cases where the tweet doesn't load
  useEffect(() => {
    // Reset loading state when tweet ID changes
    setLoading(true);
    setError(false);

    // Reference to current loading state for the closure
    let isComponentMounted = true;

    const timeoutId = setTimeout(() => {
      // Only proceed if component is still mounted
      if (isComponentMounted && loading) {
        // Tweet failed to load, try fallback
        directEmbedFallback();
      }
    }, 8000); // 8 second timeout

    return () => {
      isComponentMounted = false;
      clearTimeout(timeoutId);
    };
  }, [cleanTweetId, directEmbedFallback, loading]); // Include loading state in dependencies

  // Handle Twitter widgets script loading and responsive behavior
  useEffect(() => {
    // Check if Twitter widgets script is already loaded
    if (typeof window !== "undefined" && window.twttr) {
      // If Twitter widgets is already loaded, manually process any tweets
      if (
        window.twttr.widgets &&
        typeof window.twttr.widgets.load === "function"
      ) {
        try {
          window.twttr.widgets.load();
        } catch (e) {
          console.error("Error loading Twitter widgets:", e);
        }
      }
    }

    // Add responsive behavior for Twitter embeds
    const handleResize = () => {
      // Force Twitter widgets to recalculate sizes
      if (window.twttr && window.twttr.widgets) {
        try {
          window.twttr.widgets.load();
        } catch (e) {
          // Silently handle errors
        }
      }
    };

    // Debounce resize handler
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250);
    };

    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // If we've hit an error after timeout and fallback
  if (error) {
    return (
      <div className="my-6 mx-auto max-w-[550px] p-4 sm:p-6 border border-red-100 rounded-lg bg-red-50 text-center">
        <p className="text-red-500 text-sm sm:text-base break-words">
          Could not load tweet {cleanTweetId}. It may have been deleted or is
          private.
        </p>
        <a
          href={`https://twitter.com/i/status/${cleanTweetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 inline-block text-sm sm:text-base break-words"
        >
          View on Twitter
        </a>
      </div>
    );
  }

  // Try both embedding methods for better chances of success
  return (
    <div className="my-6 w-full">
      <div className="twitter-tweet-container flex justify-center items-center px-4">
        <div className="w-full max-w-[550px] min-w-0">
          {/* Method 1: Using react-twitter-embed */}
          <TwitterTweetEmbed
            tweetId={cleanTweetId}
            options={{
              theme: "light",
              align: "center",
              dnt: true,
              // Remove fixed width to allow responsive behavior
            }}
            placeholder={
              <div className="animate-pulse flex flex-col items-center justify-center p-4 sm:p-6 w-full min-h-[200px] sm:min-h-[250px] max-w-full">
                <div className="h-8 sm:h-10 bg-gray-200 rounded-full w-8 sm:w-10 mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 max-w-xs mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 max-w-48"></div>
                <div className="mt-4 text-blue-400 text-xs sm:text-sm text-center">
                  Loading tweet {cleanTweetId}...
                </div>
              </div>
            }
            onLoad={() => {
              setLoading(false);
            }}
          />

          {/* Method 2: Direct iframe fallback */}
          <div
            ref={iframeRef}
            className={`w-full overflow-hidden ${loading ? "hidden" : ""}`}
            style={{ maxWidth: "100%" }}
          ></div>

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
              {/* Load Twitter widgets script safely */}
              {typeof window !== "undefined" && !window.twttr && (
                <script
                  async
                  src="https://platform.twitter.com/widgets.js"
                  id="twitter-widgets-js"
                ></script>
              )}
            </div>
          )}

          {/* Fallback link that appears if the tweet doesn't load */}
          {loading && (
            <div
              className="mt-4 px-2 text-center opacity-0 animate-fadeIn"
              style={{ animationDelay: "4s", animationFillMode: "forwards" }}
            >
              <a
                href={`https://twitter.com/i/status/${cleanTweetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs sm:text-sm break-words"
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
