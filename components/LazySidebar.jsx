import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

/**
 * LazySidebar - Defers loading sidebar components until they're near the viewport
 * This prevents API calls for categories/similar posts from blocking main content
 */

// Dynamically import sidebar components with loading states
const PostWidget = dynamic(() => import("./PostWidget"), {
  loading: () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <div className="w-12 h-12 bg-secondary-light rounded-md animate-pulse" />
          <div className="flex-1 h-3 bg-secondary-light rounded animate-pulse" />
        </div>
      ))}
    </div>
  ),
  ssr: false,
});

const Categories = dynamic(() => import("./Categories"), {
  loading: () => (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-4 bg-secondary-light rounded animate-pulse"
          style={{ width: `${70 + Math.random() * 25}%` }}
        />
      ))}
    </div>
  ),
  ssr: false,
});

const LazySidebar = ({ slug, categories }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    // Use Intersection Observer to detect when sidebar enters viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once visible
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before entering viewport
        threshold: 0.01,
      }
    );

    if (sidebarRef.current) {
      observer.observe(sidebarRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sidebarRef} className="relative lg:sticky top-8 space-y-6">
      {/* Similar/Recent Posts Widget */}
      <div className="bg-secondary rounded-xl border border-border shadow-card overflow-hidden">
        <h3 className="text-lg font-heading font-bold px-5 py-3 border-b border-border text-text-primary">
          {slug ? "Related Posts" : "Recent Posts"}
        </h3>
        <div className="p-4">
          {isVisible ? (
            <PostWidget slug={slug} categories={categories} />
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-12 h-12 bg-secondary-light rounded-md animate-pulse" />
                  <div className="flex-1 h-3 bg-secondary-light rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Categories Widget */}
      <div className="bg-secondary rounded-xl border border-border shadow-card overflow-hidden">
        <h3 className="text-lg font-heading font-bold px-5 py-3 border-b border-border text-text-primary">
          Categories
        </h3>
        <div className="p-4">
          {isVisible ? (
            <Categories />
          ) : (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-secondary-light rounded animate-pulse"
                  style={{ width: `${70 + Math.random() * 25}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LazySidebar;
