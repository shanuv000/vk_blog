import React from "react";
import { motion } from "framer-motion";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaPinterest,
  FaReddit,
  FaTelegram,
  FaShare,
} from "react-icons/fa6";

const SocialSharing = ({ post }) => {
  // Safely extract properties with fallbacks
  const title = post?.title || "Blog Post";
  const slug = post?.slug || "";
  const description = post?.excerpt || post?.description || "";
  const rootUrl = "https://urtechy.com";
  const longUrl = `${rootUrl}/blog/${slug}`;
  // Use short URL from Hygraph if available, otherwise use long URL
  const postUrl = post?.shortUrl || longUrl;
  const imageUrl = post?.featuredImage?.url || "";

  // Encode URLs and text for sharing
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(imageUrl);

  const isInIframe = React.useMemo(() => {
    if (typeof window === "undefined") {return false;}
    try {
      return window.self !== window.top;
    } catch (err) {
      return true;
    }
  }, []);

  const canUseNativeShare =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    !isInIframe;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  // Share handlers
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    window.open(linkedinUrl, "_blank", "width=600,height=400");
  };

  const handleWhatsAppShare = () => {
    const whatsappText = `${title} ${postUrl}${imageUrl ? " 📸" : ""}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      whatsappText
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handlePinterestShare = () => {
    if (imageUrl) {
      const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`;
      window.open(pinterestUrl, "_blank", "width=600,height=400");
    }
  };

  const handleRedditShare = () => {
    const redditUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
    window.open(redditUrl, "_blank", "width=600,height=400");
  };

  const handleTelegramShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    window.open(telegramUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (!canUseNativeShare) {
      return;
    }

    try {
      await navigator.share({
        title: title,
        text: description,
        url: postUrl,
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {

        if (process.env.NODE_ENV === 'development') {


          console.log("Error sharing:", error);


        }

      }
    }
  };

  return (
    <motion.div
      className="social-sharing my-6 sm:my-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200 mx-auto max-w-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="text-center mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
          Share this post
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          Help others discover this content
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {/* Facebook */}
        <motion.button
          onClick={handleFacebookShare}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Share on Facebook"
          title="Share on Facebook"
        >
          <FaFacebook size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* Twitter/X */}
        <motion.button
          onClick={handleTwitterShare}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Share on Twitter"
          title="Share on Twitter/X"
        >
          <FaTwitter size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* LinkedIn */}
        <motion.button
          onClick={handleLinkedInShare}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Share on LinkedIn"
          title="Share on LinkedIn"
        >
          <FaLinkedin size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* WhatsApp */}
        <motion.button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Share on WhatsApp"
          title="Share on WhatsApp"
        >
          <FaWhatsapp size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* Pinterest - only show if image is available */}
        {imageUrl && (
          <motion.button
            onClick={handlePinterestShare}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Share on Pinterest"
            title="Share on Pinterest"
          >
            <FaPinterest size={16} className="sm:w-5 sm:h-5" />
          </motion.button>
        )}

        {/* Reddit */}
        <motion.button
          onClick={handleRedditShare}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-600 text-white hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Share on Reddit"
          title="Share on Reddit"
        >
          <FaReddit size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* Telegram */}
        <motion.button
          onClick={handleTelegramShare}
          className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Share on Telegram"
          title="Share on Telegram"
        >
          <FaTelegram size={16} className="sm:w-5 sm:h-5" />
        </motion.button>

        {/* Native Share (if supported) */}
        {canUseNativeShare && (
          <motion.button
            onClick={handleNativeShare}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg touch-manipulation"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Share via device"
            title="Share via device"
          >
            <FaShare size={14} className="sm:w-4 sm:h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export { SocialSharing };
export default SocialSharing;
