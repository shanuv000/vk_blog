import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getDirectRecentPosts,
  getDirectSimilarPosts,
} from "../services/direct-api";

const PostWidget = ({ categories, slug }) => {
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
          const result = await getDirectSimilarPosts(slug, categories);

          if (result && result.length > 0) {
            setSimilarPosts(result);
          } else {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, JSON.stringify(categories)]);

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
    let result = slug ? similarPosts : recentPosts;

    // Ensure posts is always an array
    if (!result) return [];

    // Convert object to array if needed
    if (!Array.isArray(result) && typeof result === "object") {
      return Object.values(result);
    }

    return result;
  }, [slug, similarPosts, recentPosts]);

  // Loading state
  const isLoading = slug ? similarLoading : recentLoading;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div className="flex items-center w-full p-2" key={item}>
            <div className="w-12 h-12 bg-secondary-light rounded-md flex-none animate-pulse" />
            <div className="flex-grow ml-3">
              <div className="h-3 bg-secondary-light rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-secondary-light rounded w-1/2 mt-2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <p className="text-text-secondary text-center py-4 text-sm">
        No posts available
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {posts.map((post, index) => {
        // Use pre-computed thumbnail URL from API
        const imageUrl = post.featuredImage?.thumbnailUrl || 
          (post.featuredImage?.url ? `${post.featuredImage.url}?w=112&h=112&q=75&fit=crop&auto=format` : null);
        
        // Smart date logic: use publishedAt unless it's in the future, then fallback to createdAt
        const now = new Date();
        const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
        const createdDate = post.createdAt ? new Date(post.createdAt) : null;
        
        let displayDate;
        if (publishedDate && publishedDate > now) {
          displayDate = createdDate || publishedDate;
        } else {
          displayDate = publishedDate || createdDate;
        }
        
        const formattedDate = displayDate 
          ? displayDate.toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            })
          : "No date";

        return (
          <Link
            key={post.slug || index}
            href={`/post/${post.slug}`}
            className="flex items-center w-full p-2 rounded-lg hover:bg-secondary-light transition-colors duration-150 group"
            prefetch={false}
          >
            <div className="w-12 h-12 flex-none overflow-hidden rounded-md bg-secondary-light">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  width={48}
                  height={48}
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <span className="text-text-secondary text-sm">📄</span>
                </div>
              )}
            </div>
            <div className="flex-grow ml-3 min-w-0">
              <p className="text-xs text-text-secondary mb-0.5 font-medium">
                {formattedDate}
              </p>
              <h4 className="text-text-primary font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
                {post.title}
              </h4>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default PostWidget;
