/**
 * Category Hierarchy Management
 * Utilities for working with parent-child category relationships
 */

export const CATEGORY_HIERARCHY = [
  {
    name: "Technology",
    slug: "technology",
    icon: "💻",
    color: "#3B82F6",
    subcategories: [
      { name: "Tech", slug: "tech" },
      { name: "Science", slug: "science" },
    ],
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: "🎮",
    color: "#8B5CF6",
    subcategories: [
      { name: "Games", slug: "games" },
      { name: "Esports", slug: "esports" },
    ],
  },
  {
    name: "Movies & TV",
    slug: "movies-tv",
    icon: "🎬",
    color: "#EF4444",
    subcategories: [
      { name: "Movies", slug: "movies" },
      { name: "TV Shows", slug: "tv-shows" },
    ],
  },
  {
    name: "Superheroes",
    slug: "superheroes",
    icon: "🦸",
    color: "#DC2626",
    subcategories: [
      { name: "Marvel", slug: "marvel" },
      { name: "DC", slug: "dc" },
      { name: "Superhero", slug: "superhero" },
    ],
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    icon: "🌟",
    color: "#EC4899",
    subcategories: [
      { name: "Celebrity News", slug: "celebrity-news" },
      { name: "Music", slug: "music" },
    ],
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "⚽",
    color: "#10B981",
    subcategories: [
      { name: "Cricket", slug: "cricket" },
      { name: "IPL", slug: "ipl" },
      { name: "Chess", slug: "chess" },
    ],
  },
  {
    name: "Business",
    slug: "business",
    icon: "💼",
    color: "#F59E0B",
    subcategories: [
      { name: "Finance", slug: "finance" },
      { name: "Education", slug: "education" },
    ],
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    icon: "✨",
    color: "#06B6D4",
    subcategories: [],
  },
];

/**
 * Get parent category for a given category slug
 */
export function getParentCategory(categorySlug) {
  // First check if it's already a parent
  const directMatch = CATEGORY_HIERARCHY.find(
    (cat) => cat.slug === categorySlug
  );
  if (directMatch) {
    return directMatch;
  }

  // Check if it's a subcategory
  for (const parent of CATEGORY_HIERARCHY) {
    const isSubcategory = parent.subcategories.some(
      (sub) => sub.slug === categorySlug
    );
    if (isSubcategory) {
      return parent;
    }
  }

  return null;
}

/**
 * Get all category slugs (parent + children) for a parent category
 */
export function getAllCategorySlugs(parentSlug) {
  const parent = CATEGORY_HIERARCHY.find((cat) => cat.slug === parentSlug);
  if (!parent) return [parentSlug];

  return [parent.slug, ...parent.subcategories.map((sub) => sub.slug)];
}

/**
 * Check if a category slug is a parent category
 */
export function isParentCategory(categorySlug) {
  return CATEGORY_HIERARCHY.some((cat) => cat.slug === categorySlug);
}

/**
 * Get category display info (name, icon, color)
 */
export function getCategoryInfo(categorySlug) {
  // Check if it's a parent
  const parent = CATEGORY_HIERARCHY.find((cat) => cat.slug === categorySlug);
  if (parent) {
    return {
      name: parent.name,
      slug: parent.slug,
      icon: parent.icon,
      color: parent.color,
      isParent: true,
    };
  }

  // Check if it's a subcategory
  for (const parentCat of CATEGORY_HIERARCHY) {
    const subcategory = parentCat.subcategories.find(
      (sub) => sub.slug === categorySlug
    );
    if (subcategory) {
      return {
        name: subcategory.name,
        slug: subcategory.slug,
        icon: parentCat.icon,
        color: parentCat.color,
        isParent: false,
        parent: parentCat,
      };
    }
  }

  return null;
}

/**
 * Get breadcrumb for category page
 */
export function getCategoryBreadcrumb(categorySlug) {
  const info = getCategoryInfo(categorySlug);
  if (!info) return [];

  if (info.isParent) {
    return [
      { name: "Home", href: "/" },
      { name: info.name, href: `/category/${info.slug}` },
    ];
  } else {
    return [
      { name: "Home", href: "/" },
      { name: info.parent.name, href: `/category/${info.parent.slug}` },
      { name: info.name, href: `/category/${info.slug}` },
    ];
  }
}

/**
 * Get all parent categories (for navigation)
 */
export function getParentCategories() {
  return CATEGORY_HIERARCHY.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    color: cat.color,
    subcategoryCount: cat.subcategories.length,
  }));
}

/**
 * Filter posts by category (including subcategories)
 * Use this to show all posts from a parent category AND its children
 */
export function filterPostsByCategory(posts, categorySlug) {
  const allSlugs = getAllCategorySlugs(categorySlug);

  return posts.filter((post) =>
    post.categories?.some((cat) => allSlugs.includes(cat.slug))
  );
}

/**
 * Get suggested categories for a post based on keywords
 */
export function suggestCategories(title, excerpt, existingCategories = []) {
  const text = `${title} ${excerpt}`.toLowerCase();
  const suggestions = [];

  CATEGORY_HIERARCHY.forEach((parent) => {
    const keywords = [parent.name.toLowerCase()];

    // Add subcategory names as keywords
    parent.subcategories.forEach((sub) => {
      keywords.push(sub.name.toLowerCase());
    });

    // Check if any keyword matches
    if (keywords.some((keyword) => text.includes(keyword))) {
      // Check if not already assigned
      if (
        !existingCategories.some(
          (cat) =>
            cat.slug === parent.slug ||
            parent.subcategories.some((sub) => sub.slug === cat.slug)
        )
      ) {
        suggestions.push(parent);
      }
    }
  });

  return suggestions;
}

export default {
  CATEGORY_HIERARCHY,
  getParentCategory,
  getAllCategorySlugs,
  isParentCategory,
  getCategoryInfo,
  getCategoryBreadcrumb,
  getParentCategories,
  filterPostsByCategory,
  suggestCategories,
};
