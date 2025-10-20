import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaPinterest, FaReddit } from 'react-icons/fa';
import usePostAnalytics from '../hooks/usePostAnalytics';

/**
 * Social share buttons component with analytics tracking
 * @param {Object} props - Component props
 * @param {Object} props.post - The post object
 * @param {string} props.url - The URL to share
 * @param {string} props.title - The title to share
 * @param {string} props.description - The description to share
 * @param {string} props.imageUrl - The image URL to share
 * @returns {JSX.Element} - The social share buttons component
 */
const SocialShareButtons = ({ post, url, title, description, imageUrl }) => {
  const { trackShare } = usePostAnalytics(post);
  
  // Encode parameters for sharing
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');
  const encodedImage = encodeURIComponent(imageUrl || '');
  
  // Animation variants for buttons
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300 }
    },
    hover: { 
      scale: 1.1,
      transition: { type: 'spring', stiffness: 500 }
    },
    tap: { scale: 0.95 }
  };

  // Share handlers
  const handleFacebookShare = () => {
    trackShare('facebook');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };
  
  const handleTwitterShare = () => {
    trackShare('twitter');
    window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
  };
  
  const handleLinkedInShare = () => {
    trackShare('linkedin');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
  };
  
  const handleWhatsAppShare = () => {
    trackShare('whatsapp');
    window.open(`https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`, '_blank');
  };
  
  const handlePinterestShare = () => {
    trackShare('pinterest');
    window.open(`https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedTitle}`, '_blank');
  };
  
  const handleRedditShare = () => {
    trackShare('reddit');
    window.open(`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`, '_blank');
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2 my-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        onClick={handleFacebookShare}
        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={20} />
      </motion.button>
      
      <motion.button
        onClick={handleTwitterShare}
        className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Share on Twitter"
      >
        <FaTwitter size={20} />
      </motion.button>
      
      <motion.button
        onClick={handleLinkedInShare}
        className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin size={20} />
      </motion.button>
      
      <motion.button
        onClick={handleWhatsAppShare}
        className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={20} />
      </motion.button>
      
      <motion.button
        onClick={handlePinterestShare}
        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Share on Pinterest"
      >
        <FaPinterest size={20} />
      </motion.button>
      
      <motion.button
        onClick={handleRedditShare}
        className="p-2 rounded-full bg-orange-600 text-white hover:bg-orange-700"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        aria-label="Share on Reddit"
      >
        <FaReddit size={20} />
      </motion.button>
    </motion.div>
  );
};

export default SocialShareButtons;
