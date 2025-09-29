"use client";
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { motion, useAnimation } from "framer-motion";
import {
  FaXTwitter,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
} from "react-icons/fa6";
import {
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_FEATURED_IMAGE,
} from "./DefaultAvatar";
import Toast from "./Toast";
import { useTinyUrl } from "../hooks/useTinyUrl";

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
  // State for toast notification
  const [showToast, setShowToast] = useState(false);

  // Safely extract properties with fallbacks
  const title = post?.title || "urTechy Blog Post";
  const slug = post?.slug || "";
  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${slug}`;

  // TinyURL hook for shortened URLs
  const {
    shortUrl,
    longUrl,
    isLoading: urlLoading,
    getSharingUrls,
    copyToClipboard,
    isShortened,
  } = useTinyUrl(post, {
    autoShorten: true,
    baseUrl: rootUrl,
  });

  // Use shortened URL for sharing if available, otherwise use original
  const shareUrl = shortUrl || postUrl;
  const sharingUrls = getSharingUrls();

  // Ensure we're using the featured image and not accidentally using author image
  // First check if featuredImage exists and has a url property
  const hasFeaturedImage = post?.featuredImage && post.featuredImage.url;

  // Use the same default image as in PostDetail component if no featured image
  // For social sharing, use the absolute URL with fallbacks
  const imageUrl = hasFeaturedImage
    ? post.featuredImage.url
    : `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;

  // Function to handle image URL errors in social sharing
  // Use a static URL without dynamic timestamps to avoid hydration errors
  const getSafeImageUrl = () => {
    // If the original URL fails, use the local fallback
    if (!hasFeaturedImage) {
      return `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;
    }

    // Check if the URL is from Hygraph/GraphCMS
    if (
      post.featuredImage.url.includes("graphassets.com") ||
      post.featuredImage.url.includes("hygraph.com")
    ) {
      try {
        // Don't add timestamp to avoid hydration errors
        return post.featuredImage.url;
      } catch (e) {
        // Keep console.error for production error tracking
        console.error("Error parsing image URL:", e);
        // Use absolute URL to local fallback image
        return `${rootUrl}${FALLBACK_FEATURED_IMAGE}`;
      }
    }

    // For external URLs that might fail, ensure we have a local fallback
    try {
      return post.featuredImage.url;
    } catch (e) {
      console.error("Error with featured image URL:", e);
      return `${rootUrl}${FALLBACK_FEATURED_IMAGE}`;
    }
  };
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      className="my-8 sm:my-10 py-4 sm:py-6 w-full"
    >
      <div className="w-full sm:max-w-3xl mx-auto">
        <h3 className="text-gray-800 font-heading text-lg sm:text-xl mb-3 sm:mb-5 font-semibold">
          Share this article
        </h3>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* WhatsApp */}
          <motion.a
            href={sharingUrls.whatsapp || `https://wa.me/?text=${encodeURIComponent(
              `${title} - ${shareUrl}${imageUrl ? " 📷" : ""}`
            )}`}
            data-action="share/whatsapp/share"
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow"
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaWhatsapp size={18} className="text-green-500 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              WhatsApp
            </span>
          </motion.a>

          {/* Facebook */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={sharingUrls.facebook || `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}&quote=${encodeURIComponent(title)}`}
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow"
            title="Share on Facebook"
            aria-label="Share on Facebook"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaFacebook size={18} className="text-blue-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Facebook
            </span>
          </motion.a>

          {/* Twitter */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={sharingUrls.twitter || `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              title
            )}&url=${encodeURIComponent(
              shareUrl
            )}&via=Onlyblogs_&hashtags=urtechy,blog`}
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow"
            title="Share on Twitter"
            aria-label="Share on Twitter"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaXTwitter size={18} className="text-black mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Twitter
            </span>
          </motion.a>

          {/* LinkedIn */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={sharingUrls.linkedin || `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              shareUrl
            )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
              title
            )}&source=urTechy`}
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow"
            title="Share on LinkedIn"
            aria-label="Share on LinkedIn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaLinkedin size={18} className="text-blue-700 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              LinkedIn
            </span>
          </motion.a>

          {/* Reddit */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={sharingUrls.reddit || `http://www.reddit.com/submit?url=${encodeURIComponent(
              shareUrl
            )}&title=${encodeURIComponent(title)}`}
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow"
            title="Share on Reddit"
            aria-label="Share on Reddit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaReddit size={18} className="text-orange-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Reddit
            </span>
          </motion.a>

          {/* Pinterest */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={sharingUrls.pinterest || `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(
              shareUrl
            )}&description=${encodeURIComponent(
              title
            )}&media=${encodeURIComponent(getSafeImageUrl())}`}
            className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow"
            title="Share on Pinterest"
            aria-label="Share on Pinterest"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaPinterest size={18} className="text-red-600 mr-2" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Pinterest
            </span>
          </motion.a>
        </div>

        {/* URL Display and Copy Button */}
        <div className="mt-4 space-y-2">
          {/* URL Status */}
          {urlLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full" />
              <span>Creating short URL...</span>
            </div>
          )}
          
          {/* URL Display */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <code className="flex-1 text-xs font-mono text-gray-600 truncate">
              {shareUrl}
            </code>
            {isShortened && (
              <span className="text-xs text-green-600 font-medium">Short</span>
            )}
          </div>

          {/* Copy link button */}
          <motion.button
            onClick={async () => {
              const success = await copyToClipboard();
              if (success) {
                setShowToast(true);
              }
            }}
            className="w-full flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={urlLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Copy {isShortened ? 'short' : 'link'}
            </span>
          </motion.button>
        </div>

        {/* Toast notification */}
        {showToast && (
          <Toast
            message={`${isShortened ? 'Short URL' : 'Link'} copied to clipboard!`}
            duration={2000}
            onClose={() => setShowToast(false)}
          />
        )}
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
