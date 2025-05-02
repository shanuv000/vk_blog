"use client";
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, useAnimation } from "framer-motion";
import {
  FaTwitter,
  FaFacebook,
  FaReddit,
  FaWhatsapp,
  FaLinkedin,
  FaPinterest,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";

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

const NavbarPostDetails = ({ post: { title, slug } }) => {
  const rootUrl = "https://blog.urtechy.com";
  const postUrl = `${rootUrl}/post/${slug}`;
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }
  }, [controls, inView]);

  return (
    <motion.nav
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      className="flex justify-center space-x-4 lg:mb-2 my-4"
    >
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://twitter.com/intent/tweet?text=${title}&url=${postUrl}&via=Onlyblogs_`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors duration-300"
        title="Share on Twitter"
        aria-label="Share on Twitter"
      >
        <FaXTwitter size={20} className="text-white" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <FaFacebook size={20} className="text-white" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`http://www.reddit.com/submit?url=${postUrl}&title=${title}`}
        className="items-center justify-center w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors duration-300 hidden lg:flex"
        title="Share on Reddit"
        aria-label="Share on Reddit"
      >
        <FaReddit size={20} className="text-white" />
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `${title} - ${postUrl}`
        )}`}
        data-action="share/whatsapp/share"
        className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-300"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={20} className="text-white" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${postUrl}`}
        className="items-center justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-300 hidden lg:flex"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin size={20} className="text-white" />
      </a>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`http://pinterest.com/pin/create/button/?url=${postUrl}&description=${encodeURIComponent(
          title
        )}`}
        className="items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-300 hidden lg:flex"
        title="Share on Pinterest"
        aria-label="Share on Pinterest"
      >
        <FaPinterest size={20} className="text-white" />
      </a>
      <a
        href={`https://t.me/share/url?url=${postUrl}&text=${encodeURIComponent(
          title
        )}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors duration-300 lg:hidden"
        title="Share on Telegram"
        aria-label="Share on Telegram"
      >
        <FaTelegram size={20} className="text-white" />
      </a>
    </motion.nav>
  );
};

NavbarPostDetails.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  }).isRequired,
};

export default NavbarPostDetails;
