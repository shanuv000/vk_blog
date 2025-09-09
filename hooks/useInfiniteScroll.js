import { useState, useCallback } from "react";
import {
  getPostsPaginated,
  getCategoryPostsPaginated,
} from "../services/pagination";

/**
 * Custom hook for infinite scroll functionality
 * @param {Object} options - Configuration options
 * @param {string} options.type - Type of posts to fetch ('homepage' or 'category')
 * @param {string} options.categorySlug - Category slug (required if type is 'category')
 * @param {number} options.initialCount - Initial number of posts to load (default: 7)
 * @param {number} options.loadMoreCount - Number of posts to load on each subsequent fetch (default: 3)
 * @returns {Object} - Hook state and functions
 */
export const useInfiniteScroll = (options = {}) => {
  const {
    type = "homepage",
    categorySlug = null,
    initialCount = 7,
    loadMoreCount = 3,
  } = options;

  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [endCursor, setEndCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /**
   * Load initial posts
   */
  const loadInitialPosts = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      let result;

      if (type === "category" && categorySlug) {
        result = await getCategoryPostsPaginated(categorySlug, {
          first: initialCount,
          after: null,
        });
      } else {
        result = await getPostsPaginated({
          first: initialCount,
          after: null,
          fields: "full",
        });
      }

      console.log(
        "loadInitialPosts result:",
        result.posts?.length,
        "posts loaded"
      ); // Debug log

      setPosts(result.posts);
      setHasMore(result.pageInfo.hasNextPage);
      setEndCursor(result.pageInfo.endCursor);
      setTotalCount(result.totalCount);
      setIsInitialLoad(false);
    } catch (err) {
      console.error("Error loading initial posts:", err);
      setError(err.message || "Failed to load posts");
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [type, categorySlug, initialCount]); // Removed 'loading' dependency

  /**
   * Load more posts for infinite scroll
   */
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore || !endCursor) return;

    setLoading(true);
    setError(null);

    try {
      let result;

      if (type === "category" && categorySlug) {
        result = await getCategoryPostsPaginated(categorySlug, {
          first: loadMoreCount,
          after: endCursor,
        });
      } else {
        result = await getPostsPaginated({
          first: loadMoreCount,
          after: endCursor,
          fields: "full",
        });
      }

      // Append new posts to existing ones, avoiding duplicates
      setPosts((prevPosts) => {
        const existingSlugs = new Set(prevPosts.map((post) => post.node.slug));
        const newPosts = result.posts.filter(
          (post) => !existingSlugs.has(post.node.slug)
        );
        return [...prevPosts, ...newPosts];
      });

      setHasMore(result.pageInfo.hasNextPage);
      setEndCursor(result.pageInfo.endCursor);
    } catch (err) {
      console.error("Error loading more posts:", err);
      setError(err.message || "Failed to load more posts");
    } finally {
      setLoading(false);
    }
  }, [type, categorySlug, loadMoreCount, loading, hasMore, endCursor]);

  /**
   * Reset the hook state (useful for category changes)
   */
  const reset = useCallback(() => {
    setPosts([]);
    setLoading(false);
    setHasMore(true);
    setError(null);
    setEndCursor(null);
    setTotalCount(0);
    setIsInitialLoad(true);
  }, []);

  /**
   * Refresh posts (reload from beginning)
   */
  const refresh = useCallback(async () => {
    reset();
    await loadInitialPosts();
  }, [reset, loadInitialPosts]);

  return {
    // State
    posts,
    loading,
    hasMore,
    error,
    totalCount,
    isInitialLoad,

    // Actions
    loadInitialPosts,
    loadMorePosts,
    reset,
    refresh,

    // Computed values
    postsCount: posts.length,
    canLoadMore: hasMore && !loading,
  };
};
