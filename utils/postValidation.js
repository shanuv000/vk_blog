/**
 * Utility functions for validating and processing post content
 */

/**
 * Validates if a post has valid content
 * @param {Object} post - The post object to validate
 * @returns {boolean} - True if the post has valid content, false otherwise
 */
export const hasValidContent = (post) => {
  if (!post) return false;
  if (!post.content) return false;
  return !!(post.content.raw || post.content.json);
};

/**
 * Gets detailed information about post content for debugging
 * @param {Object} post - The post object to analyze
 * @returns {Object} - Object containing debug information about the post content
 */
export const getContentDebugInfo = (post) => {
  if (!post) {
    return {
      exists: false,
      message: 'Post is null or undefined'
    };
  }

  if (!post.content) {
    return {
      exists: false,
      hasContent: false,
      message: 'Post content is missing'
    };
  }

  const contentKeys = Object.keys(post.content);
  const hasRaw = !!post.content.raw;
  const hasJson = !!post.content.json;
  const rawType = hasRaw ? typeof post.content.raw : null;
  const jsonType = hasJson ? typeof post.content.json : null;

  return {
    exists: true,
    hasContent: true,
    contentKeys,
    hasRaw,
    hasJson,
    rawType,
    jsonType,
    isValid: hasRaw || hasJson,
    message: hasRaw || hasJson 
      ? 'Post has valid content' 
      : 'Post is missing both raw and json content'
  };
};

/**
 * Ensures post content has a valid structure by adding fallbacks if needed
 * @param {Object} post - The post object to process
 * @returns {Object} - The processed post with valid content structure
 */
export const ensureValidContent = (post) => {
  if (!post) return null;
  
  const processedPost = { ...post };
  
  // Ensure content object exists
  if (!processedPost.content) {
    processedPost.content = { raw: null, json: null };
  }
  
  // Ensure raw and json properties exist
  if (processedPost.content && typeof processedPost.content === 'object') {
    if (!('raw' in processedPost.content)) {
      processedPost.content.raw = null;
    }
    
    if (!('json' in processedPost.content)) {
      processedPost.content.json = null;
    }
  }
  
  return processedPost;
};

/**
 * Processes post content by parsing string content if needed
 * @param {Object} post - The post object to process
 * @param {Function} logger - Optional logging function
 * @returns {Object} - The processed post with parsed content
 */
export const processPostContent = (post, logger = console.log) => {
  if (!post || !post.content) return post;
  
  const processedPost = { ...post };
  const content = { ...processedPost.content };
  
  // Process raw content if it's a string
  if (content.raw && typeof content.raw === 'string') {
    try {
      content.raw = JSON.parse(content.raw);
      logger('Successfully parsed content.raw string to object');
    } catch (error) {
      logger(`Failed to parse content.raw string: ${error.message}`);
      // Keep as string if parsing fails
    }
  }
  
  // Process json content if it's a string
  if (content.json && typeof content.json === 'string') {
    try {
      content.json = JSON.parse(content.json);
      logger('Successfully parsed content.json string to object');
    } catch (error) {
      logger(`Failed to parse content.json string: ${error.message}`);
      // Keep as string if parsing fails
    }
  }
  
  processedPost.content = content;
  return processedPost;
};
