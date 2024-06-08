import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useData } from "../store/HandleApiContext";

const LiveMatch = () => {
  const { liveScores, fetchLiveScores, liveScoresError, loadingLiveScores } =
    useData();

  const [headings, setHeadings] = useState([]);
  const [selectedHeading, setSelectedHeading] = useState("");

  // Update headings when liveScores changes
  useEffect(() => {
    const updateHeadings = () => {
      if (liveScores && liveScores.length > 0) {
        const uniqueHeadings = Array.from(
          new Set(liveScores.map((match) => match.heading))
        );
        setHeadings(uniqueHeadings);
        setSelectedHeading(uniqueHeadings[0] || "");
      }
    };

    updateHeadings();
  }, [liveScores]);

  // Filter live scores based on selected heading
  const filteredScores =
    liveScores?.filter((match) => match.heading === selectedHeading) || [];

  return (
    liveScores.length >= 1 && (
      <div
        className={`bg-gradient-to-br from-white to-gray-200 shadow-lg rounded-lg p-4 sm:p-8 mb-8 text-black`}
      >
        <h3 className="text-xl sm:text-2xl mb-4 sm:mb-8 font-bold border-b-2 border-white pb-2 sm:pb-4">
          Live Matches
        </h3>

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

        {liveScoresError ? (
          <p className="text-red-200">{liveScoresError}</p>
        ) : liveScores.length === 0 && loadingLiveScores ? (
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
                <span className="font-semibold">Commentary:</span>{" "}
                {match.liveCommentary}
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

export default LiveMatch;
