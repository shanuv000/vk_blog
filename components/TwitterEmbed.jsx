import React, { useState, useEffect } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";

const TwitterEmbed = ({ tweetId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Validate tweet ID format
  const isValidTweetId =
    tweetId && /^\d+$/.test(tweetId.trim()) && tweetId.trim().length > 8;

  // Skip if no tweet ID or invalid format
  if (!isValidTweetId) {
    return (
      <div className="my-6 p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
        <p className="text-gray-500">Invalid tweet ID: {tweetId}</p>
      </div>
    );
  }

  // Clean the tweet ID (remove any whitespace)
  const cleanTweetId = tweetId.trim();

  // Set a timeout to handle cases where the tweet doesn't load
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log(`Tweet ${cleanTweetId} failed to load after timeout`);
        setError(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [cleanTweetId, loading]);

  // If we've hit an error after timeout
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

  return (
    <div className="my-6">
      <div className="twitter-tweet-container flex justify-center items-center">
        <TwitterTweetEmbed
          tweetId={cleanTweetId}
          options={{
            theme: "light",
            align: "center",
            dnt: true,
            cards: "hidden",
            conversation: "none",
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
            console.log(`Tweet ${cleanTweetId} loaded successfully`);
            setLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default TwitterEmbed;
