import React from "react";
import Head from "next/head";
import ShowCricket from "../components/Cricket/ShowCricket";
import Image from "next/image";
import ball from "../public/cricket/ball.png";
import { motion } from "framer-motion";

/**
 * LiveCricket page component
 * Displays cricket match information in a dedicated page
 *
 * @returns {React.ReactElement} - Rendered component
 */
const LiveCricket = () => {
  return (
    <>
      <Head>
        <title>Live Cricket Scores & Updates | urTechy Blogs</title>
        <meta
          name="description"
          content="Get the latest cricket scores, match updates, and tournament standings in real-time."
        />
        <meta
          name="keywords"
          content="cricket, live scores, cricket matches, tournament standings"
        />
      </Head>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-8 md:mb-12"
        >
          <div className="flex items-center mb-4">
            <Image
              src={ball}
              alt="Cricket Ball"
              className="w-10 h-10 mr-3"
              priority
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Cricket Updates
            </h1>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-urtechy-red to-urtechy-orange rounded-full"></div>
          <p className="mt-4 text-gray-600 text-center max-w-2xl">
            Get the latest cricket scores, match updates, and tournament
            standings in real-time. Stay updated with live matches, recent
            results, and upcoming fixtures.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <ShowCricket />
        </motion.div>
      </div>
    </>
  );
};

export default LiveCricket;
