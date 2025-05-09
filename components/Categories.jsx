import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getDirectCategories } from "../services/direct-api";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use direct API for more reliable data fetching
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const result = await getDirectCategories();

        if (result && result.length > 0) {
          setCategories(result);
        } else {
          // Fallback to default categories if API returns empty
          console.log("API returned empty categories, using defaults");
          setCategories([
            { name: "Web Development", slug: "web-dev" },
            { name: "Technology", slug: "technology" },
            { name: "Programming", slug: "programming" },
            { name: "Mobile Apps", slug: "mobile-apps" },
            { name: "UI/UX", slug: "ui-ux" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories on error
        setCategories([
          { name: "Web Development", slug: "web-dev" },
          { name: "Technology", slug: "technology" },
          { name: "Programming", slug: "programming" },
          { name: "Mobile Apps", slug: "mobile-apps" },
          { name: "UI/UX", slug: "ui-ux" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse w-full">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-4 bg-secondary-light rounded mb-3"
            style={{ width: `${Math.floor(Math.random() * 40) + 60}%` }}
          />
        ))}
      </div>
    );
  }

  // If no categories available
  if (!categories || categories.length === 0) {
    return (
      <p className="text-center py-4 text-text-secondary">
        No categories found
      </p>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {categories.map((category) => (
        <motion.div
          key={category.slug || category.name}
          variants={itemVariants}
          className="group"
        >
          <Link href={`/category/${category.slug}`}>
            <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary-light transition-colors duration-200 group-hover:text-primary">
              <span className="font-medium">{category.name}</span>
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                className="text-text-secondary group-hover:text-primary"
              >
                →
              </motion.span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Categories;
