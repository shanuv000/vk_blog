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
    let result;
    if (slug) {
      result = similarPosts;
    } else {
      result = recentPosts;
    }

    // Ensure posts is always an array
    if (!result) {
      return [];
    }

    // Convert object to array if needed (fixes "Expected array data but received: object" error)
    if (!Array.isArray(result) && typeof result === "object") {
      console.log("Converting posts object to array:", result);
      return Object.values(result);
    }

    return result;
  }, [slug, similarPosts, recentPosts]);

  // Loading state
  const isLoading = slug ? similarLoading : recentLoading;

  return (
    <div className="space-y-4">
      {isLoading ? (
        // Loading state
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((item) => (
            <div className="flex items-center w-full" key={item}>
              <div className="w-16 h-16 bg-secondary-light rounded-md flex-none"></div>
              <div className="flex-grow ml-4">
                <div className="h-2 bg-secondary-light rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-secondary-light rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        // Posts loaded successfully
        posts.map((post, index) => (
          <Link
            href={`/post/${post.slug}`}
            key={post.slug || post.title || index}
            className="group"
          >
            <div className="flex items-center w-full p-2 rounded-lg hover:bg-secondary-light transition-colors duration-200">
              <div className="w-16 h-16 flex-none overflow-hidden rounded-md">
                {post.featuredImage?.url ? (
                  <LazyLoadImage
                    alt={post.title || "Post image"}
                    height={64}
                    width={64}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    src={post.featuredImage.url}
                    effect="blur"
                    placeholderSrc="/placeholder-image.jpg"
                  />
                ) : (
                  <div className="flex items-center justify-center bg-secondary-light h-full w-full">
                    <FaImage className="text-text-secondary" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-grow ml-4">
                <p
                  className="text-text-secondary text-xs"
                  suppressHydrationWarning
                >
                  {post.publishedAt
                    ? moment(post.publishedAt).format("MMM DD, YYYY")
                    : post.createdAt
                    ? moment(post.createdAt).format("MMM DD, YYYY")
                    : "No date"}
                </p>
                <h4 className="text-text-primary group-hover:text-primary transition-colors duration-200 font-medium line-clamp-2">
                  {post.title || "Untitled Post"}
                </h4>
              </div>
            </div>
          </Link>
        ))
      ) : (
        // No posts found
        <p className="text-text-secondary text-center py-4">
          No posts available
        </p>
      )}
    </div>
  );
};

export default PostWidget;
