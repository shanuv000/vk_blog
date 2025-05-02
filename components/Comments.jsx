import React, { useState, useEffect } from "react";
import moment from "moment";
import { getComments } from "../services";
import parse from "html-react-parser";

const Comments = ({ slug }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchComments = async () => {
      try {
        setLoading(true);
        const result = await getComments(slug);
        setComments(result || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments. Please try again later.");
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <p className="text-center">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {comments.length > 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
          <h3 className="text-xl mb-8 font-semibold border-b pb-4">
            {comments.length}
            {"  "}
            Comments
          </h3>
          {comments.map((comment) => (
            <div
              key={comment.createdAt}
              className="border-b border-gray-100 mb-4 pb-4"
            >
              <p className="mb-4">
                <span className="font-semibold">{comment.name}</span> on{" "}
                {moment(comment.createdAt).format("MMM DD, YYYY")}
              </p>
              <p className="whitespace-pre-line text-gray-600 w-full">
                {parse(comment.comment || "")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg p-8 pb-12 mb-8">
          <p className="text-center">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  );
};

export default Comments;
