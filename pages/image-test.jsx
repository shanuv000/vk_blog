import React, { useState } from "react";
import { motion } from "framer-motion";
import OptimizedImage from "../components/OptimizedImage";
import {
  FeaturedImageSkeleton,
  PostCardImageSkeleton,
  HeroImageSkeleton,
  SquareImageSkeleton,
  GalleryImageSkeleton,
} from "../components/ImageSkeletons";
import {
  ProgressiveImageLoader,
  ShimmerLoader,
  BlurUpLoader,
  RippleLoader,
} from "../components/ImageLoadingStates";

/**
 * Image Loading Test Page
 *
 * This page demonstrates the new optimized image loading system
 * with various loading states and skeleton components
 */

const ImageTestPage = () => {
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [showLoadingStates, setShowLoadingStates] = useState(false);

  // Test images from different sources
  const testImages = [
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      alt: "Mountain landscape",
      title: "High Quality Landscape",
    },
    {
      src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
      alt: "Forest path",
      title: "Forest Photography",
    },
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      alt: "Small mountain",
      title: "Optimized Small Image",
    },
    {
      src: "https://via.placeholder.com/800x600/E50914/FFFFFF?text=Fallback+Test",
      alt: "Fallback test",
      title: "Fallback Image Test",
    },
  ];

  return (
    <div className="min-h-screen bg-secondary text-text-primary">
      {/* Header */}
      <div className="bg-secondary-light border-b border-gray-700/30">
        <div className="container mx-auto px-6 py-8">
          <motion.h1
            className="text-4xl font-heading font-bold text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              Optimized Image Loading System
            </span>
          </motion.h1>
          <p className="text-text-secondary text-center max-w-2xl mx-auto">
            Demonstrating modern image loading with progressive enhancement,
            blur-up effects, and professional loading states.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Controls */}
        <div className="mb-12 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowSkeletons(!showSkeletons)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                showSkeletons
                  ? "bg-primary text-white shadow-lg"
                  : "bg-secondary-light text-text-secondary hover:bg-gray-700"
              }`}
            >
              {showSkeletons ? "Hide" : "Show"} Skeleton Components
            </button>
            <button
              onClick={() => setShowLoadingStates(!showLoadingStates)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                showLoadingStates
                  ? "bg-primary text-white shadow-lg"
                  : "bg-secondary-light text-text-secondary hover:bg-gray-700"
              }`}
            >
              {showLoadingStates ? "Hide" : "Show"} Loading States
            </button>
          </div>
        </div>

        {/* Skeleton Components Demo */}
        {showSkeletons && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-heading font-bold mb-8 text-center">
              Skeleton Loading Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Featured Image Skeleton
                </h3>
                <FeaturedImageSkeleton />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Post Card Skeleton
                </h3>
                <PostCardImageSkeleton />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Hero Image Skeleton
                </h3>
                <HeroImageSkeleton />
              </div>
            </div>
            <div className="mt-8 flex justify-center gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">
                  Avatar Skeletons
                </h3>
                <div className="flex gap-4 justify-center">
                  <SquareImageSkeleton size="small" />
                  <SquareImageSkeleton size="medium" />
                  <SquareImageSkeleton size="large" />
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Loading States Demo */}
        {showLoadingStates && (
          <motion.section
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-heading font-bold mb-8 text-center">
              Loading State Components
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-48 bg-secondary-light rounded-lg">
                <h3 className="absolute top-4 left-4 text-lg font-semibold z-20">
                  Progressive Loader
                </h3>
                <ProgressiveImageLoader
                  isLoading={true}
                  progress={65}
                  showProgress={true}
                />
              </div>
              <div className="relative h-48 bg-secondary-light rounded-lg">
                <h3 className="absolute top-4 left-4 text-lg font-semibold z-20">
                  Shimmer Loader
                </h3>
                <ShimmerLoader isLoading={true} intensity="medium" />
              </div>
              <div className="relative h-48 bg-secondary-light rounded-lg">
                <h3 className="absolute top-4 left-4 text-lg font-semibold z-20">
                  Blur-up Loader
                </h3>
                <BlurUpLoader isLoading={true} />
              </div>
              <div className="relative h-48 bg-secondary-light rounded-lg">
                <h3 className="absolute top-4 left-4 text-lg font-semibold z-20">
                  Ripple Loader
                </h3>
                <RippleLoader isLoading={true} />
              </div>
            </div>
          </motion.section>
        )}

        {/* OptimizedImage Demo */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-heading font-bold mb-8 text-center">
            OptimizedImage Component Demo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testImages.map((image, index) => (
              <motion.div
                key={index}
                className="bg-secondary-light rounded-lg overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative">
                  <OptimizedImage
                    src={image.src}
                    alt={image.alt}
                    fill={true}
                    aspectRatio="16/9"
                    quality={85}
                    showSkeleton={true}
                    className="object-cover"
                    containerClassName="w-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onLoad={() =>
                      console.log(`Image ${index + 1} loaded successfully`)
                    }
                    onError={(error) =>
                      console.warn(`Image ${index + 1} failed to load:`, error)
                    }
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary mb-2">
                    {image.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{image.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Performance Info */}
        <motion.section
          className="mt-16 bg-secondary-light rounded-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-heading font-bold mb-6 text-center">
            Performance Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Progressive Loading</h3>
              <p className="text-text-secondary text-sm">
                Images load with smooth blur-up effects and progressive
                enhancement
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Smart Lazy Loading</h3>
              <p className="text-text-secondary text-sm">
                Intelligent loading based on viewport visibility and priority
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold">🔄</span>
              </div>
              <h3 className="font-semibold mb-2">Automatic Fallbacks</h3>
              <p className="text-text-secondary text-sm">
                Graceful error handling with automatic fallback images
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ImageTestPage;
