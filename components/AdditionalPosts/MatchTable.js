"use client";
import React, { useEffect, useState } from "react";

const MatchTable = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://cricbuzz-backend.vercel.app/api/t20-world-cup-2024")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMatches(data.t20_world_cup_2024.matches);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center ">
        India's T20 World Cup 2024 Matches
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Opponent</th>
              <th className="px-4 py-2 border-b">Venue</th>
              <th className="px-4 py-2 border-b">Time</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{match.date}</td>
                <td className="px-4 py-2 border-b">{match.opponent}</td>
                <td className="px-4 py-2 border-b">{match.venue}</td>
                <td className="px-4 py-2 border-b">{match.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchTable;
