import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCategories } from "../services";
import Modal from "./Modal";
import { useData } from "../store/HandleApiContext";

const Header = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch categories and live scores when the component mounts
  useEffect(() => {
    getCategories().then((newCategories) => {
      setCategories(newCategories);
    });
  }, []);

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
              className="cursor-pointer font-bold text-3xl sm:text-4xl text-white"
              initial="hidden"
              animate="visible"
              variants={logoVariants}
            >
              <img src="/logo10.svg" alt="logos" width="180" height="100" />
            </motion.span>
          </Link>
        </motion.div>
        <div className="md:hidden flex items-center justify-end">
          <button
            className="text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        <motion.div
          className={`md:float-left md:contents ${
            isMenuOpen ? "block" : "hidden"
          } md:block`}
          initial="hidden"
          animate="visible"
          variants={categoryContainerVariants}
        >
          {isMenuOpen && (
            <div className="bg-gray-800 p-4 rounded-md">
              <Link key={"category"} href={`/livecricket`}>
                <motion.span
                  className="block mt-2 align-middle text-white font-semibold cursor-pointer"
                  variants={categoryVariants}
                >
                  Live Matches
                </motion.span>
              </Link>
              {categories.map((category) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  <motion.span
                    className="block mt-2 align-middle text-white font-semibold cursor-pointer"
                    variants={categoryVariants}
                  >
                    {category.name.toUpperCase()}
                  </motion.span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Header;
