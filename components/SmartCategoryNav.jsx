import React, { useState } from "react";
import Link from "next/link";

/**
 * Smart Category Navigation
 * Shows 8 main categories with dropdown subcategories
 * Keeps all 24 categories accessible for filtering
 */

// Category hierarchy configuration
const CATEGORY_HIERARCHY = [
  {
    name: "Technology",
    slug: "technology",
    subcategories: [
      { name: "Tech", slug: "tech" },
      { name: "Science", slug: "science" },
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    subcategories: [
      { name: "Games", slug: "games" },
      { name: "Esports", slug: "esports" },
    ],
  },
  {
    name: "Movies & TV",
    slug: "movies-tv",
    subcategories: [
      { name: "Movies", slug: "movies" },
      { name: "TV Shows", slug: "tv-shows" },
    ],
  },
  {
    name: "Superheroes",
    slug: "superheroes",
    subcategories: [
      { name: "Marvel", slug: "marvel" },
      { name: "DC", slug: "dc" },
      { name: "Superhero", slug: "superhero" },
    ],
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    subcategories: [
      { name: "Celebrity News", slug: "celebrity-news" },
      { name: "Music", slug: "music" },
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    subcategories: [
      { name: "Cricket", slug: "cricket" },
      { name: "IPL", slug: "ipl" },
      { name: "Chess", slug: "chess" },
    ],
  },
  {
    name: "Business",
    slug: "business",
    subcategories: [
      { name: "Finance", slug: "finance" },
      { name: "Education", slug: "education" },
    ],
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    subcategories: [],
  },
];

const SmartCategoryNav = ({ activeCategory = null }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <ul className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {CATEGORY_HIERARCHY.map((category) => (
            <li
              key={category.slug}
              className="relative group"
              onMouseEnter={() => setHoveredCategory(category.slug)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Main Category Link */}
              <Link
                href={`/category/${category.slug}`}
                className={`
                  block px-4 py-3 text-sm font-medium transition-colors duration-200
                  whitespace-nowrap
                  ${
                    activeCategory === category.slug
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  }
                `}
              >
                {category.name}
                {category.subcategories.length > 0 && (
                  <svg
                    className="inline-block ml-1 w-4 h-4"
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
                )}
              </Link>

              {/* Subcategory Dropdown */}
              {category.subcategories.length > 0 && (
                <div
                  className={`
                    absolute left-0 mt-0 w-48 bg-white dark:bg-gray-800 
                    rounded-md shadow-lg border border-gray-200 dark:border-gray-700
                    transition-all duration-200 z-50
                    ${
                      hoveredCategory === category.slug
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }
                  `}
                >
                  <div className="py-2">
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/category/${subcategory.slug}`}
                        className="
                          block px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                          hover:bg-gray-100 dark:hover:bg-gray-700
                          hover:text-blue-600 dark:hover:text-blue-400
                          transition-colors duration-150
                        "
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
};

export default SmartCategoryNav;
