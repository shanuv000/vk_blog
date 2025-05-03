import React, { useState, useEffect, memo, useRef } from "react";
import dynamic from "next/dynamic";
import { ClipLoader } from "react-spinners";
import Head from "next/head";
import { motion } from "framer-motion";

// Dynamically import the carousel with preload and error handling
const Carousel = dynamic(
  () =>
    import("react-multi-carousel")
      .then((mod) => mod.default)
      .catch((err) => {
        console.error("Failed to load carousel:", err);
        // Return a fallback component if the carousel fails to load
        return (props) => (
          <div className="overflow-x-auto py-4">
            <div className="flex space-x-4 px-4">{props.children}</div>
          </div>
        );
      }),
  {
    ssr: true, // Enable SSR for faster initial load
    loading: () => (
      <div className="flex justify-center items-center py-8">
        <ClipLoader color="#FF4500" size={30} />
      </div>
    ),
  }
);

// Import styles directly to avoid preload warnings
import "react-multi-carousel/lib/styles.css";

import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";

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
    className="absolute arrow-btn left-0 text-center py-3 cursor-pointer bg-urtechy-red rounded-full z-10"
    onClick={onClick}
    whileHover={{
      scale: 1.1,
      boxShadow: "0 10px 15px -3px rgba(255, 69, 0, 0.3)",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
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
    className="absolute arrow-btn right-0 text-center py-3 cursor-pointer bg-urtechy-red rounded-full z-10"
    onClick={onClick}
    whileHover={{
      scale: 1.1,
      boxShadow: "0 10px 15px -3px rgba(255, 69, 0, 0.3)",
    }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2 }}
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
        const result = await getFeaturedPosts();

        // Process images to ensure they have width and height
        const processedPosts = result.map((post) => ({
          ...post,
          featuredImage: post.featuredImage
            ? {
                ...post.featuredImage,
                // Ensure width and height are numbers
                width: parseInt(post.featuredImage.width, 10) || 800,
                height: parseInt(post.featuredImage.height, 10) || 600,
              }
            : null,
        }));

        setFeaturedPosts(processedPosts);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading featured posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Render a placeholder with the same dimensions during loading
  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="h-72 bg-gray-200 animate-pulse rounded-lg flex justify-center items-center">
          <ClipLoader color="#FF4500" size={30} />
        </div>
      </div>
    );
  }

  if (!dataLoaded || featuredPosts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
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
        autoPlay={false}
        shouldResetAutoplay={false}
        // Reduce initial load time
        renderDotsOutside={false}
        showDots={false}
        // Improve performance
        rewind={false}
        rewindWithAnimation={false}
      >
        {featuredPosts.map((post, index) => (
          <FeaturedPostCard key={post.slug || index} post={post} />
        ))}
      </Carousel>
    </div>
  );
};

export default FeaturedPosts;
