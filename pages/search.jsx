/**
 * Search Results Page
 * Full search results page at /search?q={query}
 * SSR for SEO compatibility with WebsiteSchema.js
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { useSearch } from "../hooks/useSearch";


// Date formatting utility
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Search Result Card Component
const SearchResultCard = ({ post }) => {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group flex flex-col sm:flex-row gap-4 p-4 bg-secondary rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-200"
    >
      {/* Image */}
      {post.featuredImage?.url && (
        <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={post.featuredImage.url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mb-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-text-secondary text-sm line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Categories */}
          {post.categories?.length > 0 && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              {post.categories[0].name}
            </span>
          )}

          {/* Date */}
          {post.publishedAt && (
            <span className="text-text-tertiary">
              {formatDate(post.publishedAt)}
            </span>
          )}

          {/* Author */}
          {post.author?.name && (
            <span className="text-text-tertiary flex items-center gap-1">
              {post.author.photo?.url && (
                <img
                  src={post.author.photo.url}
                  alt={post.author.name}
                  className="w-5 h-5 rounded-full"
                />
              )}
              {post.author.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

// Loading Skeleton
const SearchSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="animate-pulse flex gap-4 p-4 bg-secondary rounded-xl border border-border">
        <div className="w-48 h-32 bg-secondary-light rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-secondary-light rounded w-3/4" />
          <div className="h-4 bg-secondary-light rounded w-full" />
          <div className="h-4 bg-secondary-light rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default function SearchPage() {
  const router = useRouter();
  const { q: initialQuery } = router.query;
  const [query, setQuery] = useState(initialQuery || "");
  const [page, setPage] = useState(0);
  const RESULTS_PER_PAGE = 10;

  // Update query when URL changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Use search hook with pagination
  const { results, totalCount, loading, error } = useSearch(query, {
    limit: RESULTS_PER_PAGE,
    debounceMs: 300,
    enabled: query.length >= 2,
  });

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`, undefined, { shallow: true });
    }
  };

  // SEO
  const pageTitle = query
    ? `Search results for "${query}" | urTechy Blogs`
    : "Search | urTechy Blogs";
  const pageDescription = query
    ? `Found ${totalCount} results for "${query}" on urTechy Blogs`
    : "Search for articles, tutorials, and more on urTechy Blogs";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <div className="min-h-screen bg-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Search Posts
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-secondary rounded-xl border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <FiSearch className="w-5 h-5 text-text-secondary ml-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for posts..."
                  className="flex-1 px-4 py-4 bg-transparent text-text-primary placeholder-text-secondary focus:outline-none text-lg"
                  autoFocus
                  spellCheck="false"
                />
                <button
                  type="submit"
                  className="px-6 py-2 mr-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Results Count */}
          {query && query.length >= 2 && !loading && (
            <div className="mb-6 text-text-secondary">
              {totalCount === 0 ? (
                <span>No results found for "{query}"</span>
              ) : (
                <span>Found {totalCount} {totalCount === 1 ? 'result' : 'results'} for "{query}"</span>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && <SearchSkeleton />}

          {/* Native Banner Ad - shown when there are results */}


          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-text-secondary mb-4">
                Something went wrong. Please try again.
              </p>
              <button
                onClick={() => router.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search Results */}
          {!loading && !error && results.length > 0 && (
            <div className="space-y-4">
              {results.map((post) => (
                <SearchResultCard key={post.slug} post={post} />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-secondary-light rounded-full flex items-center justify-center">
                <FiSearch className="w-10 h-10 text-text-secondary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                No posts found
              </h2>
              <p className="text-text-secondary mb-6">
                We couldn't find any posts matching "{query}"
              </p>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Using different keywords</li>
                  <li>Checking your spelling</li>
                  <li>Using more general terms</li>
                </ul>
              </div>
            </div>
          )}

          {/* Empty State (no query) */}
          {!query && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-secondary-light rounded-full flex items-center justify-center">
                <FiSearch className="w-10 h-10 text-text-tertiary" />
              </div>
              <p className="text-text-secondary">
                Start typing to search for posts
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
