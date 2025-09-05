import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FacebookEmbed, InstagramEmbed } from "react-social-media-embed";
import TwitterEmbed from "./TwitterEmbed";
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
        if (
          (platform === "twitter" && /^\d+$/.test(text) && text.length > 8) ||
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
      } else {
        error(
          `Could not find blockquote with ID ${blockquoteId} and no article content found`
        );
        return;
      }
    }

    // Log blockquote details
    log(`Processing blockquote: ${blockquoteId}`);

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

    // Cleanup function
    return () => {
      try {
        // Safely remove the embed container if it exists and is in the DOM
        if (embedContainer) {
          // Check if the container is actually in the DOM
          const containerInDOM = document.contains(embedContainer);

          if (containerInDOM && embedContainer.parentNode) {
            // Remove the embed container safely
            try {
              embedContainer.parentNode.removeChild(embedContainer);

              log(`Successfully removed embed container during cleanup`);
            } catch (removeError) {
              error(`Error removing embed container:`, removeError);
            }
          } else {
            log(`Embed container not in DOM during cleanup, no need to remove`);
          }
        }

        // Try to restore the original blockquote if needed
        if (blockquoteRef) {
          // Check if the blockquote is still in the DOM
          const blockquoteInDOM =
            document.getElementById(blockquoteId) !== null;

          if (!blockquoteInDOM) {
            // The blockquote was completely removed, try to restore it
            // Find a suitable parent - either the article content or the body as fallback
            const articleContent = document.querySelector(
              '.article-content, .blog-content, div[class*="first-letter"]'
            );
            const parent = articleContent || document.body;

            if (parent) {
              // Just append it to the parent, position doesn't matter as much during cleanup
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
        }
      } catch (err) {
        error(`General error during cleanup:`, err);
      }
    };
  }, [blockquoteId]);

  // If no container yet, return null
  if (!container) return null;

  // Render the appropriate embed component in the portal
  return createPortal(
    <div className="social-media-embed-wrapper" style={{ width: "100%" }}>
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
              captioned={true}
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
            Twitter Post
          </div>
          <div
            className="twitter-embed-container"
            style={{ minHeight: "300px" }}
          >
            <TwitterEmbed tweetId={url} />
            {/* Fallback for Twitter embed */}
            <div
              className="twitter-fallback"
              style={{ marginTop: "10px", textAlign: "center" }}
            >
              <a
                href={`https://twitter.com/i/status/${url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  color: "#1DA1F2",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "8px 16px",
                  border: "1px solid #dbdbdb",
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
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

  log("SocialMediaEmbedder component rendered");

  useEffect(() => {
    try {
      console.log("SocialMediaEmbedder: Starting initialization...");

      // Force load social media scripts
      const loadSocialMediaScripts = () => {
        // Load Twitter widgets script
        if (!window.twttr && !document.getElementById("twitter-widgets-js")) {
          const twitterScript = document.createElement("script");
          twitterScript.id = "twitter-widgets-js";
          twitterScript.src = "https://platform.twitter.com/widgets.js";
          twitterScript.async = true;
          document.head.appendChild(twitterScript);
          console.log("Loading Twitter widgets script...");
        }

        // Load Facebook SDK
        if (!window.FB && !document.getElementById("facebook-jssdk")) {
          const facebookScript = document.createElement("script");
          facebookScript.id = "facebook-jssdk";
          facebookScript.src =
            "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
          facebookScript.async = true;
          facebookScript.onload = () => {
            log("Facebook SDK loaded successfully");
            // Initialize Facebook SDK with minimal config
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
          console.log("Loading Facebook SDK...");
        }

        // Instagram embeds are handled by the react-social-media-embed library
        console.log("Social media scripts loading initiated");
      };

      // Add CSS styles for social media embeds
      const addEmbedStyles = () => {
        // Check if styles already exist
        if (document.getElementById("social-media-embed-styles")) {
          return;
        }

        // Fix for hydration mismatch
        const fixHydrationScript = document.createElement("script");
        fixHydrationScript.id = "social-media-hydration-fix";
        fixHydrationScript.textContent = `
        // Fix for React hydration mismatch
        window.addEventListener('load', function() {
          // Give time for React to finish hydration
          setTimeout(function() {
            // Force consistent width for elements that might cause hydration mismatches
            document.querySelectorAll('[style*="width"]').forEach(function(el) {
              if (el.style.width.includes('%')) {
                el.style.width = '100%';
              }
            });
          }, 1000);
        });
      `;
        document.head.appendChild(fixHydrationScript);

        // Create style element
        const style = document.createElement("style");
        style.id = "social-media-embed-styles";
        style.textContent = `
        .social-media-embed-container {
          display: flex;
          justify-content: center;
          margin: 2.5rem auto;
          max-width: 550px;
          width: 100%;
          position: relative;
          clear: both;
        }

        .social-media-embed-wrapper {
          width: 100%;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Specific styling for Facebook embeds */
        .social-media-embed-wrapper iframe[src*="facebook.com"] {
          width: 100% !important;
          min-height: 550px !important;
        }

        /* Specific styling for Instagram embeds */
        .social-media-embed-wrapper iframe[src*="instagram.com"] {
          width: 100% !important;
          min-height: 650px !important;
        }

        /* Specific styling for Twitter embeds */
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

        /* Fix for CORS issues */
        .social-media-embed-wrapper img {
          max-width: 100%;
          height: auto;
        }

        /* Hide error messages from embeds */
        .social-media-embed-wrapper .error-message {
          display: none !important;
        }

        /* Ensure fallbacks are visible */
        .facebook-fallback, .twitter-fallback, .instagram-fallback {
          opacity: 0;
          transition: opacity 3s ease;
        }

        /* Show fallbacks if embed fails to load */
        .facebook-embed-container:not(:has(iframe)),
        .twitter-embed-container:not(:has(iframe)),
        .instagram-embed-container:not(:has(iframe)) {
          min-height: auto !important;
        }

        .facebook-embed-container:not(:has(iframe)) .facebook-fallback,
        .twitter-embed-container:not(:has(iframe)) .twitter-fallback,
        .instagram-embed-container:not(:has(iframe)) .instagram-fallback {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .social-media-embed-container {
            width: 100%;
            padding: 0;
            margin: 2rem auto;
          }

          /* Adjust heights for mobile */
          .social-media-embed-wrapper iframe[src*="facebook.com"],
          .social-media-embed-wrapper iframe[src*="instagram.com"] {
            min-height: 480px !important;
          }
        }
      `;

        // Add style to head
        document.head.appendChild(style);
      };

      // Function to extract social media URLs from blockquotes
      const extractSocialMediaUrls = () => {
        const extractedEmbeds = [];

        // No debug logs in production

        // Find all blockquotes in the article content
        document.querySelectorAll("blockquote").forEach((blockquote, index) => {
          try {
            // Skip if already processed
            if (blockquote.getAttribute("data-processed") === "true") {
              console.log(`Skipping already processed blockquote ${index}`);
              return;
            }

            // Mark as processed to avoid double processing
            blockquote.setAttribute("data-processed", "true");

            // Get the text content of the blockquote
            const text = blockquote.textContent.trim();

            // Enhanced debugging for unprocessed blockquotes
            const links = blockquote.querySelectorAll("a");
            console.log(`Processing blockquote ${index}:`, {
              text: text.substring(0, 100),
              hasLinks: links.length > 0,
              linkHrefs: Array.from(links).map((a) => a.href),
              innerHTML: blockquote.innerHTML.substring(0, 200),
            });

            // Add an ID to the blockquote for reference - use a more stable approach
            const blockquoteId = `social-blockquote-${index}-${text
              .substring(0, 10)
              .replace(/\D/g, "")}`;
            blockquote.id = blockquoteId;
            blockquote.setAttribute("data-social-embed-id", blockquoteId);

            // Links already defined above for debugging
            let socialUrl = null;
            let platform = null;

            // First check if the text is a Twitter tweet ID (numeric string)
            // This is the highest priority check as per requirements
            if (/^\d+$/.test(text) && text.length > 8) {
              socialUrl = text; // For Twitter, we use the ID as the "URL"
              platform = "twitter";
            }
            // If not a tweet ID, check for links
            else if (links.length > 0) {
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

            // If no tweet ID or link found, try to extract URL from text
            if (!socialUrl && text.includes("http")) {
              // Try to find Facebook URL
              const fbMatch = text.match(
                /(https?:\/\/(www\.)?(facebook|fb)\.(com|watch)[^\s"'<>]+)/i
              );
              if (fbMatch && fbMatch[1]) {
                socialUrl = fbMatch[1];
                platform = "facebook";
              } else {
                // Try to find Instagram URL
                const igMatch = text.match(
                  /(https?:\/\/(www\.)?(instagram|instagr)\.(com|am)[^\s"'<>]+)/i
                );
                if (igMatch && igMatch[1]) {
                  socialUrl = igMatch[1];
                  platform = "instagram";
                }
                // Note: YouTube URLs are intentionally not detected in blockquotes
                // as they should only be handled through iframes
              }
            }

            // If we found a social media URL, add it to our embeds array
            if (socialUrl && platform) {
              extractedEmbeds.push({
                id: `social-embed-${index}`,
                url: socialUrl,
                platform,
                blockquoteId,
              });

              // No debug logs in production
            }
          } catch (err) {
            error("Error processing blockquote:", err);
          }
        });

        return extractedEmbeds;
      };

      // Load social media scripts first
      loadSocialMediaScripts();

      // Add styles
      addEmbedStyles();

      // Extract social media URLs after a delay to ensure the DOM is fully loaded
      // Use a longer delay to ensure RichTextRenderer has completely finished
      const timeoutId = setTimeout(() => {
        console.log("Starting first pass of embed extraction...");
        const extractedEmbeds = extractSocialMediaUrls();
        setEmbeds(extractedEmbeds);

        // Log the number of embeds found in the first pass
        log(`First pass found ${extractedEmbeds.length} social media embeds`);

        // Debug: Log all blockquotes found
        if (process.env.NODE_ENV === "development") {
          const allBlockquotes = document.querySelectorAll("blockquote");
          log(`Total blockquotes found: ${allBlockquotes.length}`);
          allBlockquotes.forEach((bq, i) => {
            log(`Blockquote ${i}:`, bq.textContent.trim().substring(0, 100));
          });
        }

        // If we found embeds, log their details
        if (extractedEmbeds.length > 0) {
          extractedEmbeds.forEach((embed, i) => {
            log(`Embed ${i}: Platform=${embed.platform}, URL=${embed.url}`);
          });
        }

        // Run again after a longer delay to catch any dynamically loaded content
        setTimeout(() => {
          const newExtractedEmbeds = extractSocialMediaUrls();

          // Log in development mode only
          log(
            `Second pass found ${newExtractedEmbeds.length} social media embeds`
          );

          setEmbeds((prev) => {
            // Only add new embeds that aren't already in the array
            const existingIds = prev.map((embed) => embed.id);
            const newEmbeds = newExtractedEmbeds.filter(
              (embed) => !existingIds.includes(embed.id)
            );

            // Log in development mode only
            if (newEmbeds.length > 0) {
              log(`Adding ${newEmbeds.length} new embeds from second pass`);
            }

            return [...prev, ...newEmbeds];
          });

          // Add a third pass for any late-loading content
          setTimeout(() => {
            const finalExtractedEmbeds = extractSocialMediaUrls();

            // Log in development mode only
            log(
              `Final pass found ${finalExtractedEmbeds.length} social media embeds`
            );

            setEmbeds((prev) => {
              const existingIds = prev.map((embed) => embed.id);
              const finalNewEmbeds = finalExtractedEmbeds.filter(
                (embed) => !existingIds.includes(embed.id)
              );

              // Log in development mode only
              if (finalNewEmbeds.length > 0) {
                log(
                  `Adding ${finalNewEmbeds.length} new embeds from final pass`
                );
              }

              return [...prev, ...finalNewEmbeds];
            });
          }, 5000);
        }, 3000);
      }, 3000); // Increased delay to give RichTextRenderer more time

      // Clean up
      return () => clearTimeout(timeoutId);
    } catch (error) {
      console.error("SocialMediaEmbedder: Error during initialization:", error);
    }
  }, []);

  // Render the embeds using React portals to place them directly after the blockquotes
  return (
    <>
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
