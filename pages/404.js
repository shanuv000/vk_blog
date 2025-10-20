import React from "react";

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { motion } from "framer-motion";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | urTechy Blogs</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold text-urtechy-red mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
          <p className="text-lg mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-urtechy-red text-white rounded-lg hover:bg-urtechy-orange transition-colors duration-300"
          >
            Return to Home
          </Link>
        </motion.div>
      </div>
    </>
  );
}
