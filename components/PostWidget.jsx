import React, { useState, useEffect, useMemo } from "react";
import moment from "moment";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaImage } from "react-icons/fa";
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";
import {
  getDirectRecentPosts,
  getDirectSimilarPosts,
} from "../services/direct-api";

const PostWidget = ({ categories, slug }) => {
  // Debug log to see what's being passed
  console.log("PostWidget rendered with:", { categories, slug });

  // Use direct API for similar posts
  const [similarPosts, setSimilarPosts] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(true);

  // Use direct API for recent posts
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

  // Fetch similar posts when slug and categories are available
  useEffect(() => {
    if (slug && categories && categories.length > 0) {
      const fetchSimilarPosts = async () => {
        try {
          setSimilarLoading(true);
          console.log("Fetching similar posts for:", slug, categories);
          const result = await getDirectSimilarPosts(slug, categories);
          console.log("Similar posts result:", result);

          if (result && result.length > 0) {
            setSimilarPosts(result);
          } else {
            console.log("No similar posts found, using fallback");
            // Fallback to recent posts if no similar posts are found
            const recentResult = await getDirectRecentPosts();
            setSimilarPosts(recentResult || []);
          }
        } catch (error) {
          console.error("Error fetching similar posts:", error);
          setSimilarPosts([]);
        } finally {
          setSimilarLoading(false);
        }
      };

      fetchSimilarPosts();
    } else if (slug) {
      // If we have a slug but no categories, set empty array and loading to false
      setSimilarPosts([]);
      setSimilarLoading(false);
    }
  }, [slug, categories]);

  // Fetch recent posts on component mount
  useEffect(() => {
    if (!slug) {
      const fetchRecentPosts = async () => {
        try {
          setRecentLoading(true);
          const result = await getDirectRecentPosts();
          setRecentPosts(result);
        } catch (error) {
          console.error("Error fetching recent posts:", error);
          setRecentPosts([]);
        } finally {
          setRecentLoading(false);
        }
      };

      fetchRecentPosts();
    }
  }, [slug]);

  // Determine which posts to show based on props
  const posts = useMemo(() => {
    if (slug) {
      return similarPosts;
    } else {
      return recentPosts;
    }
  }, [slug, similarPosts, recentPosts]);

  // Loading state
  const isLoading = slug ? similarLoading : recentLoading;

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
      <h3 className="text-xl mb-8 font-semibold border-b pb-4">
        {slug ? "Related Posts" : "Recent Posts"}
      </h3>

      {isLoading ? (
        // Loading state
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div className="flex items-center w-full mb-4" key={item}>
              <div className="w-16 h-16 bg-gray-200 rounded-full flex-none"></div>
              <div className="flex-grow ml-4">
                <div className="h-2 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        // Posts loaded successfully
        posts.map((post, index) => (
          <div
            className="flex items-center w-full mb-4"
            key={post.slug || post.title || index}
          >
            <div className="w-16 flex-none">
              {post.featuredImage?.url ? (
                <LazyLoadImage
                  alt={post.title || "Post image"}
                  height={60}
                  width={60}
                  className="align-middle rounded-full object-cover"
                  src={post.featuredImage.url}
                  style={{ width: "60px", height: "60px" }}
                  effect="blur"
                  placeholderSrc="/placeholder-image.jpg"
                />
              ) : (
                <div className="flex items-center justify-center bg-gray-200 rounded-full h-[60px] w-[60px]">
                  <FaImage className="text-gray-500" size={24} />
                </div>
              )}
            </div>
            <div className="flex-grow ml-4">
              <p className="text-gray-500 font-xs">
                {post.createdAt
                  ? moment(post.createdAt).format("MMM DD, YYYY")
                  : "No date"}
              </p>
              <Link
                href={`/post/${post.slug}`}
                className="text-md hover:text-pink-500 transition duration-300"
              >
                {post.title || "Untitled Post"}
              </Link>
            </div>
          </div>
        ))
      ) : (
        // No posts found
        <p className="text-gray-500 text-center">No posts available</p>
      )}
    </div>
  );
};

export default PostWidget;
