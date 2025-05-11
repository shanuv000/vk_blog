// Import only what we need from firebase/firestore to reduce bundle size
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const COMMENTS_COLLECTION = "comments";

/**
 * Add a new comment to Firestore
 * @param {string} postSlug - The slug of the post
 * @param {string} name - The name of the commenter
 * @param {string} content - The comment content
 * @returns {Promise<object>} - The added comment with ID
 */
export const addComment = async (postSlug, name, content) => {
  try {
    const commentData = {
      postSlug,
      name: name.trim() || "Anonymous",
      content: content.trim(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COMMENTS_COLLECTION),
      commentData
    );

    // Return the comment with an ID and a JavaScript Date object
    return {
      id: docRef.id,
      ...commentData,
      createdAt: new Date(), // Use current date for immediate display
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
};

/**
 * Get comments for a specific post with pagination
 * @param {string} postSlug - The slug of the post
 * @param {number} commentsPerPage - Number of comments to load per page (default: 10)
 * @returns {Promise<Array>} - Array of comments
 */
export const getCommentsByPostSlug = async (postSlug, commentsPerPage = 10) => {
  try {
    // Validate inputs
    if (!postSlug) {
      console.warn("getCommentsByPostSlug called without a postSlug");
      return [];
    }

    // Create a query with pagination
    const commentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("postSlug", "==", postSlug),
      orderBy("createdAt", "desc"),
      limit(commentsPerPage)
    );

    const querySnapshot = await getDocs(commentsQuery);

    // Process the results
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to JavaScript Date if it exists
        createdAt: data.createdAt
          ? new Date(data.createdAt.toMillis())
          : new Date(),
      };
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

/**
 * Delete a comment by ID
 * @param {string} commentId - The ID of the comment to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteComment = async (commentId) => {
  try {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    return false;
  }
};
