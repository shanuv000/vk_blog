import React, { useState, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import AutoplayPlugin from "embla-carousel-autoplay";
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from "../components/CarouselButtons";
import { FeaturedPostCard } from "../components";
import { getFeaturedPosts } from "../services";
import { getDirectFeaturedPosts } from "../services/direct-api";

// Embla styles without dot buttons
const emblaStyles = `
  .embla {
    position: relative;
    padding: 12px 0 44px 0;
    width: 100%;
    overflow: visible;
  }
  .embla__viewport {
    overflow: hidden;
    border-radius: 20px;
    outline: none;
    transition: box-shadow .25s;
    width: 100%;
    background: transparent;
  }
  .embla__container {
    display: flex;
    flex-wrap: nowrap;
    user-select: none;
    will-change: transform;
    -webkit-touch-callout: none;
    touch-action: pan-y pinch-zoom;
    gap: 1.5rem;
    padding-bottom: 8px;
  }
  .embla__slide {
    min-width: 0;
    flex: 0 0 100%;
    transition: transform .4s cubic-bezier(.23,1,.32,1), box-shadow .2s;
    outline: none;
  }
  @media(min-width: 640px){ .embla__slide { flex-basis: 50%; } }
  @media(min-width: 1024px){ .embla__slide { flex-basis: 33.3%; } }
  @media(min-width: 1536px){ .embla__slide { flex-basis: 25%; } }
  .embla__slide:focus-within, .embla__slide--active {
    z-index: 1;
    box-shadow: 0 8px 36px -6px #e5091470;
    outline: 3px solid #E50914;
  }
  /* Hide embla dots completely */
  .embla__dots, .embla__dot { display: none !important; }
  @media (max-width: 640px) {
    .embla__button {
      transform: scale(0.88);
    }
  }
`;

// Keyboard navigation handler for carousel area focus
function useCarouselKeyboardControls(emblaApi) {
  useEffect(() => {
    if (!emblaApi) return;
    const handler = (e) => {
      if (
        document.activeElement &&
        document.activeElement.closest &&
        document.activeElement.closest(".embla__viewport")
      ) {
        if (
          (e.key === "ArrowLeft" || e.key === "ArrowUp") &&
          emblaApi.canScrollPrev()
        ) {
          emblaApi.scrollPrev();
        } else if (
          (e.key === "ArrowRight" || e.key === "ArrowDown") &&
          emblaApi.canScrollNext()
        ) {
          emblaApi.scrollNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [emblaApi]);
}

const FeaturedPosts = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const autoplayOptions = {
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    rootNode: (emblaRoot) => emblaRoot.parentElement,
  };
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps",
      slidesToScroll: 1, // Ensures carousel can scroll by one card, but all cards render
    },
    [AutoplayPlugin(autoplayOptions)]
  );
  const { prevBtnDisabled, nextBtnDisabled } = usePrevNextButtons(emblaApi);
  useCarouselKeyboardControls(emblaApi);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => {});
    return () => emblaApi.off("select");
  }, [emblaApi]);

  // Preload visible images for best perf (optional, but keeps LCP optimized)
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

  // Fetch all posts (make sure all available posts are set!)
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
        const processedPosts = result.map((post) => ({
          ...post,
          slug: post.slug || `post-${Math.random().toString(36).slice(2, 9)}`,
          featuredImage: post.featuredImage
            ? {
                ...post.featuredImage,
                url:
                  post.featuredImage.url || "/api/default-image?type=featured",
                width: parseInt(post.featuredImage.width, 10) || 800,
                height: parseInt(post.featuredImage.height, 10) || 600,
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

  // Render nothing if no posts
  if (!dataLoaded || !featuredPosts.length) return null;

  return (
    <motion.section
      className="mb-12 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="featured-content-header"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-secondary-light/5 to-secondary-light/10 -z-10 rounded-xl blur-xl"></div>
      <motion.header
        className="mb-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        id="featured-content-header"
      >
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary inline-block relative">
          <span className="bg-gradient-to-r from-primary to-urtechy-orange bg-clip-text text-transparent">
            Featured Content
          </span>
          <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-urtechy-orange rounded-full"></span>
        </h2>
      </motion.header>
      {preloadImages(featuredPosts)}
      <style jsx global>
        {emblaStyles}
      </style>
      <div className="relative">
        <div
          className="embla group"
          tabIndex={0}
          aria-label="Featured articles carousel"
        >
          <div
            className="embla__viewport outline-none focus-visible:ring-4 focus-visible:ring-primary"
            ref={emblaRef}
          >
            <div className="embla__container">
              <AnimatePresence mode="wait" initial={false}>
                {featuredPosts.map((post, idx) => (
                  <motion.div
                    key={post.slug || idx}
                    className="embla__slide"
                    data-slide={idx}
                    aria-roledescription="slide"
                    aria-label={`Featured post ${idx + 1} of ${
                      featuredPosts.length
                    }`}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -32 }}
                    transition={{
                      type: "spring",
                      stiffness: 240,
                      damping: 28,
                      duration: 0.45,
                    }}
                  >
                    <div className="px-2">
                      <FeaturedPostCard post={post} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <PrevButton
            onClick={() => emblaApi?.scrollPrev()}
            disabled={prevBtnDisabled}
            aria-label="Previous featured article"
          />
          <NextButton
            onClick={() => emblaApi?.scrollNext()}
            disabled={nextBtnDisabled}
            aria-label="Next featured article"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturedPosts;
