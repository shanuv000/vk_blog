import React, { useState, useEffect, memo, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import { ClipLoader } from "react-spinners";

// Dynamically import the carousel to reduce initial bundle size
const Carousel = dynamic(() => import("react-multi-carousel"), {
  ssr: false,
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

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const result = await getFeaturedPosts();
        setFeaturedPosts(result);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading featured posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-8 flex justify-center items-center py-8">
        <ClipLoader color="#FF4500" size={30} />
      </div>
    );
  }

  if (!dataLoaded || featuredPosts.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <Carousel
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
      >
        {featuredPosts.map((post, index) => (
          <FeaturedPostCard key={post.slug || index} post={post} />
        ))}
      </Carousel>
    </div>
  );
};

export default FeaturedPosts;
