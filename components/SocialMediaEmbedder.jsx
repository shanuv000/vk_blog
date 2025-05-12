import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FacebookEmbed, InstagramEmbed } from "react-social-media-embed";
import TwitterEmbed from "./TwitterEmbed";

// Component to render a single embed in place of a blockquote
const InPlaceEmbed = ({ url, platform, blockquoteId }) => {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    // Find the blockquote element
    const blockquote = document.getElementById(blockquoteId);
    if (!blockquote) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Could not find blockquote with ID ${blockquoteId}`);
      }
      return;
    }

    // Log blockquote details only in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(`Processing blockquote: ${blockquoteId}`);
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

          // Log success in development mode
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Successfully inserted embed container after blockquote ${blockquoteId} in article container`
            );
          }
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

          if (process.env.NODE_ENV === "development") {
            console.log(
              `Inserted embed container after blockquote ${blockquoteId} (no article container found)`
            );
          }
        }
      } else {
        // If the blockquote is no longer in the DOM, find a suitable parent
        const articleContent = document.querySelector(
          '.article-content, .blog-content, div[class*="first-letter"]'
        );
        if (articleContent) {
          articleContent.appendChild(embedContainer);

          if (process.env.NODE_ENV === "development") {
            console.log(
              `Blockquote not in DOM, appended embed to article content`
            );
          }
        } else {
          // Last resort: append to body
          document.body.appendChild(embedContainer);

          if (process.env.NODE_ENV === "development") {
            console.log(`Blockquote not in DOM, appended embed to body`);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error inserting embed container:`, error);
      }

      // Last resort: try to append to body
      try {
        document.body.appendChild(embedContainer);

        if (process.env.NODE_ENV === "development") {
          console.log(`Used last resort method for blockquote ${blockquoteId}`);
        }
      } catch (fallbackError) {
        if (process.env.NODE_ENV === "development") {
          console.error(`All insertion methods failed:`, fallbackError);
        }
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

              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Successfully removed embed container during cleanup`
                );
              }
            } catch (removeError) {
              if (process.env.NODE_ENV === "development") {
                console.error(`Error removing embed container:`, removeError);
              }
            }
          } else if (process.env.NODE_ENV === "development") {
            console.log(
              `Embed container not in DOM during cleanup, no need to remove`
            );
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

                if (process.env.NODE_ENV === "development") {
                  console.log(
                    `Restored blockquote ${blockquoteId} during cleanup`
                  );
                }
              } catch (appendError) {
                if (process.env.NODE_ENV === "development") {
                  console.error(
                    `Error appending blockquote during cleanup:`,
                    appendError
                  );
                }
              }
            }
          } else {
            // If the blockquote is still in the DOM (was just hidden), make it visible
            try {
              blockquoteRef.style.display = "";

              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Made blockquote ${blockquoteId} visible during cleanup`
                );
              }
            } catch (displayError) {
              if (process.env.NODE_ENV === "development") {
                console.error(`Error making blockquote visible:`, displayError);
              }
            }
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(`General error during cleanup:`, error);
        }
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
          <FacebookEmbed url={url} width="100%" height={550} />
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
          <InstagramEmbed url={url} width="100%" captioned={true} />
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
          <TwitterEmbed tweetId={url} />
        </>
      )}
      {/* No debug info in production */}
    </div>,
    container
  );
};

const SocialMediaEmbedder = () => {
  const [embeds, setEmbeds] = useState([]);

  useEffect(() => {
    // Add CSS styles for social media embeds
    const addEmbedStyles = () => {
      // Check if styles already exist
      if (document.getElementById("social-media-embed-styles")) {
        return;
      }

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
            return;
          }

          // Mark as processed to avoid double processing
          blockquote.setAttribute("data-processed", "true");

          // Add an ID to the blockquote for reference
          const blockquoteId = `blockquote-${Date.now()}-${index}`;
          blockquote.id = blockquoteId;

          // Get the text content of the blockquote
          const text = blockquote.textContent.trim();

          // Get all links in the blockquote
          const links = blockquote.querySelectorAll("a");
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
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error processing blockquote:", error);
          }
        }
      });

      return extractedEmbeds;
    };

    // Add styles
    addEmbedStyles();

    // Extract social media URLs after a delay to ensure the DOM is fully loaded
    // Use a slightly longer initial delay to ensure RichTextRenderer has finished
    const timeoutId = setTimeout(() => {
      const extractedEmbeds = extractSocialMediaUrls();
      setEmbeds(extractedEmbeds);

      // Log the number of embeds found in the first pass (only in development)
      if (process.env.NODE_ENV === "development") {
        console.log(
          `First pass found ${extractedEmbeds.length} social media embeds`
        );

        // If we found embeds, log their details
        if (extractedEmbeds.length > 0) {
          extractedEmbeds.forEach((embed, i) => {
            console.log(
              `Embed ${i}: Platform=${embed.platform}, URL=${embed.url}`
            );
          });
        }
      }

      // Run again after a longer delay to catch any dynamically loaded content
      setTimeout(() => {
        const newExtractedEmbeds = extractSocialMediaUrls();

        // Log in development mode only
        if (process.env.NODE_ENV === "development") {
          console.log(
            `Second pass found ${newExtractedEmbeds.length} social media embeds`
          );
        }

        setEmbeds((prev) => {
          // Only add new embeds that aren't already in the array
          const existingIds = prev.map((embed) => embed.id);
          const newEmbeds = newExtractedEmbeds.filter(
            (embed) => !existingIds.includes(embed.id)
          );

          // Log in development mode only
          if (process.env.NODE_ENV === "development" && newEmbeds.length > 0) {
            console.log(
              `Adding ${newEmbeds.length} new embeds from second pass`
            );
          }

          return [...prev, ...newEmbeds];
        });

        // Add a third pass for any late-loading content
        setTimeout(() => {
          const finalExtractedEmbeds = extractSocialMediaUrls();

          // Log in development mode only
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Final pass found ${finalExtractedEmbeds.length} social media embeds`
            );
          }

          setEmbeds((prev) => {
            const existingIds = prev.map((embed) => embed.id);
            const finalNewEmbeds = finalExtractedEmbeds.filter(
              (embed) => !existingIds.includes(embed.id)
            );

            // Log in development mode only
            if (
              process.env.NODE_ENV === "development" &&
              finalNewEmbeds.length > 0
            ) {
              console.log(
                `Adding ${finalNewEmbeds.length} new embeds from final pass`
              );
            }

            return [...prev, ...finalNewEmbeds];
          });
        }, 5000);
      }, 3000);
    }, 1500);

    // Clean up
    return () => clearTimeout(timeoutId);
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
