import React, { useState, useEffect } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import TwitterPost from "../TwitterPost";

const TwitterEmbed = ({ tweetId, useApiVersion = true }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useLegacy, setUseLegacy] = useState(!useApiVersion);

  // Clean and validate the tweet ID
  const cleanTweetId = tweetId ? tweetId.toString().trim() : "";
  const isValidTweetId =
    cleanTweetId && /^\d+$/.test(cleanTweetId) && cleanTweetId.length > 8;

  useEffect(() => {
    if (!isValidTweetId) {
      setLoading(false);
      setError(true);
    }
  }, [isValidTweetId]);

  const handleApiError = () => {
    console.warn(`TwitterEmbed: API version failed for ${cleanTweetId}, falling back to legacy`);
    setUseLegacy(true);
    setLoading(false);
  };

  // Skip if no tweet ID or invalid format
  if (!isValidTweetId) {
    if (process.env.NODE_ENV === "development") {
      console.error("TwitterEmbed: Invalid tweet ID", {
        original: tweetId,
        cleaned: cleanTweetId,
      });
    }
    return null;
  }

  // Legacy/Fallback mode using react-twitter-embed
  if (useLegacy) {
    return (
      <div className="twitter-embed-root my-4 w-full flex justify-center">
        <div className="twitter-tweet-container w-full max-w-[550px]">
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
              <div className="animate-pulse flex flex-col items-center justify-center p-4 w-full min-h-[200px] bg-gray-50 rounded-lg border border-gray-100">
                <div className="h-8 bg-gray-200 rounded-full w-8 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4 max-w-xs mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2 max-w-48" />
              </div>
            }
            onLoad={() => setLoading(false)}
            onError={(err) => {
              console.error("TwitterEmbed: Legacy embed failed", err);
              setError(true);
              setLoading(false);
            }}
          />
          {error && (
             <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500">
               <p>Unable to load tweet.</p>
               <a 
                 href={`https://twitter.com/i/status/${cleanTweetId}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-blue-500 hover:underline mt-1 inline-block"
               >
                 View on Twitter
               </a>
             </div>
          )}
        </div>
      </div>
    );
  }

  // Primary mode: Custom TwitterPost component
  return (
    <div className="twitter-embed-root my-4 w-full flex justify-center">
      <div className="twitter-tweet-container w-full max-w-[550px]">
        <TwitterPost 
          tweetId={cleanTweetId} 
          variant="inline" 
          onError={handleApiError}
        />
      </div>
    </div>
  );
};

export default TwitterEmbed;
