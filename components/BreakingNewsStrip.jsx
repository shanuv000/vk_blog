/**
 * BreakingNewsStrip - Lightweight scrolling news ticker
 * Pure CSS animation, mobile-first design
 */

import React, { memo } from "react";
import Link from "next/link";
import { FaBolt } from "react-icons/fa";

const BreakingNewsStrip = memo(({ posts = [], label = "LATEST" }) => {
  // Need at least 2 posts for smooth marquee
  if (!posts || posts.length < 2) return null;

  // Use top 6 posts for the ticker
  const tickerPosts = posts.slice(0, 6);

  return (
    <div className="bg-gradient-to-r from-primary/10 via-background to-primary/10 border-y border-border overflow-hidden mb-6">
      <div className="flex items-center">
        {/* Label Badge - Compact on mobile */}
        <div className="flex-shrink-0 bg-gradient-to-r from-primary to-primary-dark text-white px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm z-10 shadow-lg">
          <FaBolt className="text-yellow-300" size={10} />
          <span className="hidden xs:inline">{label}</span>
          <span className="xs:hidden">🔥</span>
        </div>

        {/* Scrolling Content - Touch-friendly on mobile */}
        <div className="relative overflow-hidden flex-1 touch-pan-x">
          <div className="flex animate-marquee whitespace-nowrap py-2 sm:py-2.5 will-change-transform">
            {/* Duplicate posts for seamless loop */}
            {[...tickerPosts, ...tickerPosts].map((post, index) => (
              <Link
                key={`${post.slug || index}-${index}`}
                href={`/post/${post.slug}`}
                className="inline-flex items-center px-3 sm:px-4 text-xs sm:text-sm text-text-primary hover:text-primary transition-colors duration-200 active:text-primary"
              >
                <span className="text-primary mr-1.5 sm:mr-2 text-lg">•</span>
                <span className="font-medium line-clamp-1 max-w-[200px] sm:max-w-[300px] lg:max-w-none">
                  {post.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Optimized CSS Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        @media (hover: hover) {
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

BreakingNewsStrip.displayName = "BreakingNewsStrip";

export default BreakingNewsStrip;

