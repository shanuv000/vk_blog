import React from "react";
import { useData } from "../../store/HandleApiContext";
import { motion } from "framer-motion";
import Image from "next/image";
import ball from "../../public/cricket/ball.png";

/**
 * MatchTable component displays cricket tournament standings
 */
const ScheduleTable = () => {
  const { schedule, loadingSchedule, scheduleError, fetchSchedule } = useData();

  // Animation variants
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

  // Handle loading state
  if (loadingSchedule) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl p-6">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-urtechy-red border-r-urtechy-orange border-b-urtechy-red border-l-urtechy-orange rounded-full animate-spin"></div>
          <Image
            src={ball}
            alt="Cricket Ball"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8"
          />
        </div>
        <p className="text-lg font-medium text-gray-600">
          Loading tournament standings...
        </p>
      </div>
    );
  }

  // Handle error state
  if (scheduleError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white border-l-4 border-red-500 rounded-xl shadow-md"
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
            ></path>
          </svg>
          <h4 className="text-lg font-semibold text-gray-800">
            Unable to load tournament data
          </h4>
        </div>

        <p className="text-gray-600 mb-4">
          We're having trouble connecting to our cricket data service. You can
          try refreshing or check back later.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchSchedule}
          className="px-4 py-2 bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white rounded-md font-medium shadow-sm"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  // Handle empty data
  if (!schedule || schedule.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl">
        <Image src={ball} alt="Cricket" className="w-16 h-16 opacity-40 mb-4" />
        <p className="text-lg font-medium text-gray-500 text-center mb-4">
          No tournament standings available
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchSchedule}
          className="px-6 py-2 bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white rounded-full font-medium shadow-md"
        >
          Refresh
        </motion.button>
      </div>
    );
  }
  /**
   * Mapping of team names to their flag emojis
   * This provides a visual indicator for each team in the table
   */
  const flagEmojis = {
    // Asia
    India: "🇮🇳",
    Pakistan: "🇵🇰",
    Afghanistan: "🇦🇫",
    Bangladesh: "🇧🇩",
    "Sri Lanka": "🇱🇰",
    Nepal: "🇳🇵",

    // North America
    "United States of America": "🇺🇸",
    USA: "🇺🇸",
    Canada: "🇨🇦",
    "West Indies": "🌴",

    // Europe
    Ireland: "🇮🇪",
    Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Netherlands: "🇳🇱",

    // Oceania
    Australia: "🇦🇺",
    "New Zealand": "🇳🇿",
    "Papua New Guinea": "🇵🇬",

    // Africa
    Namibia: "🇳🇦",
    "South Africa": "🇿🇦",
    Uganda: "🇺🇬",

    // Middle East
    Oman: "🇴🇲",

    // Default for any missing team
    Unknown: "🏏",
  };

  /**
   * Get CSS class for series form indicator
   * @param {string} form - Form indicator (W, L, T, NR)
   * @returns {string} - CSS class string
   */
  const getSeriesFormClass = (form) => {
    switch (form) {
      case "W":
        return "bg-green-500 text-white";
      case "L":
        return "bg-red-500 text-white";
      case "NR":
        return "bg-gray-500 text-white";
      case "T":
        return "bg-yellow-500 text-white"; // T for ties
      default:
        return "bg-gray-500 text-white";
    }
  };

  /**
   * Parse series form string into array of form indicators
   * Handles special cases like "NR" (No Result) which is two characters
   *
   * @param {string} seriesForm - String of form indicators
   * @returns {Array} - Array of form indicators
   */
  const parseSeriesForm = (seriesForm) => {
    if (!seriesForm) return [];

    const forms = [];
    for (let i = 0; i < seriesForm.length; i++) {
      // Handle "NR" (No Result) special case
      if (
        i < seriesForm.length - 1 &&
        seriesForm[i] === "N" &&
        seriesForm[i + 1] === "R"
      ) {
        forms.push("NR");
        i++; // Skip next character as it's part of 'NR'
      } else {
        forms.push(seriesForm[i]);
      }
    }
    return forms;
  };

  /**
   * Define columns that should be displayed in the table
   * These are the possible columns that might be available in the data
   */
  const columnsToCheck = [
    "matches",
    "wins",
    "losses",
    "ties",
    "noResult",
    "points",
    "netRunRate",
    "seriesForm",
    "nextMatch",
  ];

  /**
   * Determine which columns have null/empty values and should be hidden
   * This makes the table responsive to the available data
   *
   * @returns {Object} - Object with column names as keys and boolean values
   */
  const getColumnsWithNullValues = () => {
    return columnsToCheck.reduce((acc, column) => {
      // Check if any team in any group has a null/empty value for this column
      const hasNull = schedule.some((group) =>
        group.teams.some((team) => {
          // Special handling for nextMatch which is an object
          if (column === "nextMatch") {
            return !team[column] || !team[column].for || !team[column].against;
          }

          // For other columns, check if value is null, undefined, or empty string
          return (
            team[column] === null ||
            team[column] === undefined ||
            team[column] === ""
          );
        })
      );

      // If column has null values, mark it to be hidden
      if (hasNull) {
        acc[column] = true;
      }
      return acc;
    }, {});
  };

  // Get columns that should be hidden
  const columnsWithNullValues = getColumnsWithNullValues();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 md:p-6"
    >
      {schedule.map((group) => (
        <motion.div
          key={group.groupName}
          variants={item}
          className="mb-8 bg-white rounded-xl overflow-hidden shadow-md"
        >
          <div className="bg-gradient-to-r from-urtechy-red to-urtechy-orange px-4 py-3">
            <h2 className="text-base md:text-lg font-bold text-white text-center">
              {group.groupName}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">
                    Team
                  </th>
                  {!columnsWithNullValues.matches && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      M
                    </th>
                  )}
                  {!columnsWithNullValues.wins && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      W
                    </th>
                  )}
                  {!columnsWithNullValues.losses && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      L
                    </th>
                  )}
                  {!columnsWithNullValues.ties && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      T
                    </th>
                  )}
                  {!columnsWithNullValues.noResult && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      NR
                    </th>
                  )}
                  {!columnsWithNullValues.points && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      Pts
                    </th>
                  )}
                  {!columnsWithNullValues.netRunRate && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      NRR
                    </th>
                  )}
                  {!columnsWithNullValues.seriesForm && (
                    <th className="py-3 px-4 text-center font-semibold text-gray-700">
                      Form
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, index) => (
                  <tr
                    key={team.team}
                    className={`hover:bg-gray-50 transition-colors ${
                      team.team === "India" ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4 border-b border-gray-100">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">
                          {flagEmojis[team.team] || "🏏"}
                        </span>
                        <span className="font-medium">{team.team}</span>
                      </div>
                    </td>
                    {!columnsWithNullValues.matches && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center">
                        {team.matches}
                      </td>
                    )}
                    {!columnsWithNullValues.wins && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center font-medium text-green-600">
                        {team.wins}
                      </td>
                    )}
                    {!columnsWithNullValues.losses && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center font-medium text-red-600">
                        {team.losses}
                      </td>
                    )}
                    {!columnsWithNullValues.ties && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center">
                        {team.ties}
                      </td>
                    )}
                    {!columnsWithNullValues.noResult && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center">
                        {team.noResult}
                      </td>
                    )}
                    {!columnsWithNullValues.points && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center font-bold">
                        {team.points}
                      </td>
                    )}
                    {!columnsWithNullValues.netRunRate && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center">
                        <span
                          className={
                            parseFloat(team.netRunRate) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {team.netRunRate}
                        </span>
                      </td>
                    )}
                    {!columnsWithNullValues.seriesForm && (
                      <td className="py-3 px-4 border-b border-gray-100 text-center">
                        <div className="inline-flex flex-wrap justify-center gap-1">
                          {parseSeriesForm(team.seriesForm).map(
                            (form, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getSeriesFormClass(
                                  form
                                )}`}
                              >
                                {form}
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ScheduleTable;
