/**
 * Enhanced Social Share Buttons with TinyURL Integration
 * Provides social sharing with shortened URLs and analytics tracking
 */
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  FaXTwitter,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
  FaEnvelope,
  FaCopy,
  FaCheck,
  FaChartLine,
} from "react-icons/fa6";

import Toast from "./Toast";

const EnhancedSocialShare = ({
  post,
  showAnalytics = false,
  baseUrl = "https://blog.urtechy.com",
  className = "",
  variant = "default", // 'default', 'compact', 'minimal'
}) => {
  // State for UI feedback
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Use short URL from Hygraph if available, otherwise use long URL
  const longUrl = post?.slug ? `${baseUrl}/post/${post.slug}` : baseUrl;
  const shortUrl = post?.shortUrl || longUrl;
  const isShortened = shortUrl !== longUrl;
  const displayUrl = shortUrl;
  
  // Generate share URLs for different platforms
  const sharingUrls = React.useMemo(() => {
    const url = encodeURIComponent(shortUrl);
    const encodedTitle = encodeURIComponent(title);
    
    return {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${url}`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${encodedTitle}`,
      pinterest: `http://pinterest.com/pin/create/button/?url=${url}&description=${encodedTitle}&media=${encodeURIComponent(imageUrl)}`,
    };
  }, [shortUrl, title, imageUrl]);
  
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

  // Safe post data extraction
  const title = post?.title || "urTechy Blog Post";
  const imageUrl =
    post?.featuredImage?.url || `${baseUrl}/default-og-image.jpg`;

  // Handle copy to clipboard
  const handleCopyUrl = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopySuccess(true);
      setToastMessage(
        `${isShortened ? "Short" : "Long"} URL copied to clipboard!`
      );
      setShowToast(true);

      // Reset copy success state after animation
      setTimeout(() => setCopySuccess(false), 2000);
    } else {
      setToastMessage("Failed to copy URL. Please try again.");
      setShowToast(true);
    }
  };

  // Track sharing events (can be extended with analytics)
  const trackShare = (platform) => {
    if (process.env.NODE_ENV === 'development') {

      if (process.env.NODE_ENV === 'development') {


        console.log(`Shared on ${platform}:`, {
      post: post?.slug,
      url: displayUrl,
      isShortened,
    });


      }

    }

    // You can add more sophisticated tracking here
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "share", {
        method: platform,
        content_type: "blog_post",
        item_id: post?.slug,
        custom_parameter_1: isShortened ? "short_url" : "long_url",
      });
    }
  };

  // Share button data with enhanced tracking
  const shareButtons = [
    {
      name: "Facebook",
      icon: FaFacebook,
      color: "text-blue-600",
      bgColor: "hover:bg-blue-50",
      url: sharingUrls.facebook,
      platform: "facebook",
    },
    {
      name: "Twitter",
      icon: FaXTwitter,
      color: "text-black",
      bgColor: "hover:bg-gray-50",
      url: sharingUrls.twitter,
      platform: "twitter",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      color: "text-blue-700",
      bgColor: "hover:bg-blue-50",
      url: sharingUrls.linkedin,
      platform: "linkedin",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "text-green-500",
      bgColor: "hover:bg-green-50",
      url: sharingUrls.whatsapp,
      platform: "whatsapp",
    },
    {
      name: "Reddit",
      icon: FaReddit,
      color: "text-orange-600",
      bgColor: "hover:bg-orange-50",
      url: sharingUrls.reddit,
      platform: "reddit",
    },
    {
      name: "Pinterest",
      icon: FaPinterest,
      color: "text-red-600",
      bgColor: "hover:bg-red-50",
      url: sharingUrls.pinterest,
      platform: "pinterest",
    },
    {
      name: "Email",
      icon: FaEnvelope,
      color: "text-gray-600",
      bgColor: "hover:bg-gray-50",
      url: sharingUrls.email,
      platform: "email",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 },
    },
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 500 },
    },
    tap: { scale: 0.95 },
  };

  // Render different variants
  const renderButtons = () => {
    switch (variant) {
      case "compact":
        return (
          <div className="flex flex-wrap gap-2">
            {shareButtons.slice(0, 4).map((button) => (
              <motion.a
                key={button.platform}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackShare(button.platform)}
                className={`p-2 rounded-full bg-white border border-gray-200 ${button.bgColor} transition-all duration-200 shadow-sm hover:shadow`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title={`Share on ${button.name}`}
              >
                <button.icon size={16} className={button.color} />
              </motion.a>
            ))}
          </div>
        );

      case "minimal":
        return (
          <div className="flex gap-3">
            {shareButtons.slice(0, 3).map((button) => (
              <motion.a
                key={button.platform}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackShare(button.platform)}
                className={`${button.color} hover:opacity-70 transition-opacity`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title={`Share on ${button.name}`}
              >
                <button.icon size={20} />
              </motion.a>
            ))}
          </div>
        );

      default:
        return (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {shareButtons.map((button) => (
              <motion.a
                key={button.platform}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackShare(button.platform)}
                className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white border border-gray-200 ${button.bgColor} transition-all duration-300 shadow-sm hover:shadow`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                title={`Share on ${button.name}`}
              >
                <button.icon size={18} className={`${button.color} mr-2`} />
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">
                  {button.name}
                </span>
              </motion.a>
            ))}
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`my-8 sm:my-10 py-4 sm:py-6 w-full ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full sm:max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <h3 className="text-gray-800 font-heading text-lg sm:text-xl font-semibold">
            Share this article
          </h3>

          {/* URL Status Indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {isShortened && (
              <>
                <FaCheck className="text-green-500" />
                <span>Short URL</span>
              </>
            )}
          </div>
        </div>

        {/* Share Buttons */}
        {renderButtons()}

        {/* URL Display and Copy */}
        <motion.div
          className="mt-4 flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
          variants={buttonVariants}
        >
          <div className="flex-1 text-sm text-gray-600 font-mono truncate">
            {displayUrl}
          </div>

          <motion.button
            onClick={handleCopyUrl}
            className={`flex items-center px-3 py-1.5 rounded-md transition-all duration-200 ${
              copySuccess
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {copySuccess ? (
              <>
                <FaCheck size={14} className="mr-1" />
                <span className="text-xs font-medium">Copied!</span>
              </>
            ) : (
              <>
                <FaCopy size={14} className="mr-1" />
                <span className="text-xs font-medium">Copy</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Analytics Display */}
        {showAnalytics && analytics && (
          <motion.div
            className="mt-4 p-3 bg-blue-50 rounded-lg"
            variants={buttonVariants}
          >
            <div className="flex items-center gap-2 mb-2">
              <FaChartLine className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Share Analytics
              </span>
            </div>
            <div className="text-xs text-blue-700">
              Clicks: {analytics.clicks || 0} • Last 7 days:{" "}
              {analytics.recent_clicks || 0}
            </div>
          </motion.div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <Toast
            message={toastMessage}
            duration={3000}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </motion.div>
  );
};

EnhancedSocialShare.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string,
    slug: PropTypes.string.isRequired,
    featuredImage: PropTypes.shape({
      url: PropTypes.string,
    }),
  }).isRequired,

  showAnalytics: PropTypes.bool,
  baseUrl: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["default", "compact", "minimal"]),
};

export default EnhancedSocialShare;
