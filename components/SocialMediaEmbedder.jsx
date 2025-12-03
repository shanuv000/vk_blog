import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FacebookEmbed, InstagramEmbed } from "react-social-media-embed";
import TwitterEmbed from "./Blog/TwitterEmbed";
import { log, error } from "../utils/logger";

// Component to render a single embed in place of a blockquote
const InPlaceEmbed = ({ url, platform, blockquoteId }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Find the blockquote element - try multiple methods
    let blockquote = document.getElementById(blockquoteId);

    // If not found by ID, try to find by data attribute
    if (!blockquote) {
      blockquote = document.querySelector(
        `[data-social-embed-id="${blockquoteId}"]`
      );
    }

    // If still not found, try to find any unprocessed blockquote with matching content
    if (!blockquote) {
      const allBlockquotes = document.querySelectorAll(
        "blockquote:not([data-embed-processed])"
      );
      for (const bq of allBlockquotes) {
        const text = bq.textContent.trim();
        // Check for Twitter ID or URL
        let isTwitter = false;
        if (platform === "twitter") {
          // Check for direct ID
          if (/^\d+$/.test(text) && text.length > 8) {
            isTwitter = true;
          } 
          // Check for Twitter/X URL
          else if (text.includes("twitter.com") || text.includes("x.com")) {
             const match = text.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
             if (match && match[1]) {
               isTwitter = true;
             }
          }
        }

        if (
          isTwitter ||
          (platform === "facebook" && text.includes("facebook.com")) ||
          (platform === "instagram" && text.includes("instagram.com"))
        ) {
          blockquote = bq;
          break;
        }
      }
    }

    if (!blockquote) {
      console.warn(`Could not find blockquote for ${platform} embed: ${url}`);
      // Create embed anyway in a fallback container
      const fallbackContainer = document.createElement("div");
      fallbackContainer.className = "social-media-embed-fallback";
      fallbackContainer.style.margin = "2rem auto";
      fallbackContainer.style.maxWidth = "550px";

      // Find article content to append to
      const articleContent = document.querySelector(
        '.article-content, .blog-content, div[class*="first-letter"]'
      );
      if (articleContent) {
        articleContent.appendChild(fallbackContainer);
        setContainer(fallbackContainer);
        return;
      }
      error(
        `Could not find blockquote with ID ${blockquoteId} and no article content found`
      );
      return;
    }

    // Log blockquote details
    log(`Processing blockquote: ${blockquoteId}`);

    // Check if embed container already exists for this blockquote
    const existingContainer = document.querySelector(
      `[data-replaces-blockquote="${blockquoteId}"]`
    );
    if (existingContainer) {
      log(`Embed container already exists for ${blockquoteId}, reusing it`);
      setContainer(existingContainer);
      return;
    }

    // Create a container for the embed
    const embedContainer = document.createElement("div");
    embedContainer.className = "social-media-embed-container";
    embedContainer.style.display = "flex";
    embedContainer.style.justifyContent = "center";
    embedContainer.style.margin = "2rem auto";
    embedContainer.style.maxWidth = "550px";
    embedContainer.style.width = "100%";

    // Add a data attribute to track which blockquote this replaces
    embedContainer.setAttribute("data-replaces-blockquote", blockquoteId);

    // Insert the container after the blockquote and hide the blockquote
    // This is safer than replacing the node entirely
    try {
      // Check if the blockquote is still connected to the DOM
      if (blockquote.isConnected) {
        // Find the closest article container to ensure proper placement
        const articleContainer =
          blockquote.closest(".article-content") ||
          blockquote.closest(".blog-content") ||
          blockquote.closest('div[class*="first-letter"]');

        if (articleContainer) {
          // Insert the container directly after the blockquote for proper positioning
          blockquote.parentNode.insertBefore(
            embedContainer,
            blockquote.nextSibling
          );

          // Hide the original blockquote
          blockquote.style.display = "none";

          // Mark the blockquote as processed
          blockquote.setAttribute("data-embed-processed", "true");

          // Log success
          log(
            `Successfully inserted embed container after blockquote ${blockquoteId} in article container`
          );
        } else {
          // If no article container found, insert after blockquote anyway
          blockquote.parentNode.insertBefore(
            embedContainer,
            blockquote.nextSibling
          );

          // Hide the original blockquote
          blockquote.style.display = "none";

          // Mark the blockquote as processed
          blockquote.setAttribute("data-embed-processed", "true");

          log(
            `Inserted embed container after blockquote ${blockquoteId} (no article container found)`
          );
        }
      } else {
        // If the blockquote is no longer in the DOM, find a suitable parent
        const articleContent = document.querySelector(
          '.article-content, .blog-content, div[class*="first-letter"]'
        );
        if (articleContent) {
          articleContent.appendChild(embedContainer);

          log(`Blockquote not in DOM, appended embed to article content`);
        } else {
          // Last resort: append to body
          document.body.appendChild(embedContainer);

          log(`Blockquote not in DOM, appended embed to body`);
        }
      }
    } catch (err) {
      error(`Error inserting embed container:`, err);

      // Last resort: try to append to body
      try {
        document.body.appendChild(embedContainer);
        log(`Used last resort method for blockquote ${blockquoteId}`);
      } catch (fallbackError) {
        error(`All insertion methods failed:`, fallbackError);
      }
    }

    // Set the container for the portal
    setContainer(embedContainer);

    // Store blockquote reference for cleanup
    const blockquoteRef = blockquote;

    // Mark the embed as persistent to prevent cleanup during DOM changes
    if (embedContainer) {
      embedContainer.setAttribute("data-persistent-embed", "true");
      embedContainer.setAttribute("data-embed-stable", blockquoteId);

      // Add mobile-specific attributes to prevent duplication
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        embedContainer.setAttribute("data-mobile-embed", "true");
        embedContainer.setAttribute("data-mobile-processed", blockquoteId);
      }
    }

    // Cleanup function - only run when component is actually unmounting
    return () => {
      try {
        // Check if this is a real unmount or just a DOM change/navigation
        const isRealUnmount = !document.querySelector(
          `[data-embed-stable="${blockquoteId}"]`
        );

        if (!isRealUnmount) {
          log(
            `Skipping cleanup for ${blockquoteId} - DOM change detected, not unmounting`
          );
          return;
        }

        // Add a longer delay to prevent cleanup during navigation/DOM changes
        setTimeout(() => {
          // Triple-check that we still need to clean up and it's not just a navigation
          const embedStillExists = document.querySelector(
            `[data-embed-stable="${blockquoteId}"]`
          );
          const stillNeedsCleanup =
            embedContainer && document.contains(embedContainer);

          if (stillNeedsCleanup && !embedStillExists) {
            // Safely remove the embed container if it exists and is in the DOM
            if (embedContainer && embedContainer.parentNode) {
              try {
                embedContainer.parentNode.removeChild(embedContainer);
                log(`Successfully removed embed container during cleanup`);
              } catch (removeError) {
                error(`Error removing embed container:`, removeError);
              }
            }
          } else {
            log(
              `Embed container preserved during DOM change for ${blockquoteId}`
            );
          }
        }, 500); // Longer delay to prevent cleanup during navigation

        // Only restore blockquote if we're actually unmounting AND the embed is gone
        setTimeout(() => {
          // Check if this is really an unmount situation
          const embedStillInDOM = document.querySelector(
            `[data-embed-stable="${blockquoteId}"]`
          );
          const shouldRestoreBlockquote =
            !embedStillInDOM &&
            blockquoteRef &&
            !document.contains(embedContainer);

          if (shouldRestoreBlockquote) {
            // Check if the blockquote is still in the DOM
            const blockquoteInDOM =
              document.getElementById(blockquoteId) !== null;

            if (!blockquoteInDOM) {
              // The blockquote was completely removed, try to restore it
              const articleContent = document.querySelector(
                '.article-content, .blog-content, div[class*="first-letter"]'
              );
              const parent = articleContent || document.body;

              if (parent) {
                try {
                  parent.appendChild(blockquoteRef);
                  blockquoteRef.style.display = ""; // Make it visible
                  log(`Restored blockquote ${blockquoteId} during cleanup`);
                } catch (appendError) {
                  error(
                    `Error appending blockquote during cleanup:`,
                    appendError
                  );
                }
              }
            } else {
              // If the blockquote is still in the DOM (was just hidden), make it visible
              try {
                blockquoteRef.style.display = "";
                log(`Made blockquote ${blockquoteId} visible during cleanup`);
              } catch (displayError) {
                error(`Error making blockquote visible:`, displayError);
              }
            }
          } else {
            log(
              `Skipping blockquote restoration for ${blockquoteId} - embed still active or DOM change`
            );
          }
        }, 1000); // Even longer delay for blockquote restoration
      } catch (err) {
        error(`General error during cleanup:`, err);
      }
    };
  }, [blockquoteId]);

  // If no container yet, return null
  if (!container) {
    return null;
  }

  // Render the appropriate embed component in the portal
  return createPortal(
    <div
      className={`social-media-embed-wrapper ${platform}`}
      style={{ width: "100%" }}
    >
      {platform === "facebook" && (
        <>
          <div
            className="embed-title"
            style={{
              fontSize: "14px",
              color: "#444",
              textAlign: "center",
              padding: "8px 0",
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #eaeaea",
            }}
          >
            Facebook Post
          </div>
          <div
            className="facebook-embed-container"
            style={{ minHeight: "550px" }}
          >
            <FacebookEmbed
              url={url}
              width="100%"
              height={550}
              containerTagName="div"
              protocol=""
              injectScript
            />
            {/* Fallback for Facebook embed */}
            <div
              className="facebook-fallback"
              style={{ marginTop: "10px", textAlign: "center" }}
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  color: "#1877f2",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "8px 16px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              >
                View on Facebook
              </a>
            </div>
          </div>
        </>
      )}
      {platform === "instagram" && (
        <>
          <div
            className="embed-title"
            style={{
              fontSize: "14px",
              color: "#444",
              textAlign: "center",
              padding: "8px 0",
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #eaeaea",
            }}
          >
            Instagram Post
          </div>
          <div
            className="instagram-embed-container"
            style={{ minHeight: "500px" }}
          >
            <InstagramEmbed
              url={url}
              width="100%"
              captioned
              containerTagName="div"
              protocol=""
              injectScript
            />
            {/* Fallback for Instagram embed */}
            <div
              className="instagram-fallback"
              style={{ marginTop: "10px", textAlign: "center" }}
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  color: "#0095f6",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "8px 16px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
              >
                View on Instagram
              </a>
            </div>
          </div>
        </>
      )}
      {platform === "twitter" && (
        <>
          {/* No title for Twitter embeds to avoid extra bar */}
          <div className="twitter-embed-container">
            {/* Extract ID if it's a URL */}
            {(() => {
              let tweetId = url;
              // Try to extract ID if it looks like a URL
              if (url && (url.includes('twitter.com') || url.includes('x.com'))) {
                const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
                if (match && match[1]) {
                  tweetId = match[1];
                }
              }
              return <TwitterEmbed tweetId={tweetId} />;
            })()}
            {/* Fallback for Twitter embed */}
            <div className="twitter-fallback">
              <a
                href={`https://twitter.com/i/status/${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="twitter-fallback-link"
              >
                View on Twitter
              </a>
            </div>
          </div>
        </>
      )}
      {/* No debug info in production */}
    </div>,
    container
  );
};

const SocialMediaEmbedder = () => {
  const [embeds, setEmbeds] = useState([]);
  const [shouldLoadEmbeds, setShouldLoadEmbeds] = useState(false);

  const sentinelRef = useRef(null);
  const embedQueueRef = useRef([]);
  const rateLimiterRef = useRef(null);
  const knownEmbedIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);
  const idleCallbackIdRef = useRef(null);

  log("SocialMediaEmbedder component rendered");

  useEffect(() => {
    knownEmbedIdsRef.current = new Set(
      embeds.map((embed) => embed.blockquoteId)
    );
  }, [embeds]);

  const processQueue = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (embedQueueRef.current.length === 0) {
      rateLimiterRef.current = null;
      return;
    }

    const nextEmbed = embedQueueRef.current.shift();
    if (!nextEmbed) {
      rateLimiterRef.current = null;
      return;
    }

    if (knownEmbedIdsRef.current.has(nextEmbed.blockquoteId)) {
      rateLimiterRef.current = window.setTimeout(processQueue, 0);
      return;
    }

    knownEmbedIdsRef.current.add(nextEmbed.blockquoteId);
    setEmbeds((prev) => [...prev, nextEmbed]);
    rateLimiterRef.current = window.setTimeout(processQueue, 1200);
  }, []);

  const enqueueEmbeds = useCallback(
    (items) => {
      if (!items || items.length === 0) {
        return;
      }

      const freshItems = [];
      items.forEach((item) => {
        if (!item || !item.blockquoteId) {
          return;
        }
        if (knownEmbedIdsRef.current.has(item.blockquoteId)) {
          return;
        }

        const alreadyQueued = embedQueueRef.current.some(
          (queued) => queued.blockquoteId === item.blockquoteId
        );

        if (!alreadyQueued) {
          freshItems.push(item);
        }
      });

      if (freshItems.length === 0) {
        return;
      }

      embedQueueRef.current.push(...freshItems);
      if (!rateLimiterRef.current) {
        processQueue();
      }
    },
    [processQueue]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (shouldLoadEmbeds) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      setShouldLoadEmbeds(true);
      return;
    }

    const handleDeferredLoad = () => setShouldLoadEmbeds(true);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleDeferredLoad();
          }
        });
      },
      { rootMargin: "200px 0px" }
    );

    intersectionObserver.observe(sentinel);

    window.addEventListener("pointerdown", handleDeferredLoad, {
      once: true,
    });
    window.addEventListener("scroll", handleDeferredLoad, {
      once: true,
      passive: true,
    });

    let fallbackTimeout = null;
    if (typeof window.requestIdleCallback === "function") {
      idleCallbackIdRef.current = window.requestIdleCallback(
        handleDeferredLoad,
        { timeout: 6000 }
      );
    } else {
      fallbackTimeout = window.setTimeout(handleDeferredLoad, 6000);
    }

    return () => {
      intersectionObserver.disconnect();
      window.removeEventListener("pointerdown", handleDeferredLoad);
      window.removeEventListener("scroll", handleDeferredLoad);
      if (idleCallbackIdRef.current) {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleCallbackIdRef.current);
        }
        idleCallbackIdRef.current = null;
      }
      if (fallbackTimeout) {
        window.clearTimeout(fallbackTimeout);
      }
    };
  }, [shouldLoadEmbeds]);

  useEffect(() => {
    if (!shouldLoadEmbeds || hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    let mutationObserver;
    let mobileCleanupInterval;
    let firstPassTimeout;
    let secondPassTimeout;
    let thirdPassTimeout;

    try {
      if (process.env.NODE_ENV === "development") {
        if (process.env.NODE_ENV === "development") {
          console.log("SocialMediaEmbedder: Starting initialization...");
        }
      }

      const preserveEmbeds = () => {
        const persistentEmbeds = document.querySelectorAll(
          '[data-persistent-embed="true"]'
        );

        const isMobileViewport = window.innerWidth <= 768;
        if (isMobileViewport) {
          const tweetIds = new Set();
          const duplicateEmbeds = [];

          persistentEmbeds.forEach((embed) => {
            const tweetId =
              embed.getAttribute("data-tweet-id") ||
              embed
                .querySelector("[data-tweet-id]")
                ?.getAttribute("data-tweet-id");

            if (tweetId) {
              if (tweetIds.has(tweetId)) {
                duplicateEmbeds.push(embed);
                log(`Found duplicate embed for tweet ${tweetId} on mobile`);
              } else {
                tweetIds.add(tweetId);
              }
            }
          });

          duplicateEmbeds.forEach((duplicate) => {
            if (duplicate.parentNode) {
              duplicate.parentNode.removeChild(duplicate);
              log("Removed duplicate embed on mobile");
            }
          });
        }

        persistentEmbeds.forEach((embed) => {
          if (!document.contains(embed)) {
            return;
          }

          embed.setAttribute("data-preserved", "true");

          const blockquoteId = embed.getAttribute("data-embed-stable");
          if (blockquoteId) {
            const originalBlockquote = document.getElementById(blockquoteId);
            if (
              originalBlockquote &&
              originalBlockquote.parentNode &&
              embed.parentNode !== originalBlockquote.parentNode
            ) {
              originalBlockquote.parentNode.insertBefore(
                embed,
                originalBlockquote.nextSibling
              );
              log(`Repositioned embed for ${blockquoteId} after DOM change`);
            }
          }
        });
      };

      mutationObserver = new MutationObserver((mutations) => {
        let shouldPreserve = false;
        mutations.forEach((mutation) => {
          if (
            mutation.type === "childList" &&
            (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
          ) {
            shouldPreserve = true;
          }
        });

        if (shouldPreserve) {
          setTimeout(preserveEmbeds, 100);
        }
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      const isMobileViewport = window.innerWidth <= 768;
      if (isMobileViewport) {
        mobileCleanupInterval = setInterval(() => {
          const allEmbeds = document.querySelectorAll("[data-tweet-id]");
          const tweetIds = new Set();
          const duplicates = [];

          allEmbeds.forEach((embed) => {
            const tweetId =
              embed.getAttribute("data-tweet-id") ||
              embed
                .querySelector("[data-tweet-id]")
                ?.getAttribute("data-tweet-id");

            if (tweetId) {
              if (tweetIds.has(tweetId)) {
                duplicates.push(embed);
              } else {
                tweetIds.add(tweetId);
              }
            }
          });

          if (duplicates.length > 0) {
            log(`Mobile cleanup: Found ${duplicates.length} duplicate embeds`);
            duplicates.forEach((duplicate) => {
              if (duplicate.parentNode) {
                duplicate.parentNode.removeChild(duplicate);
              }
            });
          }
        }, 3000);
      }

      const loadSocialMediaScripts = (platforms = new Set()) => {
        if (typeof window === "undefined") {
          return;
        }

        const scriptState =
          window.__socialEmbedScriptState ||
          (window.__socialEmbedScriptState = {
            twitter: false,
            facebook: false,
            instagram: false,
          });

        if (platforms.has("twitter") && !scriptState.twitter) {
          scriptState.twitter = true;
          if (!document.getElementById("twitter-widgets-js")) {
            const twitterScript = document.createElement("script");
            twitterScript.id = "twitter-widgets-js";
            twitterScript.src = "https://platform.twitter.com/widgets.js";
            twitterScript.async = true;
            twitterScript.defer = true;
            document.head.appendChild(twitterScript);
            if (process.env.NODE_ENV === "development") {
              if (process.env.NODE_ENV === "development") {
                console.log("Loading Twitter widgets script...");
              }
            }
          }
        }

        if (platforms.has("facebook") && !scriptState.facebook) {
          scriptState.facebook = true;
          if (!document.getElementById("facebook-jssdk")) {
            const facebookScript = document.createElement("script");
            facebookScript.id = "facebook-jssdk";
            facebookScript.src =
              "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
            facebookScript.async = true;
            facebookScript.defer = true;
            facebookScript.onload = () => {
              log("Facebook SDK loaded successfully");
              setTimeout(() => {
                if (window.FB) {
                  try {
                    window.FB.init({
                      xfbml: true,
                      version: "v18.0",
                    });
                    log("Facebook SDK initialized");
                  } catch (e) {
                    console.error("Facebook SDK init error:", e);
                  }
                }
              }, 100);
            };
            facebookScript.onerror = () => {
              console.error("Failed to load Facebook SDK");
            };
            document.head.appendChild(facebookScript);
            if (process.env.NODE_ENV === "development") {
              if (process.env.NODE_ENV === "development") {
                console.log("Loading Facebook SDK...");
              }
            }
          }
        }

        if (platforms.has("instagram") && !scriptState.instagram) {
          scriptState.instagram = true;
          // react-social-media-embed manages the Instagram script internally
        }
      };

      const addEmbedStyles = () => {
        if (document.getElementById("social-media-embed-styles")) {
          return;
        }

        if (!document.getElementById("social-media-hydration-fix")) {
          const fixHydrationScript = document.createElement("script");
          fixHydrationScript.id = "social-media-hydration-fix";
          fixHydrationScript.textContent = `
        window.addEventListener('load', function() {
          setTimeout(function() {
            document.querySelectorAll('[style*="width"]').forEach(function(el) {
              if (el.style.width && el.style.width.includes('%')) {
                el.style.width = '100%';
              }
            });
          }, 1000);
        });
      `;
          document.head.appendChild(fixHydrationScript);
        }

        const style = document.createElement("style");
        style.id = "social-media-embed-styles";
        style.textContent = `
        .social-media-embed-container {
          display: flex;
          justify-content: center;
          margin: 2rem auto;
          max-width: 550px;
          width: 100%;
          position: relative;
          clear: both;
        }

        .social-media-embed-wrapper {
          width: 100%;
          overflow: visible;
          border-radius: 0;
          box-shadow: none;
        }

        .social-media-embed-wrapper iframe[src*="facebook.com"] {
          width: 100% !important;
          min-height: 550px !important;
        }

        .social-media-embed-wrapper iframe[src*="instagram.com"] {
          width: 100% !important;
          min-height: 650px !important;
        }

        .social-media-embed-wrapper .twitter-tweet-container {
          width: 100% !important;
          margin: 0 auto !important;
        }

        .social-media-embed-wrapper .twitter-tweet {
          margin: 0 auto !important;
        }

        .social-media-embed-wrapper iframe[src*="twitter.com"] {
          width: 100% !important;
          margin: 0 auto !important;
        }

        .social-media-embed-wrapper.twitter {
          border: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
          background: transparent !important;
        }

        .social-media-embed-wrapper.twitter .embed-title { display: none !important; }
        .social-media-embed-wrapper.twitter .twitter-embed-container { min-height: 0 !important; }

        .social-media-embed-wrapper img {
          max-width: 100%;
          height: auto;
        }

        .social-media-embed-wrapper .error-message {
          display: none !important;
        }

        .facebook-fallback, .twitter-fallback, .instagram-fallback {
          display: none !important;
          opacity: 0;
          margin: 0 !important;
          padding: 0 !important;
          height: 0 !important;
          transition: opacity 0.3s ease;
          text-align: center;
        }

        .facebook-embed-container:not(:has(iframe)),
        .twitter-embed-container:not(:has(iframe)),
        .instagram-embed-container:not(:has(iframe)) {
          min-height: auto !important;
        }

        .facebook-embed-container:not(:has(iframe)) .facebook-fallback,
        .twitter-embed-container:not(:has(iframe)) .twitter-fallback,
        .instagram-embed-container:not(:has(iframe)) .instagram-fallback {
          display: block !important;
          opacity: 1;
          height: auto !important;
          margin-top: 8px !important;
        }

        .twitter-fallback-link {
          color: #1DA1F2;
          text-decoration: underline;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .social-media-embed-container {
            width: 100%;
            padding: 0 6px;
            margin: 1.25rem auto;
          }

          .social-media-embed-wrapper iframe[src*="facebook.com"],
          .social-media-embed-wrapper iframe[src*="instagram.com"] {
            min-height: 480px !important;
          }

          .social-media-embed-wrapper.twitter .twitter-embed-root {
            margin: 0.5rem 0 !important;
          }
          .social-media-embed-wrapper.twitter .twitter-tweet-container {
            padding-left: 2px !important;
            padding-right: 2px !important;
          }
          .social-media-embed-wrapper.twitter iframe[src*="twitter.com"] {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `;

        document.head.appendChild(style);
      };

      const extractSocialMediaUrls = () => {
        const extractedEmbeds = [];
        const seenUrls = new Set(); // Track URLs we've already processed

        document.querySelectorAll("blockquote").forEach((blockquote, index) => {
          try {
            if (
              blockquote.getAttribute("data-processed") === "true" ||
              blockquote.getAttribute("data-embed-processed") === "true" ||
              blockquote.getAttribute("data-mobile-processed") === "true"
            ) {
              if (process.env.NODE_ENV === "development") {
                if (process.env.NODE_ENV === "development") {
                  console.log(`Skipping already processed blockquote ${index}`);
                }
              }
              return;
            }

            const text = blockquote.textContent.trim();
            const existingEmbed = document.querySelector(
              `[data-tweet-id="${text}"]`
            );
            if (existingEmbed) {
              if (process.env.NODE_ENV === "development") {
                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `Skipping blockquote ${index} - embed already exists`
                  );
                }
              }
              blockquote.setAttribute("data-processed", "true");
              blockquote.setAttribute("data-mobile-processed", "true");
              return;
            }

            // Don't mark as processed yet - only mark after we confirm it's a social media embed

            const links = blockquote.querySelectorAll("a");
            if (process.env.NODE_ENV === "development") {
              console.log(`Processing blockquote ${index}:`, {
                text: text.substring(0, 100),
                hasLinks: links.length > 0,
                linkHrefs: Array.from(links).map((a) => a.href),
                innerHTML: blockquote.innerHTML.substring(0, 200),
              });
            }

            const blockquoteId = `social-blockquote-${index}-${text
              .substring(0, 10)
              .replace(/\D/g, "")}`;
            blockquote.id = blockquoteId;
            blockquote.setAttribute("data-social-embed-id", blockquoteId);

            let socialUrl = null;
            let platform = null;

            // Check for Twitter numeric ID
            if (/^\d+$/.test(text) && text.length > 8) {
              socialUrl = text;
              platform = "twitter";
              if (process.env.NODE_ENV === "development") {
                if (process.env.NODE_ENV === "development") {
                  console.log(`✓ Matched Twitter ID: ${text}`);
                }
              }
            } else if (links.length > 0) {
              for (let i = 0; i < links.length; i++) {
                const url = links[i].href;
                if (
                  url.includes("facebook.com") ||
                  url.includes("fb.com") ||
                  url.includes("fb.watch")
                ) {
                  socialUrl = url;
                  platform = "facebook";
                  break;
                } else if (
                  url.includes("instagram.com") ||
                  url.includes("instagr.am")
                ) {
                  socialUrl = url;
                  platform = "instagram";
                  break;
                }
              }
            }

            if (!socialUrl && text.includes("http")) {
              const fbMatch = text.match(
                /(https?:\/\/(www\.)?(facebook|fb)\.(com|watch)[^\s"'<>]+)/i
              );
              if (fbMatch && fbMatch[1]) {
                socialUrl = fbMatch[1];
                platform = "facebook";
              } else {
                const igMatch = text.match(
                  /(https?:\/\/(www\.)?(instagram|instagr)\.(com|am)[^\s"'<>]+)/i
                );
                if (igMatch && igMatch[1]) {
                  socialUrl = igMatch[1];
                  platform = "instagram";
                }
              }
            }

            if (socialUrl && platform) {
              // Check if we've already seen this URL in this pass
              const urlKey = `${platform}:${socialUrl}`;

              if (seenUrls.has(urlKey)) {
                if (process.env.NODE_ENV === "development") {
                  if (process.env.NODE_ENV === "development") {
                    console.log(
                      `⚠️ Skipping duplicate ${platform} URL: ${socialUrl}`
                    );
                  }
                }
                // Mark as processed to prevent future passes from picking it up
                blockquote.setAttribute("data-processed", "true");
                blockquote.setAttribute("data-mobile-processed", "true");
                return;
              }

              // Add to seen URLs
              seenUrls.add(urlKey);

              // Mark as processed only when we've successfully identified a social media embed
              blockquote.setAttribute("data-processed", "true");
              blockquote.setAttribute("data-mobile-processed", "true");

              extractedEmbeds.push({
                id: `social-embed-${index}`,
                url: socialUrl,
                platform,
                blockquoteId,
              });
            } else {
              // Log why this blockquote wasn't matched
              if (text.length > 0 && process.env.NODE_ENV === "development") {
                console.log(`✗ Blockquote ${index} not matched:`, {
                  text: text.substring(0, 100),
                  isNumeric: /^\d+$/.test(text),
                  length: text.length,
                  hasLinks: links.length > 0,
                });
              }
            }
          } catch (err) {
            error("Error processing blockquote:", err);
          }
        });

        return extractedEmbeds;
      };

      addEmbedStyles();

      // Clean up stale processing flags from previous navigation/mount
      const cleanupStaleFlags = () => {
        document
          .querySelectorAll(
            "blockquote[data-processed='true'], blockquote[data-mobile-processed='true'], blockquote[data-embed-processed='true']"
          )
          .forEach((blockquote) => {
            const text = blockquote.textContent.trim();
            const blockquoteId =
              blockquote.id ||
              `temp-${text.substring(0, 10).replace(/\D/g, "")}`;

            // Check if there's actually an embed container for this blockquote
            const hasEmbedContainer =
              document.querySelector(
                `[data-replaces-blockquote="${blockquoteId}"]`
              ) || document.querySelector(`[data-tweet-id="${text}"]`);

            // If no embed exists but blockquote is marked as processed, it's stale - clear the flags
            if (!hasEmbedContainer && blockquote.style.display !== "none") {
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `🧹 Cleaning stale processing flags from blockquote: ${text.substring(
                    0,
                    50
                  )}`
                );
              }
              blockquote.removeAttribute("data-processed");
              blockquote.removeAttribute("data-mobile-processed");
              blockquote.removeAttribute("data-embed-processed");
            }
          });
      };

      cleanupStaleFlags();

      firstPassTimeout = setTimeout(() => {
        if (process.env.NODE_ENV === "development") {
          console.log("Starting first pass of embed extraction...");
        }
        const extractedEmbeds = extractSocialMediaUrls();
        enqueueEmbeds(extractedEmbeds);
        loadSocialMediaScripts(new Set(extractedEmbeds.map((e) => e.platform)));

        log(`First pass found ${extractedEmbeds.length} social media embeds`);

        if (process.env.NODE_ENV === "development") {
          const allBlockquotes = document.querySelectorAll("blockquote");
          log(`Total blockquotes found: ${allBlockquotes.length}`);
          allBlockquotes.forEach((bq, i) => {
            log(`Blockquote ${i}:`, bq.textContent.trim().substring(0, 100));
          });
        }

        if (extractedEmbeds.length > 0) {
          extractedEmbeds.forEach((embed, i) => {
            log(`Embed ${i}: Platform=${embed.platform}, URL=${embed.url}`);
          });
        }

        secondPassTimeout = setTimeout(() => {
          const newExtractedEmbeds = extractSocialMediaUrls();
          log(
            `Second pass found ${newExtractedEmbeds.length} social media embeds`
          );

          enqueueEmbeds(newExtractedEmbeds);
          loadSocialMediaScripts(
            new Set(newExtractedEmbeds.map((e) => e.platform))
          );

          thirdPassTimeout = setTimeout(() => {
            const finalExtractedEmbeds = extractSocialMediaUrls();
            log(
              `Final pass found ${finalExtractedEmbeds.length} social media embeds`
            );

            enqueueEmbeds(finalExtractedEmbeds);
            loadSocialMediaScripts(
              new Set(finalExtractedEmbeds.map((e) => e.platform))
            );
          }, 5000);
        }, 3000);
      }, 3000);
    } catch (componentError) {
      console.error(
        "SocialMediaEmbedder: Error during initialization:",
        componentError
      );
    }

    return () => {
      hasInitializedRef.current = false;

      if (firstPassTimeout) {
        clearTimeout(firstPassTimeout);
      }
      if (secondPassTimeout) {
        clearTimeout(secondPassTimeout);
      }
      if (thirdPassTimeout) {
        clearTimeout(thirdPassTimeout);
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (mobileCleanupInterval) {
        clearInterval(mobileCleanupInterval);
      }
      if (rateLimiterRef.current) {
        clearTimeout(rateLimiterRef.current);
        rateLimiterRef.current = null;
      }

      embedQueueRef.current = [];
      knownEmbedIdsRef.current = new Set();
    };
  }, [shouldLoadEmbeds, enqueueEmbeds, processQueue]);

  return (
    <>
      <div
        ref={sentinelRef}
        data-social-embed-sentinel="true"
        style={{ height: 1, width: "100%", position: "relative" }}
        aria-hidden="true"
      />
      {embeds.map((embed) => (
        <InPlaceEmbed
          key={embed.id}
          url={embed.url}
          platform={embed.platform}
          blockquoteId={embed.blockquoteId}
        />
      ))}
    </>
  );
};

export default SocialMediaEmbedder;
