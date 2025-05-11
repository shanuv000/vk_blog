/**
 * Fallback implementation of comment service that uses localStorage
 * This is used when Firebase is not available due to CORS or other issues
 */

const STORAGE_KEY_PREFIX = 'blog_comment_';
const COMMENTS_LIST_KEY = 'blog_comments_list';

/**
 * Add a new comment using localStorage
 * @param {string} postSlug - The slug of the post
 * @param {string} name - The name of the commenter
 * @param {string} content - The comment content
 * @returns {Promise<object>} - The added comment with ID
 */
export const addComment = async (postSlug, name, content) => {
  try {
    // Create a JavaScript Date for immediate display
    const jsDate = new Date();
    const timestamp = jsDate.toISOString();
    
    // Generate a unique ID
    const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Prepare the comment data
    const commentData = {
      id,
      postSlug,
      name: name.trim() || "Anonymous",
      content: content.trim(),
      createdAt: timestamp,
      isLocal: true // Mark as local comment
    };
    
    // Save to localStorage
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(commentData));
    
    // Add to the list of comments for this post
    const commentsList = JSON.parse(localStorage.getItem(COMMENTS_LIST_KEY) || '{}');
    if (!commentsList[postSlug]) {
      commentsList[postSlug] = [];
    }
    commentsList[postSlug].push(id);
    localStorage.setItem(COMMENTS_LIST_KEY, JSON.stringify(commentsList));
    
    // Return the comment
    return {
      ...commentData,
      createdAt: jsDate // Use JavaScript Date object
    };
  } catch (error) {
    console.error("Error adding comment to localStorage:", error);
    throw new Error("Failed to add comment");
  }
};

/**
 * Get comments for a specific post from localStorage
 * @param {string} postSlug - The slug of the post
 * @param {number} commentsPerPage - Number of comments to load per page (default: 10)
 * @returns {Promise<Array>} - Array of comments
 */
export const getCommentsByPostSlug = async (postSlug, commentsPerPage = 10) => {
  try {
    // Validate inputs
    if (!postSlug) {
      return [];
    }
    
    // Get the list of comments for this post
    const commentsList = JSON.parse(localStorage.getItem(COMMENTS_LIST_KEY) || '{}');
    const commentIds = commentsList[postSlug] || [];
    
    // Get each comment
    const comments = [];
    for (const id of commentIds) {
      const commentJson = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (commentJson) {
        const comment = JSON.parse(commentJson);
        comments.push({
          ...comment,
          createdAt: new Date(comment.createdAt) // Convert string to Date
        });
      }
    }
    
    // Sort by createdAt (newest first)
    comments.sort((a, b) => b.createdAt - a.createdAt);
    
    // Apply limit
    return comments.slice(0, commentsPerPage);
  } catch (error) {
    console.error("Error fetching comments from localStorage:", error);
    return [];
  }
};
