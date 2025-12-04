import React from "react";
import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import ShowCricket from "../components/Cricket/ShowCricket";
import ball from "../public/cricket/ball.png";


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
          content="Follow your favorite cricket teams with live scores, comprehensive match details, and up-to-the-minute tournament standings for IPL, World Cup, and all major cricket events."
        />
        <meta
          name="keywords"
          content="cricket, live scores, IPL, World Cup, cricket matches, tournament standings, cricket updates, real-time cricket, match details"
        />
      </Head>

      <div className="w-full mx-auto px-0 md:px-4 py-4 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-6 md:mb-12 px-4 md:px-0"
        >
          <div className="flex items-center mb-4">
            <Image
              src={ball}
              alt="Cricket Ball"
              width={40}
              height={40}
              quality={70}
              sizes="40px"
              className="w-10 h-10 mr-3"
              priority
            />
            <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
              Cricket Updates
            </h1>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full" />
          <p className="mt-4 text-center max-w-2xl font-medium leading-relaxed">
            <span className="text-gray-200">
              Follow your favorite cricket teams with{" "}
            </span>
            <span className="text-red-400 font-semibold">live scores</span>
            <span className="text-gray-200">
              , comprehensive match details, and{" "}
            </span>
            <span className="text-red-400 font-semibold">
              up-to-the-minute tournament standings
            </span>
            <span className="text-gray-200">
              . Never miss a moment with our real-time updates covering{" "}
            </span>
            <span className="text-yellow-400 font-semibold">IPL</span>
            <span className="text-gray-200">, </span>
            <span className="text-yellow-400 font-semibold">World Cup</span>
            <span className="text-gray-200">
              , and all major cricket events.
            </span>
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
