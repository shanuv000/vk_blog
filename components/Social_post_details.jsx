"use client";
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, useAnimation } from "framer-motion";
import {
  FaXTwitter,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
  FaInstagram,
} from "react-icons/fa6";
import {
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_FEATURED_IMAGE,
} from "./DefaultAvatar";

// Intersection Observer Hook
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
};

const NavbarPostDetails = ({ post }) => {
  // Safely extract properties with fallbacks
  const title = post?.title || "urTechy Blog Post";
  const slug = post?.slug || "";
  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${slug}`;

  // Ensure we're using the featured image and not accidentally using author image
  // First check if featuredImage exists and has a url property
  const hasFeaturedImage = post?.featuredImage && post.featuredImage.url;

  // Use the same default image as in PostDetail component if no featured image
  // For social sharing, use the absolute URL with fallbacks
  const imageUrl = hasFeaturedImage
    ? post.featuredImage.url
    : `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;

  // Function to handle image URL errors in social sharing
  const getSafeImageUrl = () => {
    // If the original URL fails, use the fallback
    if (!hasFeaturedImage) {
      return `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;
    }

    // Check if the URL is from Hygraph/GraphCMS
    if (
      post.featuredImage.url.includes("graphassets.com") ||
      post.featuredImage.url.includes("hygraph.com")
    ) {
      try {
        // Add a timestamp to bypass cache
        const url = new URL(post.featuredImage.url);
        url.searchParams.append("_t", Date.now());
        return url.toString();
      } catch (e) {
        // Keep console.error for production error tracking
        console.error("Error parsing image URL:", e);
        return FALLBACK_FEATURED_IMAGE;
      }
    }

    return post.featuredImage.url;
  };
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [controls, inView, imageUrl, hasFeaturedImage, post]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      className="mb-8 border-y border-secondary-light py-4"
    >
      <h3 className="text-text-primary font-heading text-lg mb-3 text-center">
        Share this article
      </h3>
      <div className="flex justify-center space-x-3 md:space-x-4">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `${title} - ${postUrl}${imageUrl ? " 📷" : ""}`
          )}`}
          data-action="share/whatsapp/share"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp size={20} className="text-white" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.instagram.com/?url=${encodeURIComponent(
            postUrl
          )}&media=${encodeURIComponent(getSafeImageUrl())}`}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          title="Share on Instagram"
          aria-label="Share on Instagram"
        >
          <FaInstagram size={20} className="text-white" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            postUrl
          )}&picture=${encodeURIComponent(
            getSafeImageUrl()
          )}&quote=${encodeURIComponent(title)}`}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          title="Share on Facebook"
          aria-label="Share on Facebook"
        >
          <FaFacebook size={20} className="text-white" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(
            postUrl
          )}&via=Onlyblogs_&hashtags=urtechy,blog${`&image=${encodeURIComponent(
            getSafeImageUrl()
          )}`}`}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          title="Share on Twitter"
          aria-label="Share on Twitter"
        >
          <FaXTwitter size={20} className="text-white" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            postUrl
          )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
            title
          )}&source=urTechy`}
          className="items-center justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 hidden lg:flex"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <FaLinkedin size={20} className="text-white" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`http://www.reddit.com/submit?url=${encodeURIComponent(
            postUrl
          )}&title=${encodeURIComponent(title)}`}
          className="items-center justify-center w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 hidden lg:flex"
          title="Share on Reddit"
          aria-label="Share on Reddit"
        >
          <FaReddit size={20} className="text-white" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`http://pinterest.com/pin/create/button/?url=${encodeURIComponent(
            postUrl
          )}&description=${encodeURIComponent(
            title
          )}&media=${encodeURIComponent(getSafeImageUrl())}`}
          className="items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 hidden lg:flex"
          title="Share on Pinterest"
          aria-label="Share on Pinterest"
        >
          <FaPinterest size={20} className="text-white" />
        </a>
      </div>
    </motion.div>
  );
};

NavbarPostDetails.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string,
    featuredImage: PropTypes.shape({
      url: PropTypes.string,
    }),
  }).isRequired,
};

export default NavbarPostDetails;
