/**
 * Unified comment service that tries multiple methods
 * 1. First tries the REST API
 * 2. Falls back to the WebChannel-based SDK
 * 3. Finally falls back to localStorage
 */

import * as RestService from './commentServiceREST';
import * as SdkService from './commentService';
import * as FallbackService from './commentServiceFallback';

// Track which service is working
let workingService = null;

/**
 * Add a new comment using the best available method
 * @param {string} postSlug - The slug of the post
 * @param {string} name - The name of the commenter
 * @param {string} content - The comment content
 * @returns {Promise<object>} - The added comment with ID
 */
export const addComment = async (postSlug, name, content) => {
  // If we already know which service works, try that first
  if (workingService) {
    try {
      return await workingService.addComment(postSlug, name, content);
    } catch (error) {
      console.warn(`Previously working service failed:`, error);
      workingService = null;
    }
  }
  
  // Try REST API first
  try {
    const result = await RestService.addComment(postSlug, name, content);
    workingService = RestService;
    return result;
  } catch (restError) {
    console.warn('REST API failed:', restError);
    
    // Try SDK next
    try {
      const result = await SdkService.addComment(postSlug, name, content);
      workingService = SdkService;
      return result;
    } catch (sdkError) {
      console.warn('SDK failed:', sdkError);
      
      // Finally, fall back to localStorage
      try {
        const result = await FallbackService.addComment(postSlug, name, content);
        workingService = FallbackService;
        return result;
      } catch (fallbackError) {
        console.error('All methods failed:', fallbackError);
        throw new Error('Failed to add comment using any available method');
      }
    }
  }
};

/**
 * Get comments for a specific post using the best available method
 * @param {string} postSlug - The slug of the post
 * @param {number} commentsPerPage - Number of comments to load per page (default: 10)
 * @returns {Promise<Array>} - Array of comments
 */
export const getCommentsByPostSlug = async (postSlug, commentsPerPage = 10) => {
  // If we already know which service works, try that first
  if (workingService) {
    try {
      return await workingService.getCommentsByPostSlug(postSlug, commentsPerPage);
    } catch (error) {
      console.warn(`Previously working service failed:`, error);
      workingService = null;
    }
  }
  
  // Try REST API first
  try {
    const result = await RestService.getCommentsByPostSlug(postSlug, commentsPerPage);
    workingService = RestService;
    return result;
  } catch (restError) {
    console.warn('REST API failed:', restError);
    
    // Try SDK next
    try {
      const result = await SdkService.getCommentsByPostSlug(postSlug, commentsPerPage);
      workingService = SdkService;
      return result;
    } catch (sdkError) {
      console.warn('SDK failed:', sdkError);
      
      // Finally, fall back to localStorage
      try {
        const result = await FallbackService.getCommentsByPostSlug(postSlug, commentsPerPage);
        workingService = FallbackService;
        return result;
      } catch (fallbackError) {
        console.error('All methods failed:', fallbackError);
        return []; // Return empty array as last resort
      }
    }
  }
};
