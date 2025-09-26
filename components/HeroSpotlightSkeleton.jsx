import React from "react";
import { motion } from "framer-motion";
import styles from "../styles/HeroSpotlight.module.css";

const HeroSpotlightSkeleton = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Skeleton */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gray-700 animate-pulse" />
        <div className={`absolute inset-0 ${styles.heroGradientOverlay}`} />
        <div
          className={`absolute inset-0 ${styles.heroGradientOverlayBottom}`}
        />
      </div>

      {/* Content Skeleton */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 min-h-[80vh] items-center">
          {/* Hero Content Skeleton - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Pill Skeleton */}
            <div className="inline-block">
              <div className="w-32 h-8 bg-white/20 rounded-full animate-pulse" />
            </div>

            {/* Title Skeleton */}
            <div className="space-y-3">
              <div className="h-12 md:h-16 lg:h-20 bg-white/30 rounded-lg animate-pulse w-full" />
              <div className="h-12 md:h-16 lg:h-20 bg-white/30 rounded-lg animate-pulse w-4/5" />
              <div className="h-12 md:h-16 lg:h-20 bg-white/30 rounded-lg animate-pulse w-3/5" />
            </div>

            {/* Excerpt Skeleton */}
            <div className="space-y-2 max-w-3xl">
              <div className="h-6 bg-white/20 rounded animate-pulse w-full" />
              <div className="h-6 bg-white/20 rounded animate-pulse w-4/5" />
            </div>

            {/* Meta Information Skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-24 h-6 bg-white/20 rounded animate-pulse" />
              <div className="w-20 h-6 bg-white/20 rounded-full animate-pulse" />
              <div className="w-28 h-6 bg-white/20 rounded animate-pulse" />
            </div>

            {/* CTA Button Skeleton */}
            <div className="pt-4">
              <div className="w-48 h-12 bg-primary/60 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Auxiliary Posts Skeleton - Right Side */}
          <div className="lg:col-span-1 space-y-4">
            <div className="mb-6">
              <div className="w-24 h-6 bg-white/30 rounded animate-pulse mb-2" />
              <div className="w-16 h-1 bg-primary/60 rounded-full" />
            </div>

            {[1, 2].map((index) => (
              <div key={index} className={`rounded-xl p-4 ${styles.glassCard}`}>
                <div className="flex gap-4">
                  {/* Mini Image Skeleton */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white/20 animate-pulse" />

                  {/* Content Skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Category Skeleton */}
                    <div className="w-16 h-3 bg-primary/40 rounded animate-pulse" />

                    {/* Title Skeleton */}
                    <div className="space-y-1">
                      <div className="h-4 bg-white/30 rounded animate-pulse w-full" />
                      <div className="h-4 bg-white/30 rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator Skeleton */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center backdrop-blur-sm bg-white/5">
          <div className="w-1 h-3 bg-white/40 rounded-full mt-2 animate-pulse" />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-white/40 font-medium">Loading...</span>
        </div>
      </div>

      {/* Loading Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full mb-4 mx-auto"
          />
          <p className="text-white/80 font-medium">
            Loading featured content...
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSpotlightSkeleton;
