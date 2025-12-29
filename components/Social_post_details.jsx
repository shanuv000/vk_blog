"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import PropTypes from "prop-types";
import {
  FaXTwitter,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
  FaLink,
  FaCheck,
} from "react-icons/fa6";

import {
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_FEATURED_IMAGE,
} from "./DefaultAvatar";
import Toast from "./Toast";

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

  // Use short URL from Hygraph if available, otherwise use long URL
  const shortUrl = post?.shortUrl || postUrl;
  const longUrl = postUrl;
  const isShortened = shortUrl !== longUrl;
  
  // Generate share URLs for different platforms
  const shareUrls = React.useMemo(() => {
    const url = encodeURIComponent(shortUrl);
    const encodedTitle = encodeURIComponent(title);
    
    return {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${encodedTitle}`,
    };
  }, [shortUrl, title]);
  
  // Copy to clipboard function
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shortUrl);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = shortUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      return true;
    } catch (err) {
      console.error("Failed to copy:", err);
      return false;
    }
  };

  // Use shortened URL for sharing
  const shareUrl = shortUrl;

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
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 font-heading text-lg font-bold tracking-tight">
            Share this article
          </h3>

          {/* Short URL Status Indicator */}
          {isShortened && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Short Link
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* WhatsApp */}
          <motion.a
            href={
              shareUrls.whatsapp ||
              `https://wa.me/?text=${encodeURIComponent(
                `${title} - ${shareUrl}${imageUrl ? " 📷" : ""}`
              )}`
            }
            data-action="share/whatsapp/share"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all duration-300"
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaWhatsapp size={18} />
          </motion.a>

          {/* Facebook */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={
              shareUrls.facebook ||
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}&quote=${encodeURIComponent(title)}`
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            title="Share on Facebook"
            aria-label="Share on Facebook"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaFacebook size={18} />
          </motion.a>

          {/* Twitter */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={
              shareUrls.twitter ||
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                title
              )}&url=${encodeURIComponent(
                shareUrl
              )}&via=Onlyblogs_&hashtags=urtechy,blog`
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-900 hover:bg-black hover:text-white transition-all duration-300"
            title="Share on Twitter"
            aria-label="Share on Twitter"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaXTwitter size={18} />
          </motion.a>

          {/* LinkedIn */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={
              shareUrls.linkedin ||
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareUrl
              )}&title=${encodeURIComponent(
                title
              )}&summary=${encodeURIComponent(title)}&source=urTechy`
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-700 hover:text-white transition-all duration-300"
            title="Share on LinkedIn"
            aria-label="Share on LinkedIn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaLinkedin size={18} />
          </motion.a>

          {/* Reddit */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={
              shareUrls.reddit ||
              `http://www.reddit.com/submit?url=${encodeURIComponent(
                shareUrl
              )}&title=${encodeURIComponent(title)}`
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-300"
            title="Share on Reddit"
            aria-label="Share on Reddit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaReddit size={18} />
          </motion.a>

          {/* Pinterest */}
          <motion.a
            target="_blank"
            rel="noopener noreferrer"
            href={
              `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                shareUrl
              )}&description=${encodeURIComponent(
                title
              )}&media=${encodeURIComponent(getSafeImageUrl())}`
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300"
            title="Share on Pinterest"
            aria-label="Share on Pinterest"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPinterest size={18} />
          </motion.a>

          {/* Copy Link Button - Expanded */}
          <motion.button
            onClick={async () => {
              try {
                const success = await copyToClipboard();
                if (success) {
                  setShowToast(true);
                }
              } catch (error) {
                console.error("Copy failed:", error);
                alert(`Copy failed: ${error.message}`);
              }
            }}
            className="flex items-center px-5 h-10 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 ml-auto shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showToast ? (
              <FaCheck className="mr-2 text-green-400" size={14} />
            ) : (
              <FaLink className="mr-2" size={14} />
            )}
            <span className="text-sm font-medium">
              {showToast ? "Copied!" : "Copy Link"}
            </span>
          </motion.button>
        </div>

        {/* URL Display - Minimal */}
        <div className="mt-6">

          {/* URL Input-like Display */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xs font-medium">URL</span>
            </div>
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="block w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              onClick={(e) => e.target.select()}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              {isShortened ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                  SHORT
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-800">
                  ORIGINAL
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Toast notification */}
        {showToast && (
          <Toast
            message={`${
              isShortened ? "Short URL" : "Link"
            } copied to clipboard!`}
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
