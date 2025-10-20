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
  FaInfoCircle,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa6";

import {
  DEFAULT_FEATURED_IMAGE,
  FALLBACK_FEATURED_IMAGE,
} from "./DefaultAvatar";
import Toast from "./Toast";
import { useTinyUrl } from "../hooks/useTinyUrlEnhanced";

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

const EnhancedSocialSharePost = ({ post }) => {
  // State for toast notification
  const [showToast, setShowToast] = useState(false);
  const [showValidationInfo, setShowValidationInfo] = useState(false);

  // Safely extract properties with fallbacks
  const title = post?.title || "urTechy Blog Post";
  const slug = post?.slug || "";
  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${slug}`;

  // Enhanced TinyURL hook with validation
  const {
    shortUrl,
    longUrl,
    isLoading: urlLoading,
    getSharingUrls,
    copyToClipboard,
    isShortened,
    isNewPost,
    shouldHaveShortUrl,
    validationStatus,
    forceCreateShortUrl,
    error,
  } = useTinyUrl(post, {
    autoShorten: true,
    baseUrl: rootUrl,
    enableAnalytics: true,
  });

  // Use shortened URL for sharing if available, otherwise use original
  const shareUrl = shortUrl || postUrl;
  const sharingUrls = getSharingUrls();

  // Image handling (same as before)
  const hasFeaturedImage = post?.featuredImage && post.featuredImage.url;
  const imageUrl = hasFeaturedImage
    ? post.featuredImage.url
    : `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;

  const getSafeImageUrl = () => {
    if (!hasFeaturedImage) {
      return `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;
    }

    if (
      post.featuredImage.url.includes("graphassets.com") ||
      post.featuredImage.url.includes("hygraph.com")
    ) {
      try {
        return post.featuredImage.url;
      } catch (e) {
        console.error("Error parsing image URL:", e);
        return `${rootUrl}${FALLBACK_FEATURED_IMAGE}`;
      }
    }

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

  // Format validation dates for display
  const formatDate = (dateString) => {
    if (!dateString) {return "Unknown";}
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      className="my-8 sm:my-10 py-4 sm:py-6 w-full"
    >
      <div className="w-full sm:max-w-3xl mx-auto">
        {/* Header with validation info */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <h3 className="text-gray-800 font-heading text-lg sm:text-xl font-semibold">
            Share this article
          </h3>

          {/* Validation status indicator */}
          <div className="flex items-center gap-2">
            {isNewPost ? (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <FaCheckCircle size={12} />
                <span>Short URL</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                <FaClock size={12} />
                <span>Legacy post</span>
              </div>
            )}

            <button
              onClick={() => setShowValidationInfo(!showValidationInfo)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="URL shortening info"
            >
              <FaInfoCircle size={14} />
            </button>
          </div>
        </div>

        {/* Validation info panel */}
        {showValidationInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-gray-50 rounded-lg border text-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-700">Post Status:</span>
                <span
                  className={`ml-2 ${
                    isNewPost ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {isNewPost ? "New (has TinyURL)" : "Legacy (original URL)"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Published:</span>
                <span className="ml-2 text-gray-600">
                  {formatDate(validationStatus.publishDate)}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="font-medium text-gray-700">
                  TinyURL Integration:
                </span>
                <span className="ml-2 text-gray-600">
                  Started {formatDate(validationStatus.integrationDate)}
                </span>
              </div>
              {!isNewPost && (
                <div className="sm:col-span-2">
                  <button
                    onClick={forceCreateShortUrl}
                    disabled={urlLoading}
                    className="text-blue-600 hover:text-blue-700 text-xs underline disabled:opacity-50"
                  >
                    {urlLoading
                      ? "Creating..."
                      : "Create TinyURL for this post"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Social sharing buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* WhatsApp */}
          <motion.a
            href={
              sharingUrls.whatsapp ||
              `https://wa.me/?text=${encodeURIComponent(
                `${title} - ${shareUrl}${imageUrl ? " 📷" : ""}`
              )}`
            }
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
            href={
              sharingUrls.facebook ||
              `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}&quote=${encodeURIComponent(title)}`
            }
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
            href={
              sharingUrls.twitter ||
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                title
              )}&url=${encodeURIComponent(
                shareUrl
              )}&via=Onlyblogs_&hashtags=urtechy,blog`
            }
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
            href={
              sharingUrls.linkedin ||
              `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareUrl
              )}&title=${encodeURIComponent(
                title
              )}&summary=${encodeURIComponent(title)}&source=urTechy`
            }
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
            href={
              sharingUrls.reddit ||
              `http://www.reddit.com/submit?url=${encodeURIComponent(
                shareUrl
              )}&title=${encodeURIComponent(title)}`
            }
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
            href={
              sharingUrls.pinterest ||
              `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                shareUrl
              )}&description=${encodeURIComponent(
                title
              )}&media=${encodeURIComponent(getSafeImageUrl())}`
            }
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

        {/* URL Display and Copy Section */}
        <div className="mt-4 space-y-2">
          {/* Loading State */}
          {urlLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="animate-spin w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full" />
              <span>
                {isNewPost ? "Creating short URL..." : "Generating TinyURL..."}
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded">
              <span>❌ {error}</span>
              <button
                onClick={forceCreateShortUrl}
                className="text-red-600 underline hover:text-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* URL Display */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <code className="flex-1 text-xs font-mono text-gray-600 truncate">
              {shareUrl}
            </code>
            <div className="flex items-center gap-1">
              {isShortened && (
                <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded">
                  Short
                </span>
              )}
              {!isNewPost && !isShortened && (
                <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                  Original
                </span>
              )}
            </div>
          </div>

          {/* Copy Button */}
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
              Copy {isShortened ? "short" : ""} link
            </span>
          </motion.button>
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

EnhancedSocialSharePost.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string,
    publishedAt: PropTypes.string,
    createdAt: PropTypes.string,
    featuredImage: PropTypes.shape({
      url: PropTypes.string,
    }),
  }).isRequired,
};

export default EnhancedSocialSharePost;
