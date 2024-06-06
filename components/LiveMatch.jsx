import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ClipLoader } from "react-spinners";

const LiveMatch = () => {
  const [liveScores, setLiveScores] = useState([]);
  const [liveScoresError, setLiveScoresError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api-sync.vercel.app/api/live-scores")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setLiveScores(data);
        setLoading(false);
      })
      .catch((error) => {
        setLiveScoresError("Error fetching live scores: " + error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <ClipLoader color="#007bff" loading={loading} size={150} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 shadow-lg rounded-lg p-8 mb-8 text-white">
      <h3 className="text-2xl mb-8 font-bold border-b-2 border-white pb-4">
        Live Matches
      </h3>
      {liveScoresError ? (
        <p className="text-red-200">{liveScoresError}</p>
      ) : (
        liveScores.map((match, index) => (
          <div
            key={index}
            className="mb-6 p-6 bg-white rounded-lg text-gray-900 shadow-md"
          >
            <h4 className="text-xl font-extrabold mb-2">{match.title}</h4>
            <h2 className="text-base font-bold text-red-500 mb-2">
              {match.playingTeam} {match.liveScore}
            </h2>
            <p className="text-md font-medium text-gray-700 mb-1">
              {match.matchDetails}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Time:</span> {match.time}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Location:</span> {match.location}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Commentary:</span>{" "}
              {match.liveCommentary}
            </p>
            <div className="mt-4">
              {Object.entries(match.links).map(
                ([linkTitle, linkUrl], linkIndex) => (
                  <Link key={linkIndex} href={linkUrl} legacyBehavior>
                    <a
                      className="text-blue-600 hover:text-blue-800 hover:underline mr-4"
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
