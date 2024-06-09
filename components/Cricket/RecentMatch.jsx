import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useData } from "../../store/HandleApiContext";
import ball from "../../public/cricket/ball.png";
import Image from "next/image";

const RecentMatch = () => {
  const {
    recentScores,
    recentScoresError,
    loadingRecentScores,
    fetchRecentScores,
  } = useData();

  const [headings, setHeadings] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update headings when recentScores changes
  useEffect(() => {
    const updateHeadings = () => {
      if (recentScores && recentScores.length > 0) {
        const uniqueHeadings = Array.from(
          new Set(recentScores.map((match) => match.heading))
        );
        setHeadings(uniqueHeadings);
        setSelectedHeading(uniqueHeadings[0] || "");
      }
    };

    updateHeadings();
  }, [recentScores]);

  // Function to handle refresh button click
  const handleRefreshClick = () => {
    setIsRefreshing(true);
    fetchRecentScores();
    setTimeout(() => setIsRefreshing(false), 3000); // Simulate refreshing animation duration
  };

  // Filter recent scores based on selected heading
  const filteredScores =
    recentScores?.filter((match) => match.heading === selectedHeading) || [];

  return (
    recentScores.length >= 1 && (
      <div
        className={`bg-gradient-to-br from-white to-gray-200 shadow-lg rounded-lg p-4 sm:p-8 mb-8 text-black`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl sm:text-2xl font-bold border-b-2 border-white pb-2 sm:pb-4">
            Recent Matches
          </h3>
          <button
            onClick={handleRefreshClick}
            className={`flex items-center text-blue-800 font-bold rounded ${
              isRefreshing ? "animate-spin" : "animate-bounce"
            }`}
          >
            <Image src={ball} alt="Refresh" className="w-6 h-6" />
          </button>
        </div>

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
          >
            {headings.map((heading, index) => (
              <option key={index} value={heading}>
                {heading}
              </option>
            ))}
          </select>
        </div>

        {recentScoresError ? (
          <p className="text-red-200">{recentScoresError}</p>
        ) : recentScores.length === 0 && loadingRecentScores ? (
          <p className="text-lg font-semibold text-yellow-200">
            Loading matches...
          </p>
        ) : filteredScores.length === 0 ? (
          <p className="text-lg font-semibold text-yellow-200">
            No matches available
          </p>
        ) : (
          filteredScores.map((match, index) => (
            <div
              key={index}
              className="mb-6 p-4 sm:p-6 bg-white rounded-lg text-gray-900 shadow-md"
            >
              {match.title !== "N/A" && (
                <h4 className="text-lg sm:text-xl font-extrabold mb-2">
                  {match.title}
                </h4>
              )}

              <h2 className="text-base font-bold text-red-500 mb-2">
                {match.playingTeamBat} {match.liveScorebat}
              </h2>

              {match.playingTeamBall !== "N/A" && (
                <h2 className="text-sm font-semibold text-gray-500 mb-2">
                  {match.liveScoreball !== "N/A"
                    ? `${match.playingTeamBall} ${match.liveScoreball}`
                    : match.playingTeamBall}
                </h2>
              )}

              <p className="text-sm sm:text-md font-medium text-gray-700 mb-1">
                {match.matchDetails}
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <span className="font-semibold text-green-500">
                  {match.time === "N/A" ? "Today" : match.time}
                </span>
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <span className="font-semibold">Location:</span>{" "}
                {match.location}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                <span className="font-semibold ">Commentary:</span>{" "}
                <span className="text-pink-500 md:font-semibold">
                  {match.liveCommentary}
                </span>
              </p>
              <div className="mt-4 flex flex-wrap">
                {Object.entries(match.links).map(
                  ([linkTitle, linkUrl], linkIndex) => (
                    <Link key={linkIndex} href={linkUrl} legacyBehavior>
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
            </div>
          ))
        )}
      </div>
    )
  );
};

export default RecentMatch;
