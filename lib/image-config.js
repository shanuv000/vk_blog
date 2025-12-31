/**
 * Optimized Image Configuration
 *
 * Centralized image quality and sizing configuration to ensure
 * consistent optimization across the application.
 *
 * Quality Guidelines:
 * - 75-80: Hero/Featured (large, prominent images)
 * - 65-70: Content images (moderate quality)
 * - 60-65: Thumbnails (small display size)
 * - 50-60: Avatars (tiny display size)
 */

export const IMAGE_CONFIGS = {
  // Hero/Spotlight images (top of homepage)
  hero: {
    quality: 75,
    priority: true,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px",
    placeholder: "blur",
  },

  // Featured post cards
  featured: {
    quality: 70,
    priority: false,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px",
    placeholder: "blur",
  },

  // Regular post cards in feed
  postCard: {
    quality: 65,
    priority: false,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
    placeholder: "blur",
  },

  // Thumbnail images (sidebar, related posts)
  thumbnail: {
    quality: 60,
    priority: false,
    sizes: "(max-width: 640px) 50vw, 300px",
    placeholder: "blur",
  },

  // Author avatars
  avatar: {
    quality: 55,
    priority: false,
    sizes: "100px",
    placeholder: "blur",
  },

  // Post detail featured image
  postDetail: {
    quality: 75,
    priority: true,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1000px",
    placeholder: "blur",
  },
};

/**
 * Get image URL for Next.js optimization
 *
 * Returns the original URL without Hygraph transformations.
 * Next.js handles all image optimization via next/image component,
 * avoiding consumption of Hygraph's paid transformation quota.
 *
 * @param {string} url - Original image URL from Hygraph
 * @param {string} type - Image type (unused, kept for API compatibility)
 * @returns {string} - Original image URL
 */
export const getOptimizedImageUrl = (url, type = "postCard") => {
  // Return original URL - let Next.js handle all image optimization
  // This avoids consuming Hygraph's paid transformation quota (402 errors)
  return url || "";
};

/**
 * Get responsive image sizes based on breakpoints
 *
 * @param {string} type - Image type
 * @returns {string} - Sizes attribute for responsive images
 */
export const getImageSizes = (type = "postCard") => {
  return IMAGE_CONFIGS[type]?.sizes || IMAGE_CONFIGS.postCard.sizes;
};

/**
 * Get image quality for specific type
 *
 * @param {string} type - Image type
 * @returns {number} - Image quality (0-100)
 */
export const getImageQuality = (type = "postCard") => {
  return IMAGE_CONFIGS[type]?.quality || IMAGE_CONFIGS.postCard.quality;
};

/**
 * Check if image should be loaded with priority
 *
 * @param {string} type - Image type
 * @param {number} index - Index in list (for above-fold detection)
 * @returns {boolean} - Whether to use priority loading
 */
export const shouldPrioritizeImage = (type = "postCard", index = 0) => {
  // Hero images always prioritized
  if (type === "hero" || type === "postDetail") {
    return true;
  }

  // First 2 featured images
  if (type === "featured" && index < 2) {
    return true;
  }

  // Otherwise, no priority
  return false;
};

export default IMAGE_CONFIGS;
