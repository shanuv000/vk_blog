import React, { useState, useEffect, memo, useRef } from "react";
import dynamic from "next/dynamic";
import { ClipLoader } from "react-spinners";
import Head from "next/head";
import { motion } from "framer-motion";

// Import carousel directly to avoid dynamic import issues
import Carousel from "react-multi-carousel";
// Import styles
import "react-multi-carousel/lib/styles.css";

import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";
import { getDirectFeaturedPosts } from "../services/direct-api";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1024 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 768, min: 640 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 640, min: 0 },
    items: 1,
  },
};

// Custom arrow components memoized to prevent re-renders
// The onClick prop is passed by react-multi-carousel and needs to be used
const LeftArrow = memo(({ onClick }) => (
  <motion.div
    className="absolute arrow-btn left-0 text-center py-3 cursor-pointer bg-gradient-to-r from-primary to-urtechy-orange rounded-full z-10"
    onClick={onClick}
    whileHover={{
      scale: 1.1,
      boxShadow: "0 15px 25px -5px rgba(229, 9, 20, 0.4)",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    style={{ backdropFilter: "blur(4px)" }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 text-white w-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  </motion.div>
));

const RightArrow = memo(({ onClick }) => (
  <motion.div
    className="absolute arrow-btn right-0 text-center py-3 cursor-pointer bg-gradient-to-r from-urtechy-orange to-primary rounded-full z-10"
    onClick={onClick}
    whileHover={{
      scale: 1.1,
      boxShadow: "0 15px 25px -5px rgba(229, 9, 20, 0.4)",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
    style={{ backdropFilter: "blur(4px)" }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 text-white w-full"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  </motion.div>
));

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef(null);

  // Preload images for better LCP
  const preloadImages = (posts) => {
    if (!posts || posts.length === 0) return null;

    // Only preload the first image to improve performance
    const imageUrl = posts[0]?.featuredImage?.url;
    if (!imageUrl) return null;

    return (
      <Head>
        <link
          key="preload-featured-image"
          rel="preload"
          as="image"
          href={imageUrl}
          // Don't use imagesrcset as it can cause warnings
          // Just preload the main image
        />
      </Head>
    );
  };

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);

        // Try the direct API first for more reliable data fetching
        let result;
        try {
          console.log("Fetching featured posts with direct API");
          result = await getDirectFeaturedPosts();
        } catch (directError) {
          console.error(
            "Direct API failed, falling back to regular API:",
            directError
          );
          result = await getFeaturedPosts();
        }

        // Handle case where result might be empty or undefined
        if (!result || !Array.isArray(result)) {
          console.warn("Featured posts result is not an array:", result);
          setFeaturedPosts([]);
          setDataLoaded(true);
          return;
        }

        // Process images to ensure they have width and height
        const processedPosts = result.map((post) => ({
          ...post,
          // Ensure slug exists
          slug:
            post.slug || `post-${Math.random().toString(36).substring(2, 9)}`,
          // Ensure featuredImage exists with proper dimensions
          featuredImage: post.featuredImage
            ? {
                ...post.featuredImage,
                url:
                  post.featuredImage.url || "/api/default-image?type=featured",
                // Ensure width and height are numbers
                width: parseInt(post.featuredImage.width, 10) || 800,
                height: parseInt(post.featuredImage.height, 10) || 600,
              }
            : {
                url: "/api/default-image?type=featured",
                width: 800,
                height: 600,
              },
          // Ensure author exists
          author: post.author || {
            name: "Anonymous",
            photo: { url: "/api/default-image?type=avatar" },
          },
        }));

        setFeaturedPosts(processedPosts);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading featured posts:", error);
        // Set empty array to avoid null errors
        setFeaturedPosts([]);
        setDataLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Render a placeholder with the same dimensions during loading
  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="relative">
          {/* Section heading for loading state */}
          <motion.div
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary inline-block relative">
              <span className="bg-gradient-to-r from-primary to-urtechy-orange bg-clip-text text-transparent">
                Featured Content
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-urtechy-orange rounded-full"></span>
            </h2>
          </motion.div>

          {/* Loading placeholder */}
          <div className="h-80 bg-secondary-light/30 animate-pulse rounded-lg flex justify-center items-center backdrop-blur-sm border border-secondary-light/50">
            <ClipLoader color="#E50914" size={40} />
          </div>
        </div>
      </div>
    );
  }

  if (!dataLoaded || featuredPosts.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="mb-12 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Decorative background element */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-light/5 to-secondary-light/10 -z-10 rounded-xl blur-xl"></div>

      {/* Section heading */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary inline-block relative">
          <span className="bg-gradient-to-r from-primary to-urtechy-orange bg-clip-text text-transparent">
            Featured Content
          </span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-urtechy-orange rounded-full"></span>
        </h2>
      </motion.div>

      {preloadImages(featuredPosts)}
      <Carousel
        ref={carouselRef}
        infinite
        customLeftArrow={<LeftArrow />}
        customRightArrow={<RightArrow />}
        responsive={responsive}
        itemClass="px-4"
        ssr={true}
        swipeable={true}
        draggable={true}
        partialVisible={false}
        minimumTouchDrag={80}
        autoPlay={true}
        autoPlaySpeed={5000}
        shouldResetAutoplay={false}
        // Show dots for better navigation
        renderDotsOutside={true}
        showDots={true}
        dotListClass="flex justify-center gap-2 mt-6"
        // Improve performance
        rewind={false}
        rewindWithAnimation={false}
      >
        {featuredPosts.map((post, index) => (
          <FeaturedPostCard key={post.slug || index} post={post} />
        ))}
      </Carousel>
    </motion.div>
  );
};

export default FeaturedPosts;
