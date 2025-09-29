/**
 * TinyURL Validation and Migration Utility
 * Provides tools for validating and managing TinyURLs across posts
 */

// Integration date - adjust this to match when you started using TinyURL
export const TINYURL_INTEGRATION_DATE = new Date("2025-09-29T00:00:00Z");

/**
 * Determines if a post should have a TinyURL based on publish date
 * @param {Object} post - Post object with publishedAt or createdAt
 * @returns {boolean} Whether post should have TinyURL
 */
export const shouldHaveTinyUrl = (post) => {
  if (!post) return false;

  const publishedAt = post.publishedAt || post.createdAt;
  if (!publishedAt) return false;

  try {
    const postDate = new Date(publishedAt);
    return postDate >= TINYURL_INTEGRATION_DATE;
  } catch (error) {
    console.warn("Invalid date format in post:", post.slug, publishedAt);
    return false;
  }
};

/**
 * Validates a post's TinyURL eligibility and status
 * @param {Object} post - Post object
 * @returns {Object} Validation result
 */
export const validatePostTinyUrl = (post) => {
  const result = {
    isValid: false,
    isNewPost: false,
    shouldHaveUrl: false,
    hasValidData: false,
    publishDate: null,
    integrationDate: TINYURL_INTEGRATION_DATE.toISOString(),
    reasons: [],
  };

  // Check if post exists
  if (!post) {
    result.reasons.push("Post object is null or undefined");
    return result;
  }

  // Check required fields
  if (!post.slug) {
    result.reasons.push("Post missing slug");
  }
  if (!post.title) {
    result.reasons.push("Post missing title");
  }

  result.hasValidData = !!(post.slug && post.title);

  // Check publish date
  const publishedAt = post.publishedAt || post.createdAt;
  if (publishedAt) {
    try {
      const postDate = new Date(publishedAt);
      result.publishDate = postDate.toISOString();
      result.isNewPost = postDate >= TINYURL_INTEGRATION_DATE;
    } catch (error) {
      result.reasons.push(`Invalid date format: ${publishedAt}`);
    }
  } else {
    result.reasons.push("Post missing publishedAt and createdAt dates");
  }

  result.shouldHaveUrl = result.isNewPost && result.hasValidData;
  result.isValid = result.hasValidData && result.publishDate !== null;

  return result;
};

/**
 * Categorizes posts based on TinyURL eligibility
 * @param {Array} posts - Array of post objects
 * @returns {Object} Categorized posts
 */
export const categorizePosts = (posts) => {
  if (!Array.isArray(posts)) {
    return {
      newPosts: [],
      legacyPosts: [],
      invalidPosts: [],
      total: 0,
    };
  }

  const newPosts = [];
  const legacyPosts = [];
  const invalidPosts = [];

  posts.forEach((post) => {
    const validation = validatePostTinyUrl(post);

    if (!validation.isValid) {
      invalidPosts.push({ post, validation });
    } else if (validation.isNewPost) {
      newPosts.push({ post, validation });
    } else {
      legacyPosts.push({ post, validation });
    }
  });

  return {
    newPosts,
    legacyPosts,
    invalidPosts,
    total: posts.length,
    stats: {
      new: newPosts.length,
      legacy: legacyPosts.length,
      invalid: invalidPosts.length,
      newPercentage:
        posts.length > 0
          ? Math.round((newPosts.length / posts.length) * 100)
          : 0,
    },
  };
};

/**
 * Generates a validation report for all posts
 * @param {Array} posts - Array of post objects
 * @returns {Object} Comprehensive validation report
 */
export const generateValidationReport = (posts) => {
  const categorized = categorizePosts(posts);

  return {
    summary: {
      totalPosts: categorized.total,
      newPosts: categorized.stats.new,
      legacyPosts: categorized.stats.legacy,
      invalidPosts: categorized.stats.invalid,
      integrationDate: TINYURL_INTEGRATION_DATE.toISOString(),
      reportDate: new Date().toISOString(),
    },
    details: categorized,
    recommendations: generateRecommendations(categorized),
  };
};

/**
 * Generates recommendations based on validation results
 * @param {Object} categorized - Categorized posts from categorizePosts
 * @returns {Array} Array of recommendation objects
 */
const generateRecommendations = (categorized) => {
  const recommendations = [];

  // Check for invalid posts
  if (categorized.invalidPosts.length > 0) {
    recommendations.push({
      type: "error",
      title: "Fix Invalid Posts",
      description: `${categorized.invalidPosts.length} posts have missing or invalid data`,
      action: "Review and fix posts missing slug, title, or publish dates",
      priority: "high",
    });
  }

  // Check for legacy posts
  if (categorized.legacyPosts.length > 0) {
    recommendations.push({
      type: "info",
      title: "Legacy Posts Available",
      description: `${categorized.legacyPosts.length} posts published before TinyURL integration`,
      action: "Consider creating TinyURLs for popular legacy posts",
      priority: "low",
    });
  }

  // Check new post percentage
  if (categorized.stats.newPercentage < 50 && categorized.total > 10) {
    recommendations.push({
      type: "warning",
      title: "Many Legacy Posts",
      description: `Only ${categorized.stats.newPercentage}% of posts have automatic TinyURL support`,
      action: "Consider bulk TinyURL creation for important legacy posts",
      priority: "medium",
    });
  }

  // Success message if mostly new posts
  if (categorized.stats.newPercentage >= 80 && categorized.total > 5) {
    recommendations.push({
      type: "success",
      title: "Great TinyURL Coverage",
      description: `${categorized.stats.newPercentage}% of posts have TinyURL support`,
      action: "Integration working well! Monitor webhook success rates",
      priority: "low",
    });
  }

  return recommendations;
};

/**
 * Formats dates for display in UI
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (dateInput) => {
  if (!dateInput) return "Unknown";

  try {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
};

/**
 * Checks if TinyURL integration is recent (within last 7 days)
 * @returns {boolean} Whether integration is recent
 */
export const isIntegrationRecent = () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return TINYURL_INTEGRATION_DATE >= sevenDaysAgo;
};

/**
 * Gets posts eligible for bulk TinyURL creation
 * @param {Array} posts - Array of post objects
 * @param {Object} options - Options for filtering
 * @returns {Array} Eligible posts
 */
export const getEligiblePostsForBulkCreation = (posts, options = {}) => {
  const {
    includePopularLegacy = false,
    minPopularityThreshold = 100, // views, likes, etc.
    maxBulkSize = 50,
  } = options;

  const categorized = categorizePosts(posts);
  let eligiblePosts = [];

  // Always include new posts that should have TinyURLs
  eligiblePosts = categorized.newPosts.map((item) => item.post);

  // Optionally include popular legacy posts
  if (includePopularLegacy) {
    const popularLegacy = categorized.legacyPosts
      .filter((item) => {
        const post = item.post;
        // Add your popularity criteria here (views, shares, etc.)
        return (
          post.views > minPopularityThreshold ||
          post.shares > minPopularityThreshold ||
          post.featured === true
        );
      })
      .map((item) => item.post);

    eligiblePosts = [...eligiblePosts, ...popularLegacy];
  }

  // Limit to max bulk size
  return eligiblePosts.slice(0, maxBulkSize);
};

export default {
  shouldHaveTinyUrl,
  validatePostTinyUrl,
  categorizePosts,
  generateValidationReport,
  formatDisplayDate,
  isIntegrationRecent,
  getEligiblePostsForBulkCreation,
  TINYURL_INTEGRATION_DATE,
};
