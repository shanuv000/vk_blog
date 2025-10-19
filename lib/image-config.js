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
 * Get Hygraph image transformation URL
 *
 * Applies optimal transformation parameters to Hygraph/GraphCMS image URLs
 * to reduce file size and improve loading performance.
 *
 * @param {string} url - Original image URL from Hygraph
 * @param {string} type - Image type (hero, featured, postCard, thumbnail, avatar)
 * @returns {string} - Optimized image URL with transformation parameters
 */
export const getOptimizedImageUrl = (url, type = "postCard") => {
  if (!url) return "";

  // Only apply transformations to Hygraph/GraphCMS URLs
  const isHygraphUrl =
    url.includes("hygraph.com") ||
    url.includes("graphcms.com") ||
    url.includes("graphassets.com");

  // Return original URL if not from Hygraph or if it's a local/API URL
  if (!isHygraphUrl || url.startsWith("/api/") || url.startsWith("/")) {
    return url;
  }

  // Transformation parameters for different image types
  const transformations = {
    hero: "w=1200&h=675&fit=crop&auto=format,compress&q=75",
    featured: "w=800&h=450&fit=crop&auto=format,compress&q=70",
    postCard: "w=600&h=400&fit=crop&auto=format,compress&q=65",
    thumbnail: "w=400&h=267&fit=crop&auto=format,compress&q=60",
    avatar: "w=100&h=100&fit=crop&auto=format,compress&q=55",
    postDetail: "w=1200&h=800&fit=crop&auto=format,compress&q=75",
  };

  const params = transformations[type] || transformations.postCard;

  // Check if URL already has query parameters
  const separator = url.includes("?") ? "&" : "?";

  // Return URL with transformation parameters
  return `${url}${separator}${params}`;
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
