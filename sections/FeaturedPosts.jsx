import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";
import { getDirectFeaturedPosts } from "../services/direct-api";

// Simple CSS-based carousel styles
const carouselStyles = `
  .featured-posts-carousel {
    position: relative;
    padding: 16px 0 48px 0;
    width: 100%;
    overflow: hidden;
  }

  .carousel-container {
    display: flex;
    transition: transform 0.5s ease;
    gap: 2rem;
  }

  .carousel-slide {
    flex: 0 0 auto;
    width: 100%;
  }

  @media (min-width: 640px) {
    .carousel-slide {
      width: calc(50% - 1rem);
    }
  }

  @media (min-width: 1024px) {
    .carousel-slide {
      width: calc(33.333% - 1.333rem);
    }
  }

  @media (min-width: 1536px) {
    .carousel-slide {
      width: calc(25% - 1.5rem);
    }
  }

  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(229, 9, 20, 0.9);
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .carousel-button:hover {
    background: rgba(229, 9, 20, 1);
    transform: translateY(-51px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .carousel-button-prev {
    left: 16px;
  }

  .carousel-button-next {
    right: 16px;
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
  }

  .carousel-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    background: rgba(229, 9, 20, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .carousel-dot.active {
    background: rgba(229, 9, 20, 1);
    transform: scale(1.2);
  }

  @media (max-width: 640px) {
    .carousel-button {
      width: 40px;
      height: 40px;
    }
  }
`;

// Simple carousel navigation hook
function useSimpleCarousel(itemsLength, autoplayDelay = 6000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const intervalRef = useRef(null);

  const getVisibleItems = () => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth >= 1536) return 4;
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 640) return 2;
    return 1;
  };

  const [visibleItems, setVisibleItems] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, itemsLength - visibleItems);

  const goToSlide = (index) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (isAutoplay && itemsLength > visibleItems) {
      intervalRef.current = setInterval(nextSlide, autoplayDelay);
      return () => clearInterval(intervalRef.current);
    }
  }, [isAutoplay, itemsLength, visibleItems, autoplayDelay]);

  const pauseAutoplay = () => setIsAutoplay(false);
  const resumeAutoplay = () => setIsAutoplay(true);

  return {
    currentIndex,
    visibleItems,
    maxIndex,
    goToSlide,
    nextSlide,
    prevSlide,
    pauseAutoplay,
    resumeAutoplay,
  };
}

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const containerRef = useRef(null);

  const {
    currentIndex,
    visibleItems,
    maxIndex,
    goToSlide,
    nextSlide,
    prevSlide,
    pauseAutoplay,
    resumeAutoplay,
  } = useSimpleCarousel(featuredPosts.length, 6000);

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
        {carouselStyles}
      </style>
      <div className="relative">
        <div
          className="opacity-0 animate-fadeIn"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <div
            className="featured-posts-carousel"
            onMouseEnter={pauseAutoplay}
            onMouseLeave={resumeAutoplay}
            aria-label="Featured articles carousel"
          >
            {/* Navigation buttons */}
            {featuredPosts.length > visibleItems && (
              <>
                <button
                  className="carousel-button carousel-button-prev"
                  onClick={prevSlide}
                  aria-label="Previous slides"
                >
                  ←
                </button>
                <button
                  className="carousel-button carousel-button-next"
                  onClick={nextSlide}
                  aria-label="Next slides"
                >
                  →
                </button>
              </>
            )}

            {/* Carousel container */}
            <div
              ref={containerRef}
              className="carousel-container"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / visibleItems
                }%)`,
              }}
            >
              {featuredPosts.map((post, idx) => (
                <div
                  key={post.slug || idx}
                  className="carousel-slide opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: `${0.4 + (idx % visibleItems) * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="px-2 h-full">
                    <FeaturedPostCard post={post} />
                  </div>
                </div>
              ))}
            </div>

            {/* Dots pagination */}
            {featuredPosts.length > visibleItems && maxIndex > 0 && (
              <div className="carousel-dots">
                {Array.from({ length: maxIndex + 1 }, (_, index) => (
                  <button
                    key={index}
                    className={`carousel-dot ${
                      currentIndex === index ? "active" : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPosts;
