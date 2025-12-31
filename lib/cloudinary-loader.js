/**
 * Enhanced Cloudinary Image Loader for Next.js
 *
 * Features:
 * - 25,000 free transforms/month (5x more than Vercel)
 * - Automatic WebP/AVIF format conversion
 * - Responsive image sizing with DPR support
 * - Blur placeholder generation for better UX
 * - Fallback to raw URL if Cloudinary fails
 * - Cleans up wasteful Hygraph transform params
 *
 * Cloud Name: duigaktwe
 */

const CLOUDINARY_CLOUD_NAME = "duigaktwe";

/**
 * Remove existing transformation parameters from Hygraph URLs
 * These are wasteful since Cloudinary handles optimization
 */
function cleanHygraphUrl(url) {
  if (!url) return url;

  try {
    // Check if URL has Hygraph transform params
    if (
      url.includes("graphassets.com") ||
      url.includes("hygraph.com") ||
      url.includes("graphcms.com")
    ) {
      // Parse URL and remove transformation params
      const urlObj = new URL(url);

      // Remove common Hygraph/image transform params
      const paramsToRemove = [
        "q",
        "quality",
        "w",
        "width",
        "h",
        "height",
        "fit",
        "format",
        "auto",
        "compress",
        "resize",
      ];

      paramsToRemove.forEach((param) => {
        urlObj.searchParams.delete(param);
      });

      // Return cleaned URL (without empty query string)
      const cleanUrl = urlObj.origin + urlObj.pathname;
      return cleanUrl;
    }
  } catch (e) {
    // If URL parsing fails, return original
    console.warn("Failed to clean URL:", e.message);
  }

  return url;
}

/**
 * Generate blur placeholder URL using Cloudinary
 * Creates a tiny, heavily blurred version for LQIP effect
 */
export function getBlurDataURL(src) {
  if (!src || src.startsWith("/") || src.startsWith("data:")) {
    // Return default blur for local/data URLs
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9InJnYmEoMTU2LDE2MywxNzUsMC4xKSIvPjwvc3ZnPg==";
  }

  const cleanedSrc = cleanHygraphUrl(src);
  const encodedSrc = encodeURIComponent(cleanedSrc);

  // Generate tiny blurred placeholder (20px wide, heavily blurred)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/w_20,q_10,f_auto,e_blur:1000/${encodedSrc}`;
}

/**
 * Custom loader for Next.js Image component
 * @param {Object} params - Loader parameters from Next.js
 * @param {string} params.src - Source image URL
 * @param {number} params.width - Requested width
 * @param {number} params.quality - Requested quality (1-100)
 * @returns {string} - Cloudinary-optimized URL
 */
export default function cloudinaryLoader({ src, width, quality }) {
  // Handle empty or invalid sources
  if (!src) {
    return "/images/placeholder-featured.jpg";
  }

  // For local images (starting with /), use them directly
  if (src.startsWith("/")) {
    return src;
  }

  // For data URLs, return as-is
  if (src.startsWith("data:")) {
    return src;
  }

  // For blob URLs, return as-is
  if (src.startsWith("blob:")) {
    return src;
  }

  // Clean up any existing Hygraph transform params
  const cleanedSrc = cleanHygraphUrl(src);

  // Build Cloudinary transformations
  const transforms = [
    `w_${width}`, // Width
    `q_${quality || "auto"}`, // Quality (auto if not specified)
    "f_auto", // Auto format (WebP/AVIF based on browser support)
    "c_limit", // Limit mode - don't upscale, only downscale
    "dpr_auto", // Auto device pixel ratio
  ];

  const transformations = transforms.join(",");

  // Encode the source URL for Cloudinary fetch
  const encodedSrc = encodeURIComponent(cleanedSrc);

  // Build the Cloudinary fetch URL
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformations}/${encodedSrc}`;
}

/**
 * Get raw URL without Cloudinary (for fallback scenarios)
 * Use this if Cloudinary fails to load an image
 */
export function getRawImageUrl(src) {
  return cleanHygraphUrl(src);
}
