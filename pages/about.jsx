import React, { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { FaXTwitter } from "react-icons/fa6";

const About = () => {
  const [showEmail, setShowEmail] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 15 
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      boxShadow: "0 5px 15px rgba(229, 9, 20, 0.3)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <Head>
        <title>About Us | urTechy Blogs</title>
        <meta name="description" content="Learn more about urTechy Blogs, our mission and what we offer." />
      </Head>

      <section className="bg-secondary text-text-primary">
        <motion.div 
          className="container mx-auto flex flex-col items-center px-4 py-16 text-center md:py-24 md:px-10 lg:px-32 xl:max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="relative mb-8"
            variants={itemVariants}
          >
            <motion.div 
              className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-light rounded-lg blur opacity-25"
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "mirror" 
              }}
            />
            <motion.h1 
              className="relative text-4xl font-bold leading-none sm:text-5xl bg-secondary px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Welcome To{" "}
              <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                urTechy Blogs
              </span>
            </motion.h1>
          </motion.div>

          <motion.p 
            className="px-8 mt-8 mb-6 text-lg leading-relaxed text-text-primary"
            variants={itemVariants}
          >
            urTechy Blogs is a professional blog platform. Here we provide you
            with interesting content that you will like very much. We're dedicated
            to offering you the best of blogs, with a focus on dependability and
            quality. We're working to turn our passion for blogging into a booming
            online website. We hope you enjoy our blog as much as we enjoy
            offering it to you.
          </motion.p>

          <motion.p 
            className="px-8 mb-8 text-lg text-text-primary"
            variants={itemVariants}
          >
            We will keep posting important content on our website for all of you.
            Please give your support and love.
          </motion.p>

          <motion.p 
            className="text-xl font-bold mb-8 text-primary-light"
            variants={itemVariants}
          >
            Thanks for visiting our site!
          </motion.p>

          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-8"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => setShowEmail(!showEmail)}
              className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-gradient-to-r from-primary to-primary-light text-white"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Show Email"
            >
              <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6" />
            </motion.button>

            <AnimatePresence>
              {showEmail && (
                <motion.div 
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => window.open("mailto:urtechy000@gmail.com")}
                    className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-gradient-to-r from-primary to-primary-light text-white"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Send Mail
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-gradient-to-r from-primary to-primary-light text-white"
                    onClick={() => {
                      navigator.clipboard.writeText("urtechy000@gmail.com");
                      // Optional: Add a toast notification here
                    }}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    aria-label="Copy Email"
                  >
                    <FontAwesomeIcon icon={faClipboard} className="h-6 w-6" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.a
              href="https://x.com/Onlyblogs_"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 flex items-center justify-center text-lg font-semibold rounded bg-black text-white"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              aria-label="Twitter"
            >
              <FaXTwitter size={24} className="text-white" />
            </motion.a>
          </motion.div>
          
          <motion.div 
            className="w-full max-w-md mx-auto mt-12 border-t border-secondary-light pt-8"
            variants={itemVariants}
          >
            <p className="text-text-secondary mb-4">Follow us for the latest updates</p>
            <div className="flex justify-center space-x-4">
              <motion.a
                href="https://x.com/Onlyblogs_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-primary hover:text-primary transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaXTwitter size={24} />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        <motion.section 
          className="py-8 bg-secondary-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="container mx-auto flex flex-col items-center justify-center p-4 space-y-4 md:p-10 lg:space-y-0 lg:flex-row lg:justify-between">
            <motion.h2 
              className="text-3xl font-semibold leading-tight text-center text-text-primary lg:text-left"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Got any queries?
            </motion.h2>
            <Link href="/contact">
              <motion.button 
                className="px-8 py-3 text-lg font-semibold rounded bg-gradient-to-r from-primary to-primary-light text-white"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 5px 15px rgba(229, 9, 20, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Contact
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </section>
    </>
  );
};

export default About;
