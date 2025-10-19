import React, { useState } from "react";
import Link from "next/link";

/**
 * Mobile Category Menu
 * Expandable accordion for all categories
 */

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

const MobileCategoryMenu = ({ activeCategory = null, onClose }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (slug) => {
    setExpandedCategory(expandedCategory === slug ? null : slug);
  };

  return (
    <div className="lg:hidden">
      <div className="space-y-1 p-4">
        {CATEGORY_HIERARCHY.map((category) => (
          <div
            key={category.slug}
            className="border-b border-gray-200 dark:border-gray-700"
          >
            {/* Main Category */}
            <div className="flex items-center justify-between">
              <Link
                href={`/category/${category.slug}`}
                onClick={onClose}
                className={`
                  flex-1 py-3 text-base font-medium
                  ${
                    activeCategory === category.slug
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                {category.name}
              </Link>

              {/* Expand button for categories with subcategories */}
              {category.subcategories.length > 0 && (
                <button
                  onClick={() => toggleCategory(category.slug)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label={`Toggle ${category.name} subcategories`}
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      expandedCategory === category.slug ? "rotate-180" : ""
                    }`}
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
                </button>
              )}
            </div>

            {/* Subcategories */}
            {category.subcategories.length > 0 && (
              <div
                className={`
                  overflow-hidden transition-all duration-200
                  ${expandedCategory === category.slug ? "max-h-96" : "max-h-0"}
                `}
              >
                <div className="pl-4 pb-2 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.slug}
                      href={`/category/${subcategory.slug}`}
                      onClick={onClose}
                      className="
                        block py-2 text-sm text-gray-600 dark:text-gray-400
                        hover:text-blue-600 dark:hover:text-blue-400
                        transition-colors duration-150
                      "
                    >
                      • {subcategory.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileCategoryMenu;
