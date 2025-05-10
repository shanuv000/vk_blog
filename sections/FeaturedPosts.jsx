import React, { useState, useEffect, useRef } from "react";
import { ClipLoader } from "react-spinners";
import Head from "next/head";
import { motion } from "framer-motion";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Custom styles for Swiper
const swiperStyles = `
  .swiper-button-prev::after,
  .swiper-button-next::after {
    display: none;
  }

  .swiper-pagination-bullet {
    opacity: 0.7;
    transition: all 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    opacity: 1;
    transform: scale(1.2);
  }
`;
// Import required modules
import { Pagination, Navigation, Autoplay } from "swiper/modules";

import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";
import { getDirectFeaturedPosts } from "../services/direct-api";

// Custom navigation buttons for Swiper
const NavigationButtons = () => {
  return (
    <>
      <motion.div
        className="swiper-button-prev absolute arrow-btn left-0 text-center py-3 cursor-pointer bg-gradient-to-r from-primary to-urtechy-orange rounded-full z-10"
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
      <motion.div
        className="swiper-button-next absolute arrow-btn right-0 text-center py-3 cursor-pointer bg-gradient-to-r from-urtechy-orange to-primary rounded-full z-10"
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
    </>
  );
};

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const swiperRef = useRef(null);

  // Preload images for better LCP
  const preloadImages = (posts) => {
    if (!posts || posts.length === 0) return null;

    // Preload the first few images for better performance
    // Only preload visible slides based on viewport size
    const imagesToPreload = posts
      .slice(0, 4)
      .filter((post) => post?.featuredImage?.url);
    if (imagesToPreload.length === 0) return null;

    return (
      <Head>
        {/* Preload critical CSS */}
        <link rel="preload" href="/styles/medium-typography.css" as="style" />

        {/* Preload first image with high priority for LCP */}
        <link
          key="preload-featured-image-1"
          rel="preload"
          as="image"
          href={imagesToPreload[0].featuredImage.url}
          fetchpriority="high"
        />

        {/* Preload additional images with lower priority */}
        {imagesToPreload.slice(1).map((post, index) => (
          <link
            key={`preload-featured-image-${index + 2}`}
            rel="preload"
            as="image"
            href={post.featuredImage.url}
            fetchpriority="low"
          />
        ))}
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
      <style jsx global>
        {swiperStyles}
      </style>
      <div className="relative">
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          modules={[Pagination, Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{
            clickable: true,
            el: ".swiper-pagination",
            bulletClass:
              "swiper-pagination-bullet bg-primary/50 inline-block w-3 h-3 rounded-full mx-1 cursor-pointer transition-all duration-300",
            bulletActiveClass:
              "swiper-pagination-bullet-active bg-primary w-4 h-4",
          }}
          navigation={{
            prevEl: ".swiper-button-prev",
            nextEl: ".swiper-button-next",
            disabledClass: "opacity-30 cursor-not-allowed",
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 40,
            },
          }}
          className="pb-12"
        >
          {featuredPosts.map((post, index) => (
            <SwiperSlide key={post.slug || index} className="px-2">
              <FeaturedPostCard post={post} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-pagination mt-6 flex justify-center gap-2"></div>
        <NavigationButtons />
      </div>
    </motion.div>
  );
};

export default FeaturedPosts;
