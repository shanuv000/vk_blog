import { useState, useEffect } from "react";

/**
 * Hook to fetch a single tweet by ID
 */
export const useTweet = (tweetId) => {
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tweetId) return;

    const fetchTweet = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/twitter/tweet/${tweetId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch tweet");
        }

        setTweet(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTweet();
  }, [tweetId]);

  return { tweet, loading, error };
};

/**
 * Hook to fetch user tweets
 */
export const useUserTweets = (username, count = 10) => {
  const [tweets, setTweets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchUserTweets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/twitter/user/${username}?count=${count}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch user tweets");
        }

        setTweets(data.data.tweets || []);
        setUser(data.data.user);
        setMeta(data.data.meta);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTweets();
  }, [username, count]);

  const refetch = () => {
    if (username) {
      const fetchUserTweets = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(
            `/api/twitter/user/${username}?count=${count}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch user tweets");
          }

          setTweets(data.data.tweets || []);
          setUser(data.data.user);
          setMeta(data.data.meta);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserTweets();
    }
  };

  return { tweets, user, meta, loading, error, refetch };
};

/**
 * Hook to search tweets
 */
export const useTwitterSearch = (query, count = 10) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    if (!query) return;

    const searchTweets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/twitter/search?q=${encodeURIComponent(query)}&count=${count}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to search tweets");
        }

        setTweets(data.data.tweets || []);
        setMeta(data.data.meta);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(searchTweets, 500);
    return () => clearTimeout(timeoutId);
  }, [query, count]);

  const search = (newQuery) => {
    if (!newQuery) return;

    const searchTweets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/twitter/search?q=${encodeURIComponent(newQuery)}&count=${count}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to search tweets");
        }

        setTweets(data.data.tweets || []);
        setMeta(data.data.meta);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    searchTweets();
  };

  return { tweets, meta, loading, error, search };
};
