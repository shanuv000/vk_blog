/**
 * Utility functions for handling images
 */

/**
 * Checks if an image URL is valid and accessible
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} - True if the image is valid and accessible
 */
export const isImageValid = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && response.headers.get('content-type')?.startsWith('image/');
  } catch (error) {
    console.error(`Error checking image validity: ${error.message}`);
    return false;
  }
};

/**
 * Gets a fallback image URL if the original is invalid
 * @param {string} originalUrl - The original image URL
 * @param {string} fallbackUrl - The fallback image URL
 * @returns {Promise<string>} - The original URL if valid, otherwise the fallback
 */
export const getValidImageUrl = async (originalUrl, fallbackUrl = '/images/placeholder-featured.jpg') => {
  if (!originalUrl) return fallbackUrl;
  
  try {
    const isValid = await isImageValid(originalUrl);
    return isValid ? originalUrl : fallbackUrl;
  } catch (error) {
    console.error(`Error getting valid image URL: ${error.message}`);
    return fallbackUrl;
  }
};

/**
 * Extracts image dimensions from a URL if available
 * @param {string} url - The image URL
 * @returns {Object} - Object containing width and height if available
 */
export const extractImageDimensions = (url) => {
  if (!url) return { width: null, height: null };
  
  try {
    // Check for width and height parameters in the URL
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    let width = params.get('width') || params.get('w');
    let height = params.get('height') || params.get('h');
    
    // Check for dimensions in the path (common in CDN URLs)
    // Example: /resize=width:1000,height:621/
    const resizeMatch = url.match(/resize=width:(\d+),height:(\d+)/i);
    if (resizeMatch) {
      width = width || resizeMatch[1];
      height = height || resizeMatch[2];
    }
    
    return {
      width: width ? parseInt(width) : null,
      height: height ? parseInt(height) : null
    };
  } catch (error) {
    console.error(`Error extracting image dimensions: ${error.message}`);
    return { width: null, height: null };
  }
};

/**
 * Creates a debug URL for an image
 * @param {string} imageUrl - The image URL to debug
 * @returns {string} - The debug API URL
 */
export const createImageDebugUrl = (imageUrl) => {
  if (!imageUrl) return '';
  
  try {
    const encodedUrl = encodeURIComponent(imageUrl);
    return `/api/debug-image?url=${encodedUrl}`;
  } catch (error) {
    console.error(`Error creating image debug URL: ${error.message}`);
    return '';
  }
};
