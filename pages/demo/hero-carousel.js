/**
 * Featured Hero Carousel Demo Page
 * Showcases the new hero slider with featured content
 */

import React from "react";
import { motion } from "framer-motion";
import FeaturedHeroCarousel from "../../components/FeaturedHeroCarousel";
import FeaturedCarouselGrid from "../../components/FeaturedCarouselGrid";
import { demoFeaturedPosts } from "../../utils/heroSpotlightDemo";
import Head from "next/head";

const HeroCarouselDemo = () => {
  const [activeView, setActiveView] = React.useState("hero"); // "hero" or "grid"

  return (
    <>
      <Head>
        <title>Featured Hero Carousel Demo | VK Blog</title>
        <meta
          name="description"
          content="Demo showcasing the premium featured hero carousel component"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95"
        >
          <div className="container mx-auto px-6 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Enhanced Featured Carousels
                </span>
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Premium sliders with advanced features and grid layouts
              </p>

              {/* View Toggle */}
              <div className="mt-6 inline-flex gap-3 bg-gray-100 p-2 rounded-full">
                <button
                  onClick={() => setActiveView("hero")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    activeView === "hero"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Full Hero
                </button>
                <button
                  onClick={() => setActiveView("grid")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                    activeView === "grid"
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Grid Layout
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Demo Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Live Demo */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Live Demo -{" "}
                {activeView === "hero" ? "Full Hero" : "Grid Layout"}
              </h2>
              <p className="text-gray-600 text-lg">
                {activeView === "hero"
                  ? "Full-screen hero with enhanced controls and fullscreen mode"
                  : "Hero with thumbnail grid for better navigation"}
              </p>
            </div>

            {activeView === "hero" ? (
              <FeaturedHeroCarousel
                featuredPosts={demoFeaturedPosts}
                autoplayInterval={5000}
                showThumbnails={true}
                enableFullscreen={true}
                showViewCount={true}
              />
            ) : (
              <FeaturedCarouselGrid
                featuredPosts={demoFeaturedPosts}
                autoplayInterval={5000}
                showStats={true}
                maxGridItems={6}
              />
            )}
          </motion.section>

          {/* Features Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Key Features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon="🎨"
                title="Stunning Visuals"
                description="Full-screen hero layout with high-quality image backgrounds and smooth transitions"
              />
              <FeatureCard
                icon="🎮"
                title="Enhanced Controls"
                description="Navigation arrows, dots, autoplay, fullscreen, share, and keyboard support"
              />
              <FeatureCard
                icon="⚡"
                title="Performance"
                description="Optimized images, lazy loading, and fast animations"
              />
              <FeatureCard
                icon="📱"
                title="Responsive"
                description="Perfect on all devices with touch-friendly controls"
              />
              <FeatureCard
                icon="🖼️"
                title="Thumbnail Grid"
                description="Visual preview grid for quick navigation between slides"
              />
              <FeatureCard
                icon="🎯"
                title="Fullscreen Mode"
                description="Immersive fullscreen viewing with keyboard toggle (F key)"
              />
              <FeatureCard
                icon="🔗"
                title="Social Sharing"
                description="Built-in share functionality with native API support"
              />
              <FeatureCard
                icon="🔧"
                title="Hygraph Ready"
                description="Optimized for Hygraph MVP data structure and queries"
              />
            </div>
          </motion.section>

          {/* Usage Example */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Implementation
              </h2>
              <p className="text-gray-600 text-lg">
                Simple to integrate into your project
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`import { FeaturedHeroCarousel, FeaturedCarouselGrid } from '../components';

// Option 1: Full Hero with Enhanced Features
<FeaturedHeroCarousel 
  featuredPosts={featuredPosts}
  autoplayInterval={6000}
  showThumbnails={true}      // Show thumbnail strip
  enableFullscreen={true}    // Enable fullscreen mode
  showViewCount={true}       // Show view statistics
/>

// Option 2: Grid Layout with Thumbnails
<FeaturedCarouselGrid
  featuredPosts={featuredPosts}
  autoplayInterval={6000}
  showStats={true}           // Show trending badges
/>

// Both components work with Hygraph data:
// - Optimized queries for featured posts
// - Supports all post fields
// - Handles missing data gracefully`}</code>
              </pre>
            </div>
          </motion.section>

          {/* Controls Guide */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                User Controls
              </h2>
              <p className="text-gray-600 text-lg">
                Multiple ways to navigate the carousel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ControlCard
                title="Keyboard Navigation"
                items={[
                  "← → Arrow Keys: Navigate slides",
                  "Spacebar: Toggle autoplay",
                  "F Key: Toggle fullscreen",
                  "Tab: Focus controls",
                ]}
              />
              <ControlCard
                title="Mouse Controls"
                items={[
                  "Click arrows: Previous/Next",
                  "Click dots: Jump to slide",
                  "Click thumbnails: Direct navigation",
                  "Hover: Pause autoplay",
                ]}
              />
              <ControlCard
                title="Enhanced Features"
                items={[
                  "Share button: Native sharing",
                  "Fullscreen: Immersive view",
                  "Progress bar: Visual timing",
                  "Stats: Trending indicators",
                ]}
              />
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center py-12"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Use on Your Site?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Check out the complete implementation guide
              </p>
              <a
                href="/FEATURED_HERO_CAROUSEL_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                View Documentation →
              </a>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

// Control Card Component
const ControlCard = ({ title, items }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
    <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-gray-600 flex items-start">
          <span className="text-blue-600 mr-2">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default HeroCarouselDemo;
