/**
 * TrendingStrip - 3-column trending posts section
 * Each column shows posts with horizontal card layout
 */

import React from "react";
import PostCardHorizontal from "./PostCardHorizontal";
import PostCardCompact from "./PostCardCompact";

const TrendingStrip = ({
  posts = [],
  title = "Trending Now",
  icon = "🔥",
  columns = 3,
}) => {
  if (!posts || posts.length === 0) return null;

  // Split posts into columns
  const postsPerColumn = Math.ceil(posts.length / columns);
  const columnPosts = [];
  for (let i = 0; i < columns; i++) {
    const start = i * postsPerColumn;
    const end = start + postsPerColumn;
    columnPosts.push(posts.slice(start, end));
  }

  return (
    <section className="container mx-auto px-4 mb-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl lg:text-2xl font-heading font-bold text-text-primary">
          {title}
        </h2>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {columnPosts.map((colPosts, colIndex) => (
          <div key={colIndex} className="space-y-1">
            {/* First post in column is featured (overlay card) */}
            {colPosts[0] && (
              <div className="mb-4">
                <PostCardCompact post={colPosts[0]} variant="overlay" />
              </div>
            )}

            {/* Remaining posts are horizontal cards */}
            {colPosts.slice(1).map((post, index) => (
              <PostCardHorizontal
                key={post.slug || index}
                post={post}
                index={index}
                showCategory={true}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingStrip;
