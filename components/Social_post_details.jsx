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
import { DEFAULT_FEATURED_IMAGE } from "./DefaultAvatar";

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
  const imageUrl = hasFeaturedImage
    ? post.featuredImage.url
    : `${rootUrl}${DEFAULT_FEATURED_IMAGE}`;
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    }

    // Log the image URL for debugging
    console.log("Social sharing image URL:", imageUrl);
    console.log("Has featured image:", hasFeaturedImage);
    console.log("Featured image from post:", post?.featuredImage);
  }, [controls, inView, imageUrl, hasFeaturedImage, post]);

  return (
    <motion.nav
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      transition={{ duration: 0.5 }}
      className="flex justify-center space-x-4 lg:mb-2 my-4"
    >
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `${title} - ${postUrl}${imageUrl ? " 📷" : ""}`
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
        href={`https://www.instagram.com/?url=${encodeURIComponent(
          postUrl
        )}&media=${encodeURIComponent(imageUrl)}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 transition-colors duration-300"
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
        )}&picture=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(
          title
        )}`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
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
        )}&via=Onlyblogs_&hashtags=urtechy,blog${
          imageUrl ? `&image=${encodeURIComponent(imageUrl)}` : ""
        }`}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black hover:bg-gray-800 transition-colors duration-300"
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
        className="items-center justify-center w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors duration-300 hidden lg:flex"
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
        className="items-center justify-center w-10 h-10 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors duration-300 hidden lg:flex"
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
        )}&description=${encodeURIComponent(title)}&media=${encodeURIComponent(
          imageUrl
        )}`}
        className="items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-300 hidden lg:flex"
        title="Share on Pinterest"
        aria-label="Share on Pinterest"
      >
        <FaPinterest size={20} className="text-white" />
      </a>
    </motion.nav>
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
