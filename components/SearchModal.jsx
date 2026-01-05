/**
 * SearchModal Component
 * Command-palette style search modal with keyboard shortcuts
 * Opens with Ctrl+K / Cmd+K
 */

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiClock, FiArrowRight } from "react-icons/fi";
import { useSearch } from "../hooks/useSearch";

// Max recent searches to store
const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = "urtechy_recent_searches";

/**
 * Get recent searches from localStorage
 */
const getRecentSearches = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Save a search to recent searches
 */
const saveRecentSearch = (query) => {
  if (typeof window === "undefined" || !query?.trim()) return;
  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Clear recent searches
 */
const clearRecentSearches = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

const SearchModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const { results, totalCount, loading, error } = useSearch(query, { limit: 5 });

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Clear query when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  // Handle clicking a recent search
  const handleRecentClick = (recentQuery) => {
    setQuery(recentQuery);
    saveRecentSearch(recentQuery);
    router.push(`/search?q=${encodeURIComponent(recentQuery)}`);
    onClose();
  };

  // Handle clicking a search result
  const handleResultClick = (slug) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    router.push(`/post/${slug}`);
    onClose();
  };

  // Handle clearing recent searches
  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            onClick={onClose}
          />

          {/* Modal - Full screen on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 sm:inset-auto sm:inset-x-4 sm:top-[12vh] sm:mx-auto sm:max-w-xl bg-secondary sm:rounded-2xl shadow-2xl sm:border border-border z-[201] flex flex-col"
          >
            {/* Search Input - Mobile optimized */}
            <form onSubmit={handleSubmit} className="relative flex-shrink-0">
              <div className="flex items-center px-4 sm:px-4 border-b border-border">
                <FiSearch className="text-text-secondary w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full px-3 sm:px-4 py-4 sm:py-4 bg-transparent text-text-primary placeholder-text-secondary focus:outline-none text-base sm:text-lg"
                  autoComplete="off"
                  spellCheck="false"
                  enterKeyHint="search"
                />
                {/* Clear query button - larger touch target */}
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-2.5 -mr-1 text-text-secondary hover:text-text-primary active:text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
                {/* Close button - ESC on desktop, X on mobile */}
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-1 p-2.5 sm:p-0 sm:px-2 sm:py-1 text-text-secondary hover:text-text-primary sm:text-xs sm:bg-secondary-light sm:rounded sm:border sm:border-border transition-colors"
                  aria-label="Close search"
                >
                  <FiX className="w-5 h-5 sm:hidden" />
                  <span className="hidden sm:inline">ESC</span>
                </button>
              </div>
            </form>

            {/* Results Container - Scrollable, flex-1 to fill mobile screen */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Loading State */}
              {loading && (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex space-x-3">
                      <div className="w-14 h-14 sm:w-12 sm:h-12 bg-secondary-light rounded-lg" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-secondary-light rounded w-3/4" />
                        <div className="h-3 bg-secondary-light rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="p-8 text-center text-text-secondary">
                  <p className="text-base">Something went wrong.</p>
                  <p className="text-sm mt-1">Please try again.</p>
                </div>
              )}

              {/* Search Results - Mobile optimized touch targets */}
              {!loading && !error && results.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-text-secondary uppercase tracking-wide">
                    Results ({totalCount})
                  </div>
                  {results.map((post) => (
                    <button
                      key={post.slug}
                      onClick={() => handleResultClick(post.slug)}
                      className="w-full px-4 py-4 sm:py-3 flex items-start gap-3 hover:bg-secondary-light active:bg-secondary-light/80 transition-colors text-left"
                    >
                      {post.featuredImage?.url && (
                        <img
                          src={post.featuredImage.url}
                          alt=""
                          className="w-14 h-14 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className="text-text-primary font-medium line-clamp-2 sm:line-clamp-1 text-base sm:text-sm">
                          {post.title}
                        </h4>
                        <p className="text-sm text-text-secondary line-clamp-1 mt-0.5">
                          {post.excerpt}
                        </p>
                        {post.categories?.length > 0 && (
                          <span className="text-xs text-primary mt-1 inline-block">
                            {post.categories[0].name}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  
                  {/* See All Results - Large touch target */}
                  {totalCount > 5 && (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}`}
                      onClick={() => {
                        saveRecentSearch(query.trim());
                        onClose();
                      }}
                      className="w-full px-4 py-4 sm:py-3 flex items-center justify-between text-primary hover:bg-secondary-light active:bg-secondary-light/80 transition-colors font-medium"
                    >
                      <span>See all {totalCount} results</span>
                      <FiArrowRight className="w-5 h-5 sm:w-4 sm:h-4" />
                    </Link>
                  )}
                </div>
              )}

              {/* No Results */}
              {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
                <div className="p-8 text-center text-text-secondary">
                  <p className="text-base">No posts found for "{query}"</p>
                  <p className="text-sm mt-2">Try different keywords</p>
                </div>
              )}

              {/* Recent Searches (when no query) - Large touch targets */}
              {!query && recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                      Recent Searches
                    </span>
                    <button
                      onClick={handleClearRecent}
                      className="px-2 py-1 -mr-2 text-xs text-text-secondary hover:text-primary active:text-primary transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((recentQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentClick(recentQuery)}
                      className="w-full px-4 py-3.5 sm:py-2.5 flex items-center gap-3 hover:bg-secondary-light active:bg-secondary-light/80 transition-colors text-left"
                    >
                      <FiClock className="w-5 h-5 sm:w-4 sm:h-4 text-text-secondary flex-shrink-0" />
                      <span className="text-text-primary text-base sm:text-sm">{recentQuery}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty State (no query, no recent) */}
              {!query && recentSearches.length === 0 && (
                <div className="p-8 text-center text-text-secondary">
                  <FiSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-base">Start typing to search posts</p>
                </div>
              )}
            </div>

            {/* Footer - Keyboard hints hidden on mobile */}
            <div className="flex-shrink-0 px-4 py-3 border-t border-border bg-secondary-dark flex items-center justify-between text-xs text-text-secondary">
              <div className="hidden sm:flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">↵</kbd>
                  to search
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border">esc</kbd>
                  to close
                </span>
              </div>
              <span className="sm:ml-auto">Powered by urTechy</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
