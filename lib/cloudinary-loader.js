/**
 * Cloudinary Image Loader for Next.js
 *
 * This loader transforms image URLs to use Cloudinary's fetch feature,
 * which fetches images from external URLs (like Hygraph) and applies
 * optimizations (auto format, quality, resizing).
 *
 * Benefits:
 * - 25,000 free transforms/month (5x more than Vercel)
 * - Automatic WebP/AVIF format conversion
 * - Responsive image sizing
 * - Global CDN delivery
 *
 * Cloud Name: duigaktwe
 */

const CLOUDINARY_CLOUD_NAME = "duigaktwe";

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
  // These are served from the public folder
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

  // Build Cloudinary transformations
  const params = [
    `w_${width}`, // Width
    `q_${quality || "auto"}`, // Quality (auto if not specified)
    "f_auto", // Auto format (WebP/AVIF based on browser support)
    "c_limit", // Limit mode - don't upscale, only downscale
    "dpr_auto", // Auto device pixel ratio
  ];

  const transformations = params.join(",");

  // Encode the source URL for Cloudinary fetch
  const encodedSrc = encodeURIComponent(src);

  // Build the Cloudinary fetch URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/fetch/{transformations}/{encoded_url}
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformations}/${encodedSrc}`;
}
