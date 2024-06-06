import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

const LiveMatch = () => {
  const [liveScores, setLiveScores] = useState([]);
  const [liveScoresError, setLiveScoresError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedHeading, setSelectedHeading] = useState(
    "ICC MENS T20 WORLD CUP 2024"
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api-sync.vercel.app/api/live-scores"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLiveScores(data);
        setLoading(false);
      } catch (error) {
        setLiveScoresError("Error fetching live scores: " + error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <ClipLoader color="#007bff" loading={loading} size={150} />
      </div>
    );
  }

  const headings = ["ICC MENS T20 WORLD CUP 2024", "T20 BLAST 2024"];

  const filteredScores = liveScores.filter(
    (match) => match.heading === selectedHeading
  );

  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 shadow-lg rounded-lg p-4 sm:p-8 mb-8 text-white">
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
      ) : filteredScores.length === 0 ? (
        <p className="text-lg font-semibold text-yellow-200">
          No matches available for the selected tournament.
        </p>
      ) : (
        filteredScores.map((match, index) => (
          <div
            key={index}
            className="mb-6 p-4 sm:p-6 bg-white rounded-lg text-gray-900 shadow-md"
          >
            <h4 className="text-lg sm:text-xl font-extrabold mb-2">
              {match.title}
            </h4>
            <h2 className="text-base font-bold text-red-500 mb-2">
              {match.playingTeam} {match.liveScore}
            </h2>
            <p className="text-sm sm:text-md font-medium text-gray-700 mb-1">
              {match.matchDetails}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              <span className="font-semibold">Time:</span> {match.time}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              <span className="font-semibold">Location:</span> {match.location}
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
  );
};

export default LiveMatch;
