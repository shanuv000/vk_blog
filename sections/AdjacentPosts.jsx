import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Import AdjacentPostCard component with no SSR to avoid hydration issues
const AdjacentPostCard = dynamic(
  () => import("../components/AdjacentPostCard"),
  {
    ssr: false,
  }
);

import { getAdjacentPosts } from "../services";
import { getDirectAdjacentPosts } from "../services/direct-api";

const AdjacentPosts = ({ createdAt, slug }) => {
  const [adjacentPost, setAdjacentPost] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip initial server-side rendering to avoid hydration mismatch
    if (typeof window === "undefined") {
      return;
    }

    const fetchAdjacentPosts = async () => {
      try {
        // Try the direct API first
        const directResult = await getDirectAdjacentPosts(createdAt, slug);

        if (directResult && (directResult.next || directResult.previous)) {
          setAdjacentPost(directResult);
          setDataLoaded(true);
          return;
        }

        // Fall back to the original method if direct API returns no results
        const result = await getAdjacentPosts(createdAt, slug);
        setAdjacentPost(result);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching adjacent posts:", error);
        setError(error.message);

        // Set empty data to avoid null errors
        setAdjacentPost({ next: null, previous: null });
        setDataLoaded(true);
      }
    };

    if (createdAt && slug) {
      fetchAdjacentPosts();
    } else {
      setAdjacentPost({ next: null, previous: null });
      setDataLoaded(true);
    }
  }, [createdAt, slug]);

  // If there's an error, show a minimal UI
  if (error) {
    console.log("Rendering error state for adjacent posts");
    return null; // Don't show anything if there's an error
  }

  // If not loaded yet, show a loading state
  if (!dataLoaded) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-12 mb-8">
        <div className="col-span-1 lg:col-span-8 h-72 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  // If no adjacent posts, don't render anything
  if (!adjacentPost || (!adjacentPost.previous && !adjacentPost.next)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-8 gap-12 mb-8">
      {adjacentPost.previous && (
        <div
          className={`${
            adjacentPost.next
              ? "col-span-1 lg:col-span-4"
              : "col-span-1 lg:col-span-8"
          } adjacent-post rounded-lg relative h-72`}
        >
          <AdjacentPostCard post={adjacentPost.previous} position="LEFT" />
        </div>
      )}
      {adjacentPost.next && (
        <div
          className={`${
            adjacentPost.previous
              ? "col-span-1 lg:col-span-4"
              : "col-span-1 lg:col-span-8"
          } adjacent-post rounded-lg relative h-72`}
        >
          <AdjacentPostCard post={adjacentPost.next} position="RIGHT" />
        </div>
      )}
    </div>
  );
};

export default AdjacentPosts;
