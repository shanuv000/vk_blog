import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";
import { getDirectFeaturedPosts } from "../services/direct-api";

// Enhanced CSS-based carousel styles
const carouselStyles = `
  .featured-posts-carousel {
    position: relative;
    padding: 16px 0 56px 0;
    width: 100%;
    overflow: hidden;
  }

  .carousel-container {
    display: flex;
    gap: 1.5rem;
  }

  .carousel-slide {
    flex: 0 0 auto;
    width: 100%;
  }

  @media (min-width: 640px) {
    .carousel-slide {
      width: calc(50% - 0.75rem);
    }
  }

  @media (min-width: 1024px) {
    .carousel-slide {
      width: calc(33.333% - 1rem);
    }
    .carousel-container {
      gap: 1.5rem;
    }
  }

  @media (min-width: 1536px) {
    .carousel-slide {
      width: calc(25% - 1.125rem);
    }
    .carousel-container {
      gap: 1.5rem;
    }
  }

  .carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(20, 20, 20, 0.95);
    backdrop-filter: blur(12px);
    border: 2px solid rgba(35, 35, 35, 0.8);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .carousel-button:hover {
    background: rgba(229, 9, 20, 1);
    border-color: rgba(229, 9, 20, 1);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 8px 24px rgba(229, 9, 20, 0.4);
  }

  .carousel-button-prev {
    left: -8px;
  }

  .carousel-button-next {
    right: -8px;
  }

  @media (min-width: 640px) {
    .carousel-button-prev {
      left: -20px;
    }
    .carousel-button-next {
      right: -20px;
    }
  }

  .carousel-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 32px;
  }

  .carousel-dot {
    position: relative;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: none;
    background: rgba(100, 100, 100, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .carousel-dot:hover {
    background: rgba(229, 9, 20, 0.6);
    transform: scale(1.2);
  }

  .carousel-dot.active {
    width: 32px;
    height: 10px;
    border-radius: 5px;
    background: rgba(229, 9, 20, 1);
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
      className="mb-12 relative"
      aria-labelledby="featured-content-header"
    >
      {/* Clean background - no animations for faster load */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-light/10 to-transparent -z-10 rounded-2xl"></div>

      <header
        className="mb-10 flex items-center justify-between"
        id="featured-content-header"
      >
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 bg-primary rounded-full"></div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
              Featured <span className="text-primary">Stories</span>
            </h2>
            <p className="mt-1 text-text-secondary text-sm">
              Handpicked articles worth your time
            </p>
          </div>
        </div>

        {/* Page counter for desktop */}
        {featuredPosts.length > visibleItems && maxIndex > 0 && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="font-bold text-text-primary text-lg">
              {currentIndex + 1}
            </span>
            <span className="text-text-secondary">/</span>
            <span className="text-text-secondary">{maxIndex + 1}</span>
          </div>
        )}
      </header>
      {preloadImages(featuredPosts)}
      <style jsx global>
        {carouselStyles}
      </style>
      <div className="relative">
        <div
          className="featured-posts-carousel"
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
          aria-label="Featured articles carousel"
        >
          {/* Navigation buttons - cleaner style */}
          {featuredPosts.length > visibleItems && (
            <>
              <button
                className="carousel-button carousel-button-prev"
                onClick={prevSlide}
                aria-label="Previous slides"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                className="carousel-button carousel-button-next"
                onClick={nextSlide}
                aria-label="Next slides"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Carousel container - smooth transitions */}
          <div
            ref={containerRef}
            className="carousel-container"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleItems}%)`,
              transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {featuredPosts.map((post, idx) => (
              <div key={post.slug || idx} className="carousel-slide">
                <div className="px-2 h-full">
                  <FeaturedPostCard
                    post={post}
                    priority={idx === 0}
                    index={idx}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dots pagination - cleaner style */}
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
    </section>
  );
};

export default FeaturedPosts;
