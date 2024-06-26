import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCategories } from "../services";
import { useData } from "../store/HandleApiContext";

const Header = () => {
  const [categories, setCategories] = useState([]);

  const { isLiveScore: isLive } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    getCategories().then((newCategories) => {
      setCategories(newCategories);
    });
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 },
    },
  };

  const categoryContainerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 },
    },
  };

  const categoryVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const liveTextVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      rotate: [0, 10, -10, 0],
      color: ["#ffffff", "#ff0000", "#ffffff"],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "mirror",
      },
    },
  };

  return (
    <div className="container mx-auto px-4 sm:px-10 mb-8">
      <motion.div
        className="border-b w-full inline-block border-blue-400 py-4 sm:py-8"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <motion.div className="md:float-left block">
          <Link href="/">
            <motion.span
              className="cursor-pointer font-bold text-2xl sm:text-4xl text-white"
              initial="hidden"
              animate="visible"
              variants={logoVariants}
            >
              <img src="/logo10.svg" alt="logos" className="w-32 sm:w-44" />
            </motion.span>
          </Link>
        </motion.div>
        <div className="md:hidden flex items-center justify-end">
          <button className="text-white text-3xl" onClick={handleMenuToggle}>
            ☰
          </button>
        </div>
        <motion.div
          className={`md:float-right md:contents ${
            isMenuOpen ? "block" : "hidden"
          } md:block`}
          initial="hidden"
          animate="visible"
          variants={categoryContainerVariants}
        >
          {isMenuOpen && (
            <div className="md:hidden bg-gray-800 p-4 rounded-md">
              <Link key={"category"} href={`/livecricket`}>
                <motion.span
                  className="block text-yellow-400 mt-2 align-middle font-semibold cursor-pointer"
                  variants={categoryVariants}
                  onClick={handleLinkClick}
                >
                  {isLive ? (
                    <motion.span
                      className="text-red-500"
                      variants={liveTextVariants}
                      animate="pulse"
                    >
                      Live
                    </motion.span>
                  ) : null}
                  <span> Cricket</span>
                </motion.span>
              </Link>
              {categories.map((category) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  <motion.span
                    className="block mt-2 align-middle text-white font-semibold cursor-pointer"
                    variants={categoryVariants}
                    onClick={handleLinkClick}
                  >
                    {category.name.toUpperCase()}
                  </motion.span>
                </Link>
              ))}
            </div>
          )}
          <div className="hidden md:block">
            {categories.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`}>
                <motion.span
                  className="md:inline-block mt-2 align-middle text-white font-semibold cursor-pointer ml-4"
                  variants={categoryVariants}
                >
                  {category.name.toUpperCase()}
                </motion.span>
              </Link>
            ))}
            <Link key={"category"} href={`/livecricket`}>
              <motion.span
                className={`md:inline-block mt-2 align-middle ${
                  isLive ? "text-green-300" : "text-white"
                } font-semibold cursor-pointer ml-4`}
                variants={categoryVariants}
              >
                {isLive ? (
                  <motion.span
                    className="text-red-500"
                    variants={liveTextVariants}
                    animate="pulse"
                  >
                    Live
                  </motion.span>
                ) : null}
                <span> Cricket</span>
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Header;
