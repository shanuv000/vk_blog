import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCategories } from "../services";

const Header = () => {
  const [categories, setCategories] = useState([]);

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
    <div className="container mx-auto px-10 mb-8">
      <motion.div
        className="border-b w-full inline-block border-blue-400 py-8"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <motion.div className="md:float-left block">
          <Link href="/">
            <motion.span
              className="cursor-pointer font-bold text-4xl text-white"
              initial="hidden"
              animate="visible"
              variants={logoVariants}
            >
              <img src="/logo10.svg" alt="logos" width="180" height="100" />
            </motion.span>
          </Link>
        </motion.div>
        <motion.div
          className="hidden md:float-left md:contents"
          initial="hidden"
          animate="visible"
          variants={categoryContainerVariants}
        >
          {categories.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`}>
              <motion.span
                className="md:float-right mt-2 align-middle text-white ml-4 font-semibold cursor-pointer"
                variants={categoryVariants}
              >
                {category.name.toUpperCase()}
              </motion.span>
            </Link>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Header;
