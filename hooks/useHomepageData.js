/**
 * Unified homepage data loading hook
 * Consolidates all homepage API calls to prevent multiple requests
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getDirectCategories,
  getDirectFeaturedPosts,
  getDirectRecentPosts,
} from "../services/direct-api";
import { getPostsPaginated } from "../services/pagination";

export const useHomepageData = () => {
  // State for all homepage data
  const [data, setData] = useState({
    mainPosts: [],
    featuredPosts: [],
    recentPosts: [],
    categories: [],
  });

  const [loading, setLoading] = useState({
    mainPosts: true,
    featuredPosts: true,
    recentPosts: true,
    categories: true,
  });

  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Pagination state for main posts
  const [pagination, setPagination] = useState({
    hasMore: true,
    endCursor: null,
    totalCount: 0,
  });

  /**
   * Load all homepage data in a single coordinated call
   */
  const loadHomepageData = useCallback(async () => {
    if (isInitialized) return; // Prevent multiple calls

    if (process.env.NODE_ENV === "development") {
      console.log("🚀 [HomepageData] Loading all homepage data...");
    }

    try {
      // Load all data in parallel but with proper coordination
      const [
        mainPostsResult,
        featuredPostsResult,
        recentPostsResult,
        categoriesResult,
      ] = await Promise.allSettled([
        getPostsPaginated({ first: 7, after: null, fields: "full" }),
        getDirectFeaturedPosts(),
        getDirectRecentPosts(),
        getDirectCategories(),
      ]);

      // Process main posts result
      if (mainPostsResult.status === "fulfilled") {
        setData((prev) => ({
          ...prev,
          mainPosts: mainPostsResult.value.posts || [],
        }));
        setPagination({
          hasMore: mainPostsResult.value.pageInfo?.hasNextPage || false,
          endCursor: mainPostsResult.value.pageInfo?.endCursor || null,
          totalCount: mainPostsResult.value.totalCount || 0,
        });
        setLoading((prev) => ({ ...prev, mainPosts: false }));
      } else {
        setErrors((prev) => ({ ...prev, mainPosts: mainPostsResult.reason }));
        setLoading((prev) => ({ ...prev, mainPosts: false }));
      }

      // Process featured posts result
      if (featuredPostsResult.status === "fulfilled") {
        setData((prev) => ({
          ...prev,
          featuredPosts: featuredPostsResult.value || [],
        }));
        setLoading((prev) => ({ ...prev, featuredPosts: false }));
      } else {
        setErrors((prev) => ({
          ...prev,
          featuredPosts: featuredPostsResult.reason,
        }));
        setLoading((prev) => ({ ...prev, featuredPosts: false }));
      }

      // Process recent posts result
      if (recentPostsResult.status === "fulfilled") {
        setData((prev) => ({
          ...prev,
          recentPosts: recentPostsResult.value || [],
        }));
        setLoading((prev) => ({ ...prev, recentPosts: false }));
      } else {
        setErrors((prev) => ({
          ...prev,
          recentPosts: recentPostsResult.reason,
        }));
        setLoading((prev) => ({ ...prev, recentPosts: false }));
      }

      // Process categories result
      if (categoriesResult.status === "fulfilled") {
        setData((prev) => ({
          ...prev,
          categories: categoriesResult.value || [],
        }));
        setLoading((prev) => ({ ...prev, categories: false }));
      } else {
        setErrors((prev) => ({ ...prev, categories: categoriesResult.reason }));
        setLoading((prev) => ({ ...prev, categories: false }));
      }

      setIsInitialized(true);
      if (process.env.NODE_ENV === "development") {
        console.log("✅ [HomepageData] All homepage data loaded");
      }
    } catch (error) {
      console.error("❌ [HomepageData] Error loading homepage data:", error);

      // Set all loading to false on error
      setLoading({
        mainPosts: false,
        featuredPosts: false,
        recentPosts: false,
        categories: false,
      });

      setErrors({ general: error });
    }
  }, [isInitialized]);

  /**
   * Load more main posts (for infinite scroll)
   */
  const loadMoreMainPosts = useCallback(async () => {
    if (!pagination.hasMore || !pagination.endCursor || loading.mainPosts)
      return;

    try {
      setLoading((prev) => ({ ...prev, mainPosts: true }));

      const result = await getPostsPaginated({
        first: 3,
        after: pagination.endCursor,
        fields: "full",
      });

      // Append new posts, avoiding duplicates
      setData((prev) => {
        const existingSlugs = new Set(
          prev.mainPosts.map((post) => post.node.slug)
        );
        const newPosts = result.posts.filter(
          (post) => !existingSlugs.has(post.node.slug)
        );

        return {
          ...prev,
          mainPosts: [...prev.mainPosts, ...newPosts],
        };
      });

      setPagination({
        hasMore: result.pageInfo?.hasNextPage || false,
        endCursor: result.pageInfo?.endCursor || null,
        totalCount: result.totalCount || pagination.totalCount,
      });
    } catch (error) {
      console.error("Error loading more main posts:", error);
      setErrors((prev) => ({ ...prev, mainPosts: error }));
    } finally {
      setLoading((prev) => ({ ...prev, mainPosts: false }));
    }
  }, [pagination, loading.mainPosts]);

  /**
   * Refresh all homepage data
   */
  const refresh = useCallback(async () => {
    setIsInitialized(false);
    setData({
      mainPosts: [],
      featuredPosts: [],
      recentPosts: [],
      categories: [],
    });
    setLoading({
      mainPosts: true,
      featuredPosts: true,
      recentPosts: true,
      categories: true,
    });
    setErrors({});
    setPagination({
      hasMore: true,
      endCursor: null,
      totalCount: 0,
    });

    await loadHomepageData();
  }, [loadHomepageData]);

  // Initialize data loading on mount
  useEffect(() => {
    loadHomepageData();
  }, [loadHomepageData]);

  // Computed values
  const isAnyLoading = Object.values(loading).some(Boolean);
  const hasAnyError = Object.keys(errors).length > 0;
  const isFullyLoaded = isInitialized && !isAnyLoading;

  return useMemo(() => ({
    // Data
    data,

    // Loading states
    loading,
    isAnyLoading,
    isFullyLoaded,

    // Error states
    errors,
    hasAnyError,

    // Pagination
    pagination,

    // Actions
    loadMoreMainPosts,
    refresh,

    // Computed values
    mainPostsCount: data.mainPosts.length,
    canLoadMore: pagination.hasMore && !loading.mainPosts,
  }), [
    data,
    loading,
    isAnyLoading,
    isFullyLoaded,
    errors,
    hasAnyError,
    pagination,
    loadMoreMainPosts,
    refresh
  ]);
};
