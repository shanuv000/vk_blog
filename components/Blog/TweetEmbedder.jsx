import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import TwitterEmbed from "./TwitterEmbed";

const TweetEmbedder = () => {
  useEffect(() => {
    // Always check if SocialMediaEmbedder is active first
    const checkForSocialMediaEmbedder = () => {
      // Check for existing social embeds or processed blockquotes
      const socialEmbeds = document.querySelectorAll("[data-social-embed-id]");
      const processedBlockquotes = document.querySelectorAll(
        'blockquote[data-processed="true"]'
      );

      return socialEmbeds.length > 0 || processedBlockquotes.length > 0;
    };

    // Periodic check to see if SocialMediaEmbedder becomes active
    const checkInterval = setInterval(() => {
      if (checkForSocialMediaEmbedder()) {
        console.log(
          "TweetEmbedder: SocialMediaEmbedder detected, remaining passive"
        );
        clearInterval(checkInterval);
        return;
      }
    }, 1000);

    // Initial check - if SocialMediaEmbedder is already active, don't process
    if (checkForSocialMediaEmbedder()) {
      console.log(
        "TweetEmbedder: SocialMediaEmbedder is already active, remaining passive"
      );
      clearInterval(checkInterval);
      return;
    }

    // Clean up interval after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);

    // Load Twitter widget script only if we need to process embeds
    const loadTwitterScript = () => {
      if (window.twttr) return Promise.resolve();

      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.setAttribute("src", "https://platform.twitter.com/widgets.js");
        script.setAttribute("charset", "utf-8");
        script.setAttribute("async", "true");
        script.onload = resolve;
        script.onerror = () => {
          console.error("Failed to load Twitter widgets script");
          resolve(); // Still resolve to prevent hanging
        };
        document.head.appendChild(script);
      });
    };

    // Function to process blockquotes and social embeds
    const processTweetEmbeds = async () => {
      try {
        // Load Twitter script first
        await loadTwitterScript();

        // Check if SocialMediaEmbedder is already handling embeds
        const existingSocialEmbeds = document.querySelectorAll(
          "[data-social-embed-id]"
        );
        if (existingSocialEmbeds.length > 0) {
          console.log(
            `TweetEmbedder: SocialMediaEmbedder is active (${existingSocialEmbeds.length} embeds), skipping processing to avoid conflicts`
          );
          return;
        }

        // Find blockquotes that haven't been processed by any system
        // Check for both data-processed (SocialMediaEmbedder) and data-embed-processed (RichTextRenderer)
        const blockquotes = document.querySelectorAll(
          "blockquote:not([data-processed]):not([data-embed-processed]):not(.twitter-tweet)"
        );
        const processedElements = [];

        console.log(
          `TweetEmbedder: Found ${blockquotes.length} unprocessed blockquotes`
        );

        blockquotes.forEach((blockquote, index) => {
          const text = blockquote.textContent.trim();

          // Check if the blockquote contains only a numeric tweet ID (15-20 digits)
          const tweetIdMatch = text.match(/^\d{15,20}$/);

          if (tweetIdMatch) {
            const tweetId = tweetIdMatch[0];
            console.log(`TweetEmbedder: Processing tweet ID ${tweetId}`);

            // Mark blockquote as processed to prevent other systems from processing it
            blockquote.setAttribute("data-processed", "true");
            blockquote.setAttribute("data-embed-processed", "true");

            // Create a container for the Twitter embed
            const embedContainer = document.createElement("div");
            embedContainer.className =
              "tweet-embed-wrapper my-3 sm:my-4 md:my-6";
            embedContainer.setAttribute("data-tweet-id", tweetId);
            embedContainer.setAttribute("data-processed", "true");

            // Replace the blockquote with the embed container
            blockquote.parentNode.replaceChild(embedContainer, blockquote);

            // Create React root and render TwitterEmbed component
            try {
              const root = createRoot(embedContainer);
              root.render(React.createElement(TwitterEmbed, { tweetId }));

              console.log(
                `TweetEmbedder: Successfully rendered TwitterEmbed for ${tweetId}`
              );
            } catch (error) {
              console.error(
                `TweetEmbedder: Failed to render TwitterEmbed for ${tweetId}:`,
                error
              );

              // Fallback to native Twitter embed
              embedContainer.innerHTML = `
                <div class="twitter-fallback-container">
                  <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
                    <a href="https://twitter.com/i/status/${tweetId}"></a>
                  </blockquote>
                </div>
              `;

              // Load Twitter widgets for the fallback
              if (window.twttr && window.twttr.widgets) {
                window.twttr.widgets.load(embedContainer);
              }
            }

            processedElements.push({
              container: embedContainer,
              tweetId,
              originalElement: blockquote,
            });
          }
        });

        // Process Hygraph social embeds that haven't been processed
        const socialEmbeds = document.querySelectorAll(
          '[data-embed-type="social"]:not([data-processed])'
        );

        console.log(
          `TweetEmbedder: Found ${socialEmbeds.length} unprocessed social embeds`
        );

        socialEmbeds.forEach((embed) => {
          const url = embed.getAttribute("data-url");
          const platform = embed.getAttribute("data-platform");

          if (platform === "twitter" && url) {
            // Extract tweet ID from URL
            const tweetIdMatch = url.match(/status\/(\d+)/);

            if (tweetIdMatch) {
              const tweetId = tweetIdMatch[1];
              console.log(
                `TweetEmbedder: Processing social embed tweet ID ${tweetId}`
              );

              // Mark social embed as processed
              embed.setAttribute("data-processed", "true");

              // Create container for Twitter embed
              const embedContainer = document.createElement("div");
              embedContainer.className =
                "tweet-embed-wrapper my-3 sm:my-4 md:my-6";
              embedContainer.setAttribute("data-tweet-id", tweetId);
              embedContainer.setAttribute("data-processed", "true");

              // Replace the social embed with Twitter embed
              embed.parentNode.replaceChild(embedContainer, embed);

              // Create React root and render TwitterEmbed component
              try {
                const root = createRoot(embedContainer);
                root.render(React.createElement(TwitterEmbed, { tweetId }));

                console.log(
                  `TweetEmbedder: Successfully rendered social TwitterEmbed for ${tweetId}`
                );
              } catch (error) {
                console.error(
                  `TweetEmbedder: Failed to render social TwitterEmbed for ${tweetId}:`,
                  error
                );

                // Fallback to native Twitter embed
                embedContainer.innerHTML = `
                  <div class="twitter-fallback-container">
                    <blockquote class="twitter-tweet" data-dnt="true" data-theme="light">
                      <a href="https://twitter.com/i/status/${tweetId}"></a>
                    </blockquote>
                  </div>
                `;

                // Load Twitter widgets for the fallback
                if (window.twttr && window.twttr.widgets) {
                  window.twttr.widgets.load(embedContainer);
                }
              }

              processedElements.push({
                container: embedContainer,
                tweetId,
                originalElement: embed,
              });
            }
          }
        });

        // Load Twitter widgets for any remaining native Twitter embeds
        if (window.twttr && window.twttr.widgets) {
          try {
            await window.twttr.widgets.load();
          } catch (error) {
            console.error("Error loading Twitter widgets:", error);
          }
        }

        console.log(
          `TweetEmbedder processed ${processedElements.length} tweet embeds`
        );
      } catch (error) {
        console.error("Error processing tweet embeds:", error);
      }
    };

    // Process embeds after DOM is ready
    const timeoutId = setTimeout(() => {
      processTweetEmbeds();
    }, 1000); // Wait 1 second for DOM to be fully loaded

    // Also process on DOM content loaded if not already loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", processTweetEmbeds);
    }

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("DOMContentLoaded", processTweetEmbeds);
    };
  }, []);

  // This component doesn't render anything visible
  return <div className="tweet-embedder-container hidden" />;
};

export default TweetEmbedder;
