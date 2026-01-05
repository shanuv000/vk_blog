/**
 * useSearch Hook
 * Custom React hook for blog search functionality
 * Handles debounced API calls with loading and error states
 */

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to search blog posts
 * @param {string} query - Search query string
 * @param {Object} options - Search options
 * @param {number} options.limit - Max results to return (default: 10)
 * @param {number} options.debounceMs - Debounce delay in ms (default: 300)
 * @param {boolean} options.enabled - Whether to enable search (default: true)
 */
export function useSearch(query, options = {}) {
  const { 
    limit = 10, 
    debounceMs = 300,
    enabled = true 
  } = options;

  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const search = useCallback(async (searchQuery) => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't search if query is too short
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setTotalCount(0);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=${limit}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.posts || []);
      setTotalCount(data.totalCount || 0);
      setError(null);
    } catch (err) {
      // Ignore abort errors
      if (err.name === "AbortError") {
        return;
      }
      console.error("[useSearch] Error:", err);
      setError(err.message);
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Debounced search effect
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set loading state immediately for better UX
    if (query && query.trim().length >= 2) {
      setLoading(true);
    }

    // Debounce the actual search
    timeoutRef.current = setTimeout(() => {
      search(query);
    }, debounceMs);

    // Cleanup on unmount or query change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, enabled, search]);

  // Immediate search function (no debounce)
  const searchImmediate = useCallback((searchQuery) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    search(searchQuery);
  }, [search]);

  // Clear search results
  const clearSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResults([]);
    setTotalCount(0);
    setError(null);
    setLoading(false);
  }, []);

  return {
    results,
    totalCount,
    loading,
    error,
    search: searchImmediate,
    clearSearch,
  };
}

export default useSearch;
