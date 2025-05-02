import React, { useState, useEffect, memo, useRef } from "react";
import dynamic from "next/dynamic";
import { ClipLoader } from "react-spinners";
import Head from "next/head";

// Dynamically import the carousel with preload
const Carousel = dynamic(() => import("react-multi-carousel"), {
  ssr: true, // Enable SSR for faster initial load
  loading: () => (
    <div className="flex justify-center items-center py-8">
      <ClipLoader color="#FF4500" size={30} />
    </div>
  ),
});

// Import styles only when Carousel is loaded
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
const LeftArrow = memo(() => (
  <div className="absolute arrow-btn left-0 text-center py-3 cursor-pointer bg-urtechy-red rounded-full">
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
  </div>
));

const RightArrow = memo(() => (
  <div className="absolute arrow-btn right-0 text-center py-3 cursor-pointer bg-urtechy-red rounded-full">
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
  </div>
));

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef(null);

  // Preload images for better LCP
  const preloadImages = (posts) => {
    if (!posts || posts.length === 0) return;

    // Only preload the first 3 images to improve performance
    const imagesToPreload = posts
      .slice(0, 3)
      .map((post) => post.featuredImage?.url)
      .filter(Boolean);

    return (
      <Head>
        {imagesToPreload.map((imageUrl, index) => (
          <link
            key={`preload-image-${index}`}
            rel="preload"
            as="image"
            href={imageUrl}
            // Modern format if supported
            imagesrcset={`${imageUrl}?w=640 640w, ${imageUrl}?w=750 750w, ${imageUrl}?w=828 828w`}
            imagesizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ))}
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
