import React, { useState, useEffect } from "react";
import TwitterPost from "./TwitterPost";

const TwitterUserFeed = ({ username, count = 5, className = "" }) => {
  const [tweets, setTweets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserTweets = async () => {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/twitter/user/${username}?count=${count}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tweets");
        }

        setTweets(data.data.tweets || []);
        setUser(data.data.user);
      } catch (err) {
        console.error("Error fetching user tweets:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTweets();
  }, [username, count]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`border border-red-200 rounded-lg p-4 bg-red-50 ${className}`}
      >
        <div className="text-red-600">
          <h3 className="font-medium mb-1">Failed to load Twitter feed</h3>
          <p className="text-sm">{error}</p>
          <a
            href={`https://twitter.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            View @{username} on Twitter
          </a>
        </div>
      </div>
    );
  }

  if (tweets.length === 0) {
    return (
      <div
        className={`border border-gray-200 rounded-lg p-4 bg-gray-50 text-center ${className}`}
      >
        <p className="text-gray-500">No tweets found for @{username}</p>
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline mt-2 inline-block"
        >
          View @{username} on Twitter
        </a>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Header */}
      {user && (
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            {user.profile_image_url && (
              <img
                src={user.profile_image_url}
                alt={`${user.name} profile`}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                {user.verified && (
                  <svg
                    className="w-5 h-5 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                )}
              </div>
              <p className="text-gray-600">@{user.username}</p>
              {user.description && (
                <p className="text-gray-700 mt-1 text-sm">{user.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tweets */}
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <TwitterPost key={tweet.id} tweetId={tweet.id} />
        ))}
      </div>

      {/* View More Link */}
      <div className="text-center">
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          View more tweets from @{username}
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default TwitterUserFeed;
