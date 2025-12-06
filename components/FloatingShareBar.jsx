import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaLink,
  FaCheck,
} from "react-icons/fa6";
import { FaChevronUp } from "react-icons/fa";

/**
 * Floating Share Bar Component
 * Appears on the left side when user scrolls past the hero image
 * Provides quick access to social sharing options
 */
const FloatingShareBar = ({ post, showThreshold = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Post data
  const title = post?.title || "Check out this article";
  const slug = post?.slug || "";
  const postUrl = `https://blog.urtechy.com/post/${slug}`;

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > showThreshold);
      setShowScrollTop(scrollY > 1000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showThreshold]);

  // Copy link handler
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Share URLs
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}&via=Onlyblogs_`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
  };

  const shareButtons = [
    {
      name: "Twitter",
      icon: FaXTwitter,
      url: shareUrls.twitter,
      hoverBg: "hover:bg-black",
      hoverText: "hover:text-white",
    },
    {
      name: "Facebook",
      icon: FaFacebook,
      url: shareUrls.facebook,
      hoverBg: "hover:bg-blue-600",
      hoverText: "hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: shareUrls.linkedin,
      hoverBg: "hover:bg-blue-700",
      hoverText: "hover:text-white",
    },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3"
        >
          {/* Share label */}
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-1">
            Share
          </div>

          {/* Share buttons */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex flex-col gap-1">
            {shareButtons.map((button) => (
              <motion.a
                key={button.name}
                href={button.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Share on ${button.name}`}
                aria-label={`Share on ${button.name}`}
                className={`p-3 rounded-xl text-gray-500 transition-all duration-200 ${button.hoverBg} ${button.hoverText}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <button.icon size={18} />
              </motion.a>
            ))}

            {/* Copy link button */}
            <motion.button
              onClick={handleCopyLink}
              title={copied ? "Copied!" : "Copy link"}
              aria-label="Copy link"
              className={`p-3 rounded-xl transition-all duration-200 ${
                copied 
                  ? "bg-green-100 text-green-600" 
                  : "text-gray-500 hover:bg-primary hover:text-white"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? <FaCheck size={18} /> : <FaLink size={18} />}
            </motion.button>
          </div>

          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={scrollToTop}
                title="Scroll to top"
                aria-label="Scroll to top"
                className="p-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-colors mt-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaChevronUp size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingShareBar;
