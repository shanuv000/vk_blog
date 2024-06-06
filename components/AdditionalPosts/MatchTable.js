"use client";
import React, { useEffect, useState } from "react";

const MatchTable = () => {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/schedule")
      .then((response) => response.json()) // Directly parse the JSON response
      .then((data) => {
        if (data.success) {
          // Check if the request was successful
          const sortedData = data.data.sort(
            (a, b) => b.netRunRate - a.netRunRate
          ); // Access data within the 'data' property
          console.log("cricket data", sortedData);
          setSchedule(sortedData);
        } else {
          console.error("API request failed:", data.error); // Handle errors from the API
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Team</th>
            <th className="py-2 px-4 border-b">Matches</th>
            <th className="py-2 px-4 border-b">Wins</th>
            <th className="py-2 px-4 border-b">Losses</th>
            <th className="py-2 px-4 border-b">Ties</th>
            <th className="py-2 px-4 border-b">No Result</th>
            <th className="py-2 px-4 border-b">Points</th>
            <th className="py-2 px-4 border-b">Net Run Rate</th>
            <th className="py-2 px-4 border-b">Series Form</th>
            <th className="py-2 px-4 border-b">Next Match</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((team, index) => (
            <tr key={index}>
              <td className="py-2 px-4 border-b">{team.team}</td>
              <td className="py-2 px-4 border-b">{team.matches}</td>
              <td className="py-2 px-4 border-b">{team.wins}</td>
              <td className="py-2 px-4 border-b">{team.losses}</td>
              <td className="py-2 px-4 border-b">{team.ties}</td>
              <td className="py-2 px-4 border-b">{team.noResult}</td>
              <td className="py-2 px-4 border-b">{team.points}</td>
              <td className="py-2 px-4 border-b">{team.netRunRate}</td>
              <td className="py-2 px-4 border-b">{team.seriesForm}</td>{" "}
              <td className="py-2 px-4 border-b">
                {team.nextMatch.nextMatches}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;
