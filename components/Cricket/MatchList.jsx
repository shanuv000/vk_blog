import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BiCommentDetail, BiChevronDown, BiChevronUp } from "react-icons/bi";
import { FiRefreshCw } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import ball from "../../public/cricket/ball.png";
import Scorecard from "./Scorecard";

/**
 * MatchList component displays cricket matches with filtering by tournament
 *
 * @param {string} title - Title of the match list
 * @param {Array} matches - Array of match data
 * @param {string} error - Error message if any
 * @param {boolean} loading - Loading state
 * @param {Function} onRefresh - Function to refresh match data
 * @param {boolean} isRefreshing - Refreshing state
 * @param {Array} headings - Array of tournament headings
 * @param {string} selectedHeading - Currently selected tournament heading
 * @param {Function} setSelectedHeading - Function to set selected heading
 */
const MatchList = ({
  title,
  matches = [],
  error,
  loading,
  onRefresh,
  isRefreshing,
  headings = [],
  selectedHeading,
  setSelectedHeading,
}) => {
  const [expandedMatchIndex, setExpandedMatchIndex] = useState(null);

  // Filter matches by selected tournament
  const filteredMatches =
    matches?.filter((match) => match.heading === selectedHeading) || [];

  // Animation variants for list items
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const toggleScorecard = (index) => {
    setExpandedMatchIndex(expandedMatchIndex === index ? null : index);
  };

  // If no matches and not loading, return empty state
  if (!loading && (!matches || matches.length === 0)) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {title}
            <div className="h-1 w-20 bg-gradient-to-r from-urtechy-red to-urtechy-orange mt-2 rounded-full" />
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Refresh matches"
          >
            <FiRefreshCw className="w-5 h-5 text-gray-700" />
          </motion.button>
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <Image
            src={ball}
            alt="Cricket"
            width={64}
            height={64}
            quality={70}
            sizes="64px"
            className="w-16 h-16 opacity-50 mb-4"
          />
          <p className="text-lg font-medium text-gray-500 text-center">
            No matches available at the moment
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white rounded-full font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            Refresh
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg md:rounded-xl p-3 md:p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl sm:text-2xl font-heading font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
          {title}
          <div className="h-1 w-20 bg-gradient-to-r from-red-400 to-yellow-400 mt-2 rounded-full" />
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onRefresh}
          className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${
            isRefreshing ? "animate-spin" : ""
          }`}
          disabled={isRefreshing}
        >
          <FiRefreshCw className="w-5 h-5 text-gray-700" />
        </motion.button>
      </div>

      {/* Tournament selector */}
      {headings.length > 0 && (
        <div className="mb-6">
          <label
            htmlFor="heading-select"
            className="block mb-2 text-base font-medium text-gray-700"
          >
            Tournament
          </label>
          <div className="relative">
            <select
              id="heading-select"
              value={selectedHeading}
              onChange={(e) => setSelectedHeading(e.target.value)}
              className="block w-full px-4 py-3 pr-8 leading-tight text-gray-700 bg-white border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-urtechy-orange focus:border-transparent"
              disabled={loading || isRefreshing}
            >
              {headings.map((heading, index) => (
                <option key={index} value={heading}>
                  {heading}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Error and loading states */}
      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white border-l-4 border-red-500 rounded-lg shadow-md mb-6"
        >
          <div className="flex items-center mb-4">
            <svg
              className="w-6 h-6 text-red-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h4 className="text-lg font-semibold text-gray-800">
              Unable to load cricket data
            </h4>
          </div>

          <p className="text-gray-600 mb-4">
            We're having trouble connecting to our cricket data service. You can
            try refreshing or check other sources for the latest updates.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="px-4 py-2 bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white rounded-md font-medium shadow-sm"
            >
              Try Again
            </motion.button>

            <a
              href="https://www.espncricinfo.com/live-cricket-score"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium shadow-sm hover:bg-gray-50 transition-colors"
            >
              ESPNCricinfo
            </a>

            <a
              href="https://www.cricbuzz.com/cricket-match/live-scores"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium shadow-sm hover:bg-gray-50 transition-colors"
            >
              Cricbuzz
            </a>
          </div>
        </motion.div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full" />
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-urtechy-red border-r-urtechy-orange border-b-urtechy-red border-l-urtechy-orange rounded-full animate-spin" />
            <Image
              src={ball}
              alt="Cricket Ball"
              width={32}
              height={32}
              quality={70}
              sizes="32px"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8"
            />
          </div>
          <p className="text-lg font-medium">
            <span className="text-red-400">Loading</span>
            <span className="text-gray-200"> cricket </span>
            <span className="text-yellow-400">updates</span>
            <span className="text-gray-200">...</span>
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Image
            src={ball}
            alt="Cricket"
            width={64}
            height={64}
            quality={70}
            sizes="64px"
            className="w-16 h-16 opacity-40 mb-4"
          />
          <p className="text-lg font-medium text-center mb-4">
            <span className="text-gray-200">No matches available for </span>
            <span className="text-yellow-400 font-semibold">
              this tournament
            </span>
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            className="px-6 py-2 bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white rounded-full font-medium shadow-md"
          >
            Refresh
          </motion.button>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {filteredMatches.map((match, index) => (
            <motion.div
              key={`${match.heading}-${index}`}
              variants={item}
              className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Match header with title */}
              <div className="border-b border-gray-100 bg-gray-50 px-3 py-2 md:px-5 md:py-3">
                {match.title && match.title !== "N/A" ? (
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">
                    {match.title}
                  </h4>
                ) : (
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">
                    {match.heading || "Cricket Match"}
                  </h4>
                )}
              </div>

              {/* Match content */}
              <div className="p-3 md:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  {/* Team scores */}
                  <div className="space-y-2 mb-3 sm:mb-0">
                    {/* Batting team */}
                    {match.playingTeamBat && match.playingTeamBat !== "N/A" && (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-urtechy-red to-urtechy-orange flex items-center justify-center text-white font-bold text-xs mr-3">
                          {match.playingTeamBat.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-800">
                            {match.playingTeamBat}
                          </h2>
                          <p className="text-lg font-extrabold text-urtechy-red">
                            {match.liveScorebat}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bowling team */}
                    {match.playingTeamBall &&
                      match.playingTeamBall !== "N/A" && (
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs mr-3">
                            {match.playingTeamBall
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-base font-medium text-gray-700">
                              {match.playingTeamBall}
                            </h2>
                            {match.liveScoreball &&
                              match.liveScoreball !== "N/A" && (
                                <p className="text-base font-bold text-gray-600">
                                  {match.liveScoreball}
                                </p>
                              )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Match status */}
                  {match.matchDetails && (
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 self-start">
                      {match.matchDetails}
                    </div>
                  )}
                </div>

                {/* Match info */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                  {/* Time for live matches */}
                  {title === "Live Matches" && match.time && (
                    <div className="flex items-center text-green-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="font-medium">
                        {match.time === "N/A" ? "Live Now" : match.time}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  {match.location && (
                    <div className="flex items-center text-gray-600">
                      <IoLocationOutline className="w-4 h-4 mr-2" />
                      <span>{match.location}</span>
                    </div>
                  )}

                  {/* Commentary */}
                  {match.liveCommentary && (
                    <div className="flex items-start text-gray-600 mt-2">
                      <BiCommentDetail className="w-4 h-4 mr-2 mt-1" />
                      <span className="text-urtechy-orange font-medium">
                        {match.liveCommentary}
                      </span>
                    </div>
                  )}
                </div>

                {/* Scorecard Toggle */}
                {match.scorecard && match.scorecard.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleScorecard(index)}
                      className="flex items-center text-sm font-medium text-urtechy-red hover:text-urtechy-orange transition-colors focus:outline-none"
                    >
                      {expandedMatchIndex === index ? (
                        <>
                          Hide Scorecard <BiChevronUp className="ml-1 w-5 h-5" />
                        </>
                      ) : (
                        <>
                          View Scorecard <BiChevronDown className="ml-1 w-5 h-5" />
                        </>
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedMatchIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Scorecard scorecard={match.scorecard} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Links */}
                {match.links && Object.keys(match.links).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    {Object.entries(match.links).map(
                      ([linkTitle, linkUrl], linkIndex) => (
                        <Link
                          key={linkIndex}
                          href={linkUrl || "#"}
                          legacyBehavior
                        >
                          <a
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {linkTitle}
                          </a>
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MatchList;
