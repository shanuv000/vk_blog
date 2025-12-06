/**
 * Reading Time Utility
 * Shared utility for calculating reading time across components
 */

/**
 * Calculate reading time from content
 * @param {Object|string} content - The content object or string
 * @param {string} title - Post title
 * @param {string} excerpt - Post excerpt
 * @returns {string} Reading time string (e.g., "5 min read")
 */
export const calculateReadingTime = (content, title = "", excerpt = "") => {
  if (!content && !title && !excerpt) {
    return "5 min read";
  }

  let totalWords = 0;

  // Count words from title
  if (title) {
    totalWords += title.split(/\s+/).filter((word) => word.length > 0).length;
  }

  // Count words from excerpt
  if (excerpt) {
    totalWords += excerpt.split(/\s+/).filter((word) => word.length > 0).length;
  }

  // Count words from content
  if (content) {
    if (typeof content === "object" && content.raw) {
      try {
        const textContent = JSON.stringify(content.raw).replace(
          /[{}[\]",:]/g,
          " "
        );
        totalWords += textContent
          .split(/\s+/)
          .filter((word) => word.length > 2).length;
      } catch {
        totalWords += 200; // Default fallback
      }
    } else if (typeof content === "string") {
      totalWords += content.split(/\s+/).filter((word) => word.length > 0).length;
    }
  }

  // Average reading speed is 200-250 words per minute
  const readingTime = Math.max(1, Math.ceil(totalWords / 220));
  return `${readingTime} min read`;
};

/**
 * Get reading time in minutes (number)
 * @param {Object|string} content - The content object or string
 * @param {string} title - Post title
 * @param {string} excerpt - Post excerpt
 * @returns {number} Reading time in minutes
 */
export const getReadingTimeMinutes = (content, title = "", excerpt = "") => {
  const readingTimeStr = calculateReadingTime(content, title, excerpt);
  return parseInt(readingTimeStr.split(" ")[0], 10);
};

export default calculateReadingTime;
