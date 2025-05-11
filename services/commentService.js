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
    // Create a JavaScript Date for immediate display
    const jsDate = new Date();

    const commentData = {
      postSlug,
      name: name.trim() || "Anonymous",
      content: content.trim(),
      createdAt: serverTimestamp(), // Server timestamp for sorting
      createdAtString: jsDate.toISOString(), // String timestamp as backup
    };

    const docRef = await addDoc(
      collection(db, COMMENTS_COLLECTION),
      commentData
    );

    // Return the comment with an ID and a JavaScript Date object
    return {
      id: docRef.id,
      ...commentData,
      createdAt: jsDate, // Use current date for immediate display
    };
  } catch (error) {
    console.error("Error adding comment");
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
      return [];
    }

    // First try with the ordered query (requires index)
    try {
      const commentsQuery = query(
        collection(db, COMMENTS_COLLECTION),
        where("postSlug", "==", postSlug),
        orderBy("createdAt", "desc"),
        limit(commentsPerPage)
      );

      const orderedSnapshot = await getDocs(commentsQuery);

      // If ordered query worked, use it
      if (orderedSnapshot.size > 0) {
        return processComments(orderedSnapshot);
      }
    } catch (orderError) {
      // Silently fall back to unordered query
    }

    // If ordered query failed or returned no results, try simple query
    const postCommentsQuery = query(
      collection(db, COMMENTS_COLLECTION),
      where("postSlug", "==", postSlug)
    );

    const postCommentsSnapshot = await getDocs(postCommentsQuery);

    // If we have comments, process them with manual sorting
    if (postCommentsSnapshot.size > 0) {
      return processComments(postCommentsSnapshot, true);
    }

    // Define a function to process comments
    function processComments(snapshot, manualSort = false) {
      let comments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to JavaScript Date if it exists
          createdAt: data.createdAt
            ? new Date(data.createdAt.toMillis())
            : data.createdAtString
            ? new Date(data.createdAtString)
            : new Date(),
        };
      });

      // If manual sort is needed, sort by createdAt
      if (manualSort) {
        comments.sort((a, b) => b.createdAt - a.createdAt);
      }

      // Apply limit
      comments = comments.slice(0, commentsPerPage);
      return comments;
    }

    // If we got here, it means we have no comments for this post
    return [];
  } catch (error) {
    console.error("Error fetching comments");
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
    console.error("Error deleting comment");
    return false;
  }
};
