import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { addComment, getCommentsByPostSlug } from "../services/commentService";

const Comments = ({ postSlug }) => {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [commentsPerPage] = useState(10); // Default to 10 comments per page

  // Memoize the fetch comments function to prevent unnecessary re-renders
  const fetchComments = useCallback(async () => {
    if (!postSlug) return;

    setIsLoading(true);
    setError("");

    try {
      const fetchedComments = await getCommentsByPostSlug(
        postSlug,
        commentsPerPage
      );
      setComments(fetchedComments);
    } catch (err) {
      // Don't show error in production to avoid alarming users
      // The commentService already handles errors gracefully
      setError("Failed to load comments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [postSlug, commentsPerPage]);

  // Fetch comments when component mounts or when fetchComments changes
  useEffect(() => {
    fetchComments();

    // Don't re-fetch comments on every render
    // This component will be lazy-loaded, so it won't impact initial page load
  }, [fetchComments]);

  // Handle form submission - memoized to prevent recreation on every render
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Reset messages
      setError("");
      setSuccess("");

      // Validate inputs
      if (!content.trim()) {
        setError("Comment cannot be empty");
        return;
      }

      setIsSubmitting(true);

      try {
        const newComment = await addComment(postSlug, name, content);

        // Add the new comment to the state
        setComments((prevComments) => [newComment, ...prevComments]);

        // Reset form
        setName("");
        setContent("");

        // Show success message
        setSuccess(
          "Comment added successfully! It will appear here and be visible to others when you refresh the page."
        );

        // Clear success message after 5 seconds
        const timer = setTimeout(() => {
          setSuccess("");
        }, 5000);

        // Refresh comments after a short delay to ensure the server has processed the new comment
        const refreshTimer = setTimeout(() => {
          fetchComments();
        }, 2000);

        // Clean up timers if component unmounts
        return () => {
          clearTimeout(timer);
          clearTimeout(refreshTimer);
        };
      } catch (err) {
        // More specific error message for network issues
        if (err.code === "unavailable" || err.message?.includes("network")) {
          setError(
            "Network error. Your comment was saved locally but may not be visible to others until connection is restored."
          );

          // Still reset the form to avoid duplicate submissions
          setName("");
          setContent("");
        } else {
          setError("Failed to submit comment. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [postSlug, name, content, fetchComments]
  );

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-4 font-heading">
        Join the conversation
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
            maxLength={50}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Comment
          </label>
          <textarea
            id="comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
            required
            maxLength={2000}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {content.length}/2000 characters
          </div>
        </div>

        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-50 text-red-600 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="mb-4 p-3 bg-green-50 text-green-600 rounded-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {success}
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all duration-300 ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Post Comment"
          )}
        </motion.button>
      </form>

      {/* Comments List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium text-gray-800">
            {comments.length > 0
              ? `${comments.length} Comment${comments.length === 1 ? "" : "s"}`
              : "Comments"}
          </h4>

          <button
            onClick={(e) => {
              e.preventDefault();
              fetchComments();
            }}
            className="text-sm text-primary flex items-center hover:text-primary-dark transition-colors"
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="border-b border-gray-100 pb-6 last:border-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-2">
                    <div className="bg-primary bg-opacity-10 rounded-full h-10 w-10 flex items-center justify-center text-primary font-medium mr-3">
                      {comment.name
                        ? comment.name.charAt(0).toUpperCase()
                        : "A"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {comment.name || "Anonymous"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {comment.createdAt
                          ? moment(comment.createdAt).format(
                              "MMM DD, YYYY • h:mm A"
                            )
                          : "Just now"}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-2 whitespace-pre-line leading-relaxed">
                    {comment.content}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-200 rounded-lg">
              <p className="mb-2">No comments yet.</p>
              <p className="text-sm">Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(Comments);
