/**
 * Premium Mobile-optimized Pagination Component
 * Provides responsive pagination with SEO-friendly navigation and premium aesthetics
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Pagination Component
 * @param {Object} props - Component props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {boolean} props.showPageInfo - Show "Page X of Y" text
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  showPageInfo = true,
}) => {
  const router = useRouter();

  // Don't render if only one page
  if (totalPages <= 1) return null;

  /**
   * Generate page URL - uses /page/N format for pages 2+
   */
  const getPageUrl = (page) => {
    if (page === 1) return "/";
    return `/page/${page}`;
  };

  /**
   * Generate page numbers to display
   * Shows: 1 ... 4 5 [6] 7 8 ... 15
   */
  const getVisiblePages = () => {
    const pages = [];
    const delta = 2; // Pages to show on each side of current

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("...");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Pagination"
      className="relative mt-12 mb-4"
    >
      {/* Premium container with gradient border */}
      <div className="relative bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl p-[1px]">
        <div className="bg-secondary/80 backdrop-blur-sm rounded-2xl px-4 py-6 sm:px-8 sm:py-8">
          
          {/* Page info with premium styling */}
          {showPageInfo && (
            <div className="text-center mb-6">
              <p className="text-sm text-text-secondary tracking-wide">
                Showing page{" "}
                <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 font-bold text-white bg-gradient-to-r from-primary to-primary-light rounded-md shadow-sm">
                  {currentPage}
                </span>
                {" "}of{" "}
                <span className="font-semibold text-text-primary">{totalPages}</span>
              </p>
            </div>
          )}

          {/* Mobile: Premium compact pagination */}
          <div className="flex items-center justify-center gap-4 md:hidden">
            {/* Previous button - Mobile */}
            {currentPage > 1 ? (
              <Link
                href={getPageUrl(currentPage - 1)}
                className="group flex items-center gap-2 px-5 py-3 text-sm font-semibold text-text-primary bg-secondary hover:bg-secondary-light rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-x-0.5"
                aria-label="Go to previous page"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-text-secondary/50 bg-secondary/30 rounded-xl border border-border/50 cursor-not-allowed">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </span>
            )}

            {/* Next button - Mobile */}
            {currentPage < totalPages ? (
              <Link
                href={getPageUrl(currentPage + 1)}
                className="group flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 ease-out hover:translate-x-0.5"
                aria-label="Go to next page"
              >
                Next
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-text-secondary/50 bg-secondary/30 rounded-xl cursor-not-allowed">
                Next
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
          </div>

          {/* Desktop: Premium full pagination with page numbers */}
          <div className="hidden md:flex items-center justify-center gap-3">
            {/* Previous button - Desktop */}
            {currentPage > 1 ? (
              <Link
                href={getPageUrl(currentPage - 1)}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-primary bg-secondary hover:bg-secondary-light rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 ease-out hover:-translate-x-0.5"
                aria-label="Go to previous page"
              >
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden lg:inline">Previous</span>
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-secondary/50 bg-secondary/30 rounded-xl border border-border/50 cursor-not-allowed">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="hidden lg:inline">Previous</span>
              </span>
            )}

            {/* Page numbers with premium styling */}
            <div className="flex items-center gap-1.5 px-2">
              {visiblePages.map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 py-2 text-text-secondary/60 font-medium"
                      aria-hidden="true"
                    >
                      •••
                    </span>
                  );
                }

                const isCurrentPage = page === currentPage;

                return isCurrentPage ? (
                  <span
                    key={page}
                    className="relative min-w-[44px] h-11 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-primary via-primary to-primary-light rounded-xl shadow-lg shadow-primary/30"
                    aria-current="page"
                    aria-label={`Current page, page ${page}`}
                  >
                    {/* Glow effect */}
                    <span className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10" />
                    {page}
                  </span>
                ) : (
                  <Link
                    key={page}
                    href={getPageUrl(page)}
                    className="min-w-[44px] h-11 flex items-center justify-center text-sm font-semibold text-text-primary bg-secondary hover:bg-secondary-light rounded-xl border border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                    aria-label={`Go to page ${page}`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>

            {/* Next button - Desktop */}
            {currentPage < totalPages ? (
              <Link
                href={getPageUrl(currentPage + 1)}
                className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 ease-out hover:translate-x-0.5"
                aria-label="Go to next page"
              >
                <span className="hidden lg:inline">Next</span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-secondary/50 bg-secondary/30 rounded-xl cursor-not-allowed">
                <span className="hidden lg:inline">Next</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
          </div>

          {/* Quick jump for many pages - Premium select dropdown */}
          {totalPages > 10 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-border/50">
              <label htmlFor="page-jump" className="text-sm text-text-secondary font-medium">
                Jump to:
              </label>
              <div className="relative">
                <select
                  id="page-jump"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value, 10);
                    router.push(getPageUrl(page));
                  }}
                  className="appearance-none pl-4 pr-10 py-2.5 text-sm font-semibold bg-secondary border border-border rounded-xl text-text-primary shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-pointer"
                  aria-label="Jump to page"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <option key={page} value={page}>
                      Page {page}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative gradient line at bottom */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent rounded-full" />
    </nav>
  );
};

export default Pagination;
