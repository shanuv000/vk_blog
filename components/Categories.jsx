import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCategories } from "../hooks/useApolloQueries";

const Categories = () => {
  // Use Apollo hook with caching
  const { categories, loading, error } = useCategories();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (loading) {
    return (
      <motion.div
        className="bg-white shadow-lg rounded-lg p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl mb-8 font-semibold border-b pb-4">Categories</h3>
        <p className="text-center py-4">Loading categories...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="bg-white shadow-lg rounded-lg p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl mb-8 font-semibold border-b pb-4">Categories</h3>
        <p className="text-center text-red-500 py-4">{error}</p>
      </motion.div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <motion.div
        className="bg-white shadow-lg rounded-lg p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl mb-8 font-semibold border-b pb-4">Categories</h3>
        <p className="text-center py-4">No categories found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-8 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className="text-xl mb-8 font-semibold border-b pb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Categories
      </motion.h3>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category) => (
          <motion.div
            key={category.slug || category.name}
            variants={itemVariants}
            whileHover={{ x: 5, color: "#ec4899" }}
            transition={{ duration: 0.2 }}
          >
            <Link href={`/category/${category.slug}`}>
              <span className="cursor-pointer block pb-3 mb-3">
                {category.name.toUpperCase()}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Categories;
