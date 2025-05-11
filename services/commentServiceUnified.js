/**
 * Unified comment service that tries multiple methods
 * 1. First tries the Proxy API
 * 2. Then tries the direct REST API
 * 3. Falls back to the WebChannel-based SDK
 * 4. Finally falls back to localStorage
 */

import * as ProxyService from "./commentServiceProxy";
import * as RestService from "./commentServiceREST";
import * as SdkService from "./commentService";
import * as FallbackService from "./commentServiceFallback";

// Track which service is working
let workingService = null;

// Store the service name for analytics
let currentServiceName = "unknown";

// Helper function to log errors only in development
const logError = (message, error) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message, error);
  }
};

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
      const result = await workingService.addComment(postSlug, name, content);
      return result;
    } catch (error) {
      logError(
        `Previously working service (${currentServiceName}) failed:`,
        error
      );
      workingService = null;
      currentServiceName = "unknown";
    }
  }

  // Try Proxy API first
  try {
    const result = await ProxyService.addComment(postSlug, name, content);
    workingService = ProxyService;
    currentServiceName = "proxy";
    return result;
  } catch (proxyError) {
    logError("Proxy API failed:", proxyError);

    // Try direct REST API next
    try {
      const result = await RestService.addComment(postSlug, name, content);
      workingService = RestService;
      currentServiceName = "rest";
      return result;
    } catch (restError) {
      logError("REST API failed:", restError);

      // Try SDK next
      try {
        const result = await SdkService.addComment(postSlug, name, content);
        workingService = SdkService;
        currentServiceName = "sdk";
        return result;
      } catch (sdkError) {
        logError("SDK failed:", sdkError);

        // Finally, fall back to localStorage
        try {
          const result = await FallbackService.addComment(
            postSlug,
            name,
            content
          );
          workingService = FallbackService;
          currentServiceName = "local";
          return result;
        } catch (fallbackError) {
          if (process.env.NODE_ENV !== "production") {
            console.error("All methods failed:", fallbackError);
          }
          throw new Error("Failed to add comment using any available method");
        }
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
      return await workingService.getCommentsByPostSlug(
        postSlug,
        commentsPerPage
      );
    } catch (error) {
      logError(
        `Previously working service (${currentServiceName}) failed:`,
        error
      );
      workingService = null;
      currentServiceName = "unknown";
    }
  }

  // Try Proxy API first
  try {
    const result = await ProxyService.getCommentsByPostSlug(
      postSlug,
      commentsPerPage
    );
    workingService = ProxyService;
    currentServiceName = "proxy";
    return result;
  } catch (proxyError) {
    logError("Proxy API failed:", proxyError);

    // Try direct REST API next
    try {
      const result = await RestService.getCommentsByPostSlug(
        postSlug,
        commentsPerPage
      );
      workingService = RestService;
      currentServiceName = "rest";
      return result;
    } catch (restError) {
      logError("REST API failed:", restError);

      // Try SDK next
      try {
        const result = await SdkService.getCommentsByPostSlug(
          postSlug,
          commentsPerPage
        );
        workingService = SdkService;
        currentServiceName = "sdk";
        return result;
      } catch (sdkError) {
        logError("SDK failed:", sdkError);

        // Finally, fall back to localStorage
        try {
          const result = await FallbackService.getCommentsByPostSlug(
            postSlug,
            commentsPerPage
          );
          workingService = FallbackService;
          currentServiceName = "local";
          return result;
        } catch (fallbackError) {
          if (process.env.NODE_ENV !== "production") {
            console.error("All methods failed:", fallbackError);
          }
          return []; // Return empty array as last resort
        }
      }
    }
  }
};
