import React, { useState, useEffect } from "react";

const RateLimitInfo = ({ error, tweetId, onRetry }) => {
  const [timeUntilReset, setTimeUntilReset] = useState(null);

  useEffect(() => {
    if (error && error.includes("Rate limit")) {
      // Try to parse rate limit info from error
      const match = error.match(/resetIn.*?(\d+)/);
      if (match) {
        const resetTime = parseInt(match[1]);
        setTimeUntilReset(resetTime);

        const interval = setInterval(() => {
          setTimeUntilReset((prev) => {
            if (prev <= 1000) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [error]);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "Available now";

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Twitter API Rate Limit Exceeded
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              We've reached the Twitter API rate limit. This tweet will be
              available again in:
            </p>
            <div className="mt-2 font-mono text-lg">
              {timeUntilReset !== null
                ? formatTime(timeUntilReset)
                : "Checking..."}
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={onRetry}
              disabled={timeUntilReset > 0}
              className={`text-sm font-medium ${
                timeUntilReset > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-yellow-800 hover:text-yellow-900 underline"
              }`}
            >
              {timeUntilReset > 0 ? "Please wait..." : "Try Again"}
            </button>
            <a
              href={`https://twitter.com/i/status/${tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
            >
              View on Twitter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimitInfo;
