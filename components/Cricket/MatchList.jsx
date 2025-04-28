import React from "react";
import Link from "next/link";
import Image from "next/image";
import ball from "../../public/cricket/ball.png";
import { ClipLoader } from "react-spinners";

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
  // Filter matches by selected tournament
  const filteredMatches =
    matches?.filter((match) => match.heading === selectedHeading) || [];

  // If no matches and not loading, return null
  if (!loading && (!matches || matches.length === 0)) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-200 shadow-lg rounded-lg p-4 sm:p-8 mb-8 text-black">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl sm:text-2xl font-bold border-b-2 border-white pb-2 sm:pb-4">
            {title}
          </h3>
          <button
            onClick={onRefresh}
            className="flex items-center text-blue-800 font-bold rounded"
            aria-label="Refresh matches"
          >
            <Image src={ball} alt="Refresh" className="w-6 h-6" />
          </button>
        </div>
        <p className="text-lg font-semibold text-gray-600 p-4 text-center">
          No matches available. Try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-200 shadow-lg rounded-lg p-4 sm:p-8 mb-8 text-black">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold border-b-2 border-white pb-2 sm:pb-4">
          {title}
        </h3>
        <button
          onClick={onRefresh}
          className={`flex items-center text-blue-800 font-bold rounded ${
            isRefreshing ? "animate-spin" : "animate-bounce"
          }`}
        >
          <Image src={ball} alt="Refresh" className="w-6 h-6" />
        </button>
      </div>

      {/* Tournament selector */}
      {headings.length > 0 && (
        <div className="mb-4">
          <label
            htmlFor="heading-select"
            className="block mb-2 text-base sm:text-lg font-semibold"
          >
            Select Tournament:
          </label>
          <select
            id="heading-select"
            value={selectedHeading}
            onChange={(e) => setSelectedHeading(e.target.value)}
            className="w-full p-2 rounded-lg text-gray-900 bg-white"
            disabled={loading || isRefreshing}
          >
            {headings.map((heading, index) => (
              <option key={index} value={heading}>
                {heading}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error and loading states */}
      {error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <p className="font-medium">Error loading matches:</p>
          <p>{error}</p>
          <button
            onClick={onRefresh}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <ClipLoader color="#1E40AF" size={40} />
          <p className="mt-4 text-lg font-semibold text-gray-700">
            Loading matches...
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-lg font-semibold text-gray-600 mb-4">
            No matches available for this tournament
          </p>
          <button
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        filteredMatches.map((match, index) => (
          <div
            key={`${match.heading}-${index}`}
            className="mb-6 p-4 sm:p-6 bg-white rounded-lg text-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            {/* Match title */}
            {match.title && match.title !== "N/A" && (
              <h4 className="text-lg sm:text-xl font-extrabold mb-2">
                {match.title}
              </h4>
            )}

            {/* Batting team score */}
            {match.playingTeamBat && match.playingTeamBat !== "N/A" && (
              <h2 className="text-base font-bold text-red-500 mb-2">
                {match.playingTeamBat}{" "}
                <span className="font-extrabold">{match.liveScorebat}</span>
              </h2>
            )}

            {/* Bowling team score */}
            {match.playingTeamBall && match.playingTeamBall !== "N/A" && (
              <h2 className="text-sm font-semibold text-gray-500 mb-2">
                {match.liveScoreball && match.liveScoreball !== "N/A"
                  ? `${match.playingTeamBall} ${match.liveScoreball}`
                  : match.playingTeamBall}
              </h2>
            )}

            {/* Match details */}
            {match.matchDetails && (
              <p className="text-sm sm:text-md font-medium text-gray-700 mb-1">
                {match.matchDetails}
              </p>
            )}

            {/* Time for live matches */}
            {title === "Live Matches" && match.time && (
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <span className="font-semibold text-green-500">
                  {match.time === "N/A" ? "Today" : match.time}
                </span>
              </p>
            )}

            {/* Location */}
            {match.location && (
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <span className="font-semibold">Location:</span>{" "}
                {match.location}
              </p>
            )}

            {/* Commentary */}
            {match.liveCommentary && (
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <span className="font-semibold">Commentary:</span>{" "}
                <span className="text-pink-500 md:font-semibold">
                  {match.liveCommentary}
                </span>
              </p>
            )}

            {/* Links */}
            {match.links && Object.keys(match.links).length > 0 && (
              <div className="mt-4 flex flex-wrap">
                {Object.entries(match.links).map(
                  ([linkTitle, linkUrl], linkIndex) => (
                    <Link key={linkIndex} href={linkUrl || "#"} legacyBehavior>
                      <a
                        className="text-blue-600 hover:text-blue-800 hover:underline mr-4 mb-2"
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
        ))
      )}
    </div>
  );
};

export default MatchList;
