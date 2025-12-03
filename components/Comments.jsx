import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";

import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { FaPaperPlane, FaUser, FaRedo, FaSpinner } from "react-icons/fa";

// Import the unified service that tries multiple methods
import {
  addComment,
  getCommentsByPostSlug,
} from "../services/commentServiceUnified";

// Helper function to log errors only in development
const logError = (message, error) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error);
  }
};

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
    if (!postSlug) {return;}

    setIsLoading(true);
    setError("");

    try {
      const fetchedComments = await getCommentsByPostSlug(
        postSlug,
        commentsPerPage
      );
      setComments(fetchedComments);
    } catch (err) {
      logError("Error fetching comments:", err);

      // More specific error message for different types of errors
      if (err.message?.includes("CORS") || err.message?.includes("blocked")) {
        setError(
          "Unable to load comments due to browser security restrictions. We're working on a fix."
        );
      } else if (
        err.code === "unavailable" ||
        err.message?.includes("network")
      ) {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError("Failed to load comments. Please try again later.");
      }
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
        logError("Comment submission error:", err);

        // More specific error message for different types of errors
        if (err.message?.includes("CORS") || err.message?.includes("blocked")) {
          setError(
            "Unable to connect to the comment service due to browser security restrictions. Please try again later."
          );
        } else if (
          err.code === "unavailable" ||
          err.message?.includes("network")
        ) {
          setError(
            "Network error. Please check your internet connection and try again."
          );
        } else {
          setError("Failed to submit comment. Please try again.");
        }

        // Don't reset the form on error so the user can try again
      } finally {
        setIsSubmitting(false);
      }
    },
    [postSlug, name, content, fetchComments]
  );

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 font-heading">
          Discussion
        </h3>
        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12 relative">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Name <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we call you?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200"
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Your Comment
            </label>
            <textarea
              id="comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What are your thoughts on this?"
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all duration-200 resize-y min-h-[120px]"
              required
              maxLength={2000}
            />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-400 font-medium">
                {content.length}/2000
              </span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <span className="mr-2">⚠️</span> {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="mt-4 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 flex items-start"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
            >
              <span className="mr-2">✅</span> {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-xl shadow-sm hover:shadow-md hover:bg-primary-dark transition-all duration-300 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Posting...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Post Comment
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Comments List */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold text-gray-800">
            Recent Comments
          </h4>

          <button
            onClick={(e) => {
              e.preventDefault();
              fetchComments();
            }}
            className="text-sm text-primary flex items-center hover:text-primary-dark transition-colors font-medium"
            disabled={isLoading}
          >
            <FaRedo className={`mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
              <p className="mt-4 text-gray-500 font-medium">Loading conversation...</p>
            </div>
          ) : comments.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  className="group bg-gray-50 rounded-2xl p-5 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {comment.name
                          ? comment.name.charAt(0).toUpperCase()
                          : "A"}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-gray-900 truncate">
                            {comment.name || "Anonymous"}
                          </h5>
                          {comment.isLocal && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase tracking-wider rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                          {comment.createdAt
                            ? moment(comment.createdAt).fromNow()
                            : "Just now"}
                        </span>
                      </div>
                      <div className="prose prose-sm prose-slate max-w-none text-gray-600 leading-relaxed">
                        <p className="whitespace-pre-line">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                <FaPaperPlane />
              </div>
              <h5 className="text-gray-900 font-medium mb-1">No comments yet</h5>
              <p className="text-gray-500 text-sm">
                Be the first to share your thoughts on this article!
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(Comments);
