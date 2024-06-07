// src/AdditionalPosts/MatchTable.js
import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";

const MatchTable = () => {
  const [schedule, setSchedule] = useState([]);
  const [showFullTable, setShowFullTable] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);
  const [loads, setLoads] = useState(true);

  useEffect(() => {
    fetch("https://api-sync.vercel.app/api/schedule")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          const sortedData = data.data.sort(
            (a, b) => b.netRunRate - a.netRunRate
          );
          setSchedule(sortedData);
        } else {
          setScheduleError("API request failed: " + data.error);
        }
        setLoads(false);
      })
      .catch((error) => {
        setScheduleError("Error fetching schedule: " + error.message);
        setLoads(false);
      });
  }, []);

  const handleShowMore = () => {
    setShowFullTable(true);
  };

  const rowsToShow = showFullTable ? schedule : schedule.slice(0, 4);
  const getSeriesFormClass = (form) => {
    switch (form) {
      case "W":
        return "text-green-600";
      case "L":
        return "text-red-500";
      default:
        return "text-gray-600"; // Default class
    }
  };

  if (scheduleError) {
    return <div className="text-red-500 text-center mt-4">{scheduleError}</div>;
  }
  if (loads) {
    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <ClipLoader color="#007bff" loading={loads} size={150} />
      </div>
    );
  }

  return (
    <div className="py-4 overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg">
        <thead className="bg-gradient-to-b from-indigo-500 to-blue-600 text-white">
          <tr>
            <th className="py-2 px-2 sm:px-4 border-b">Team</th>
            <th className="py-2 px-2 sm:px-4 border-b">Matches</th>
            <th className="py-2 px-2 sm:px-4 border-b">Wins</th>
            <th className="py-2 px-2 sm:px-4 border-b">Losses</th>
            <th className="py-2 px-2 sm:px-4 border-b">Ties</th>
            <th className="py-2 px-2 sm:px-4 border-b">No Result</th>
            <th className="py-2 px-2 sm:px-4 border-b">Points</th>
            <th className="py-2 px-2 sm:px-4 border-b">Net Run Rate</th>
            <th className="py-2 px-2 sm:px-4 border-b">Series Form</th>
            <th className="py-2 px-2 sm:px-4 border-b">Next Match</th>
            <th className="py-2 px-2 sm:px-4 border-b">for</th>
            <th className="py-2 px-2 sm:px-4 border-b">Against</th>
          </tr>
        </thead>
        <tbody>
          {rowsToShow.map((team, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? "bg-gray-100" : "bg-white"
              } hover:bg-gray-200 transition duration-300 text-gray-700 text-sm`}
            >
              <td className="py-2 px-2 sm:px-4 border-b font-semibold text-red-500">
                {team.team}
              </td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.matches}</td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.wins}</td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.losses}</td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.ties}</td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.noResult}</td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.points}</td>
              <td className="py-2 px-2 sm:px-4 border-b">{team.netRunRate}</td>
              <td
                className={`py-2 px-2 sm:px-4 border-b ${getSeriesFormClass(
                  team.seriesForm
                )}`}
              >
                {team.seriesForm}
              </td>
              <td className="py-2 px-2 sm:px-4 border-b">
                {team.nextMatch?.nextMatches || "N/A"}
              </td>
              <td className="py-2 px-2 sm:px-4 border-b">
                {team.nextMatch?.for || "N/A"}
              </td>
              <td className="py-2 px-2 sm:px-4 border-b">
                {team.nextMatch?.against || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showFullTable && schedule.length > 4 && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
          onClick={handleShowMore}
        >
          Show All
        </button>
      )}
    </div>
  );
};

export default MatchTable;
