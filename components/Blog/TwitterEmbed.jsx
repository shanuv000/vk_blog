import React, { useState, useEffect, useRef, useCallback } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import TwitterPost from "../TwitterPost";

const TwitterEmbed = ({ tweetId, useApiVersion = true }) => {
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

  // Use new API version if enabled and tweet ID is valid
  if (useApiVersion && isValidTweetId) {
    return (
      <div className="my-3 sm:my-4 md:my-6 mx-2 sm:mx-auto max-w-[550px]">
        <TwitterPost tweetId={cleanTweetId} />
      </div>
    );
  }

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
      <div className="my-3 sm:my-4 md:my-6 p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50 text-center mx-2 sm:mx-auto max-w-[550px]">
        <p className="text-gray-500 text-sm sm:text-base">
          Invalid tweet ID: {tweetId}
        </p>
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
      // Only proceed if component is still mounted and still loading
      if (isComponentMounted) {
        // Check current loading state at timeout time
        setLoading((currentLoading) => {
          if (currentLoading) {
            // Tweet failed to load, try fallback
            directEmbedFallback();
          }
          return currentLoading;
        });
      }
    }, 8000); // 8 second timeout

    return () => {
      isComponentMounted = false;
      clearTimeout(timeoutId);
    };
  }, [cleanTweetId, directEmbedFallback]); // Remove loading from dependencies to prevent infinite re-renders

  // Handle Twitter widgets script loading and responsive behavior
  useEffect(() => {
    // Add responsive CSS for Twitter embeds
    const addResponsiveStyles = () => {
      if (typeof document === "undefined") return;

      const styleId = "twitter-embed-responsive-styles";
      if (document.getElementById(styleId)) return;

      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        /* Twitter Embed Responsive Styles */
        .twitter-embed-root {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }

        .twitter-tweet-container {
          width: 100% !important;
          max-width: 550px !important;
          margin: 0 auto !important;
          display: flex !important;
          justify-content: center !important;
        }

        .twitter-tweet {
          margin: 0 auto !important;
          max-width: 100% !important;
          width: 100% !important;
        }

        /* Fix for react-twitter-embed */
        .twitter-tweet-embed {
          width: 100% !important;
          max-width: 550px !important;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .twitter-embed-root {
            margin: 0.75rem 0 !important; /* Reduced from 1.5rem */
          }

          .twitter-tweet-container {
            padding: 0 4px !important; /* Reduced from 8px */
            margin: 0 !important;
          }

          .twitter-tweet {
            width: 100% !important;
            min-width: auto !important;
            margin: 0 !important;
          }

          /* Force Twitter iframe to be responsive */
          .twitter-tweet iframe {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 200px !important; /* Reduced min-height for mobile */
          }

          .twitter-tweet-embed iframe {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 200px !important;
          }

          /* Reduce placeholder size on mobile */
          .twitter-embed-root .animate-pulse {
            min-height: 150px !important;
            padding: 0.75rem !important;
          }
        }

        /* Tablet optimizations */
        @media (min-width: 641px) and (max-width: 1024px) {
          .twitter-embed-root {
            margin: 1rem 0 !important;
          }

          .twitter-tweet-container {
            padding: 0 12px !important; /* Reduced from 16px */
          }
        }

        /* Ensure embeds don't overflow */
        .twitter-tweet-container *,
        .twitter-embed-root * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        /* Fix for TweetEmbedder containers */
        .tweet-embed-wrapper {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          margin: 1rem auto !important; /* Reduced from 1.5rem */
        }

        .tweet-embed-wrapper .twitter-embed-root {
          margin: 0 !important;
        }

        /* Mobile-specific TweetEmbedder adjustments */
        @media (max-width: 640px) {
          .tweet-embed-wrapper {
            margin: 0.75rem auto !important;
            padding: 0 !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

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

    // Add responsive styles
    addResponsiveStyles();

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
      <div className="my-3 sm:my-4 md:my-6 mx-2 sm:mx-auto max-w-[550px] p-3 sm:p-4 md:p-6 border border-red-100 rounded-lg bg-red-50 text-center">
        <p className="text-red-500 text-sm sm:text-base break-words">
          Could not load tweet {cleanTweetId}. It may have been deleted or is
          private.
        </p>
        <a
          href={`https://twitter.com/i/status/${cleanTweetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 inline-block text-sm sm:text-base break-words p-2 rounded hover:bg-blue-50 transition-colors"
        >
          View on Twitter
        </a>
      </div>
    );
  }

  // If we're explicitly asked NOT to use API version, render a single, stable method
  if (!useApiVersion) {
    return (
      <div className="twitter-embed-root my-3 sm:my-4 md:my-6 w-full">
        <div className="twitter-tweet-container flex justify-center items-center px-1 sm:px-3 md:px-4">
          <div
            className="w-full max-w-[550px] min-w-0 mx-auto"
            style={{ maxWidth: "550px", width: "100%" }}
          >
            <TwitterTweetEmbed
              tweetId={cleanTweetId}
              options={{
                theme: "light",
                align: "center",
                dnt: true,
                conversation: "none",
                cards: "visible",
              }}
              placeholder={
                <div className="animate-pulse flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 w-full min-h-[140px] sm:min-h-[180px] md:min-h-[200px] max-w-full">
                  <div className="h-5 sm:h-6 md:h-8 bg-gray-200 rounded-full w-5 sm:w-6 md:w-8 mb-2"></div>
                  <div className="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded w-3/4 max-w-xs mb-2"></div>
                  <div className="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded w-1/2 max-w-48"></div>
                  <div className="mt-2 sm:mt-3 text-blue-400 text-xs sm:text-sm text-center px-1 sm:px-2">
                    Loading tweet {cleanTweetId}...
                  </div>
                </div>
              }
              onLoad={() => setLoading(false)}
              onError={() => {
                setError(true);
                setLoading(false);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Try both embedding methods for better chances of success
  return (
    <div className="twitter-embed-root my-3 sm:my-4 md:my-6 w-full">
      <div className="twitter-tweet-container flex justify-center items-center px-1 sm:px-3 md:px-4">
        <div
          className="w-full max-w-[550px] min-w-0 mx-auto"
          style={{ maxWidth: "550px", width: "100%" }}
        >
          {/* Method 1: Using react-twitter-embed */}
          <TwitterTweetEmbed
            tweetId={cleanTweetId}
            options={{
              theme: "light",
              align: "center",
              dnt: true,
              conversation: "none",
              cards: "visible",
              // Remove fixed width to allow responsive behavior
            }}
            placeholder={
              <div className="animate-pulse flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 w-full min-h-[140px] sm:min-h-[180px] md:min-h-[200px] max-w-full">
                <div className="h-5 sm:h-6 md:h-8 bg-gray-200 rounded-full w-5 sm:w-6 md:w-8 mb-2"></div>
                <div className="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded w-3/4 max-w-xs mb-2"></div>
                <div className="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded w-1/2 max-w-48"></div>
                <div className="mt-2 sm:mt-3 text-blue-400 text-xs sm:text-sm text-center px-1 sm:px-2">
                  Loading tweet {cleanTweetId}...
                </div>
              </div>
            }
            onLoad={() => {
              console.log(
                `TwitterEmbed: Successfully loaded tweet ${cleanTweetId}`
              );
              setLoading(false);
            }}
            onError={(error) => {
              console.error(
                `TwitterEmbed: Failed to load tweet ${cleanTweetId}:`,
                error
              );
              setError(true);
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
              className="mt-2 sm:mt-3 md:mt-4 px-1 sm:px-2 md:px-3 text-center opacity-0 animate-fadeIn"
              style={{ animationDelay: "4s", animationFillMode: "forwards" }}
            >
              <a
                href={`https://twitter.com/i/status/${cleanTweetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs sm:text-sm break-words inline-block p-1 sm:p-2 rounded hover:bg-blue-50 transition-colors"
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
