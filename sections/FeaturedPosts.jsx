import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";
import { getDirectFeaturedPosts } from "../services/direct-api";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Modern Swiper carousel styles
const swiperStyles = `
  .featured-posts-swiper {
    position: relative;
    padding: 16px 0 48px 0;
    width: 100%;
    overflow: visible;
  }

  .featured-posts-swiper .swiper-wrapper {
    align-items: stretch;
  }

  .featured-posts-swiper .swiper-slide {
    height: auto;
    display: flex;
    align-items: stretch;
  }

  .featured-posts-swiper .swiper-button-next,
  .featured-posts-swiper .swiper-button-prev {
    width: 44px;
    height: 44px;
    margin-top: -22px;
    border-radius: 12px;
    background: rgba(229, 9, 20, 0.9);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  }

  .featured-posts-swiper .swiper-button-next:hover,
  .featured-posts-swiper .swiper-button-prev:hover {
    background: rgba(229, 9, 20, 1);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .featured-posts-swiper .swiper-button-next::after,
  .featured-posts-swiper .swiper-button-prev::after {
    font-size: 16px;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .featured-posts-swiper .swiper-button-next {
    right: 16px;
  }

  .featured-posts-swiper .swiper-button-prev {
    left: 16px;
  }

  .featured-posts-swiper .swiper-pagination {
    bottom: 10px;
  }

  .featured-posts-swiper .swiper-pagination-bullet {
    width: 12px;
    height: 12px;
    background: rgba(229, 9, 20, 0.3);
    opacity: 0.5;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .featured-posts-swiper .swiper-pagination-bullet-active {
    background: rgba(229, 9, 20, 1);
    opacity: 1;
    transform: scale(1.2);
  }

  @media (max-width: 640px) {
    .featured-posts-swiper .swiper-button-next,
    .featured-posts-swiper .swiper-button-prev {
      width: 40px;
      height: 40px;
      margin-top: -20px;
    }

    .featured-posts-swiper .swiper-button-next::after,
    .featured-posts-swiper .swiper-button-prev::after {
      font-size: 14px;
    }
  }
`;

// Keyboard navigation handler for Swiper carousel
function useCarouselKeyboardControls(swiperRef) {
  useEffect(() => {
    if (!swiperRef.current) return;
    const handler = (e) => {
      if (
        document.activeElement &&
        document.activeElement.closest &&
        document.activeElement.closest(".featured-posts-swiper")
      ) {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          swiperRef.current.swiper.slidePrev();
        } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          swiperRef.current.swiper.slideNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [swiperRef]);
}

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const swiperRef = useRef(null);

  useCarouselKeyboardControls(swiperRef);

  // Simple data loading - no complex initialization needed with Swiper

  // Preload visible images for best performance
  const preloadImages = (posts) => {
    if (!posts?.length) return null;
    const imagesToPreload = posts
      .slice(0, 4)
      .filter((p) => p?.featuredImage?.url);
    return (
      <Head>
        <link rel="preload" href="/styles/medium-typography.css" as="style" />
        <link
          key="preload-featured-image-1"
          rel="preload"
          as="image"
          href={imagesToPreload[0].featuredImage.url}
          fetchpriority="high"
        />
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

  // Fetch all posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        let result;
        try {
          result = await getDirectFeaturedPosts();
        } catch {
          result = await getFeaturedPosts();
        }
        if (!Array.isArray(result)) {
          setFeaturedPosts([]);
          setDataLoaded(true);
          return;
        }
        // Filter out posts without valid slugs and titles
        const validPosts = result.filter(
          (post) => post && post.slug && post.title
        );

        const processedPosts = validPosts.map((post) => ({
          ...post,
          slug: post.slug,
          featuredImage: post.featuredImage
            ? {
                ...post.featuredImage,
                url:
                  post.featuredImage.url || "/api/default-image?type=featured",
                // Fix invalid dimensions (0x0) with proper defaults
                width:
                  parseInt(post.featuredImage.width, 10) > 0
                    ? parseInt(post.featuredImage.width, 10)
                    : 800,
                height:
                  parseInt(post.featuredImage.height, 10) > 0
                    ? parseInt(post.featuredImage.height, 10)
                    : 600,
              }
            : {
                url: "/api/default-image?type=featured",
                width: 800,
                height: 600,
              },
          author: post.author || {
            name: "Anonymous",
            photo: { url: "/api/default-image?type=avatar" },
          },
        }));

        setFeaturedPosts(processedPosts);
        setDataLoaded(true);
      } catch {
        setFeaturedPosts([]);
        setDataLoaded(true);
      }
    };
    loadPosts();
  }, []);

  // Don't render until data is loaded and we have posts
  if (!dataLoaded || !featuredPosts.length) return null;

  return (
    <section
      className="mb-16 relative opacity-0 animate-fadeIn"
      aria-labelledby="featured-content-header"
      style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
    >
      {/* Simplified background - removed blur effects for better performance */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-light/5 to-secondary-light/10 -z-10 rounded-2xl"></div>

      <header
        className="mb-10 text-center opacity-0 animate-fadeIn"
        style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
        id="featured-content-header"
      >
        <div className="relative inline-block">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-text-primary relative z-10">
            <span className="bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">
              Featured Content
            </span>
          </h2>
          {/* Simplified underline without glow effects */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full"></div>
        </div>
        <p className="mt-4 text-text-secondary/80 text-lg font-medium max-w-2xl mx-auto">
          Discover our most popular and engaging articles
        </p>
      </header>
      {preloadImages(featuredPosts)}
      <style jsx global>
        {swiperStyles}
      </style>
      <div className="relative">
        <div
          className="opacity-0 animate-fadeIn"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <Swiper
            ref={swiperRef}
            modules={[Navigation, Pagination, Autoplay]}
            className="featured-posts-swiper"
            spaceBetween={32}
            slidesPerView={1}
            centeredSlides={true}
            loop={featuredPosts.length > 1}
            autoplay={
              featuredPosts.length > 1
                ? {
                    delay: 6000, // Increased delay for better performance
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            navigation={true}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                centeredSlides: false,
              },
              1024: {
                slidesPerView: 3,
                centeredSlides: false,
              },
              1536: {
                slidesPerView: 4,
                centeredSlides: false,
              },
            }}
            onSwiper={(swiper) => {
              // Ensure first slide is active on initialization
              setTimeout(() => {
                swiper.slideTo(0, 0);
              }, 100);
            }}
            aria-label="Featured articles carousel"
          >
            {featuredPosts.map((post, idx) => (
              <SwiperSlide key={post.slug || idx}>
                <div
                  className="h-full opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: `${0.4 + idx * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="px-2 h-full">
                    <FeaturedPostCard post={post} />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
