import React from "react";
import { useData } from "../../store/HandleApiContext";
import { BarLoader } from "react-spinners";

/**
 * MatchTable component displays cricket tournament standings
 */
const ScheduleTable = () => {
  const { schedule, loadingSchedule, scheduleError, fetchSchedule } = useData();

  // Handle loading state
  if (loadingSchedule) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg p-4">
        <BarLoader color="#1E40AF" width={150} />
        <p className="mt-4 text-gray-600">Loading tournament data...</p>
      </div>
    );
  }

  // Handle error state
  if (scheduleError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p className="font-medium">Error loading tournament data:</p>
        <p>{scheduleError}</p>
        <button
          onClick={fetchSchedule}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Handle empty data
  if (!schedule || schedule.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-lg">
        <p className="text-lg font-semibold text-gray-600 mb-4">
          No tournament data available
        </p>
        <button
          onClick={fetchSchedule}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
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
    <div className="p-2 md:p-4">
      {schedule.map((group) => (
        <div key={group.groupName} className="mb-4 md:mb-8">
          <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-4 text-primary text-orange-300 text-center">
            {group.groupName}
          </h2>
          <div className="overflow-x-auto rounded">
            <table className="min-w-full bg-white text-xs md:text-sm">
              <thead>
                <tr>
                  <th className="py-1 px-2 md:px-4 bg-gray-200 text-left">
                    Team
                  </th>
                  {!columnsWithNullValues.matches && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Matches
                    </th>
                  )}
                  {!columnsWithNullValues.wins && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Wins
                    </th>
                  )}
                  {!columnsWithNullValues.losses && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Losses
                    </th>
                  )}
                  {!columnsWithNullValues.ties && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Ties
                    </th>
                  )}
                  {!columnsWithNullValues.noResult && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      No Result
                    </th>
                  )}
                  {!columnsWithNullValues.points && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Points
                    </th>
                  )}
                  {!columnsWithNullValues.netRunRate && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Net Run Rate
                    </th>
                  )}
                  {!columnsWithNullValues.seriesForm && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Series Form
                    </th>
                  )}

                  {/* {!columnsWithNullValues.nextMatch && (
                    <th className="py-1 px-2 md:px-4 bg-gray-200 text-right">
                      Next Match
                    </th>
                  )} */}
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, index) => (
                  <tr
                    key={team.team}
                    className={
                      team.team === "India"
                        ? "bg-blue-100 text-blue-800"
                        : index % 2 === 0
                        ? "bg-gray-50"
                        : "bg-white"
                    }
                  >
                    <td className="py-1 px-2 md:px-4 border-b">
                      {flagEmojis[team.team]} {team.team}
                    </td>
                    {!columnsWithNullValues.matches && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.matches}
                      </td>
                    )}
                    {!columnsWithNullValues.wins && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.wins}
                      </td>
                    )}
                    {!columnsWithNullValues.losses && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.losses}
                      </td>
                    )}
                    {!columnsWithNullValues.ties && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.ties}
                      </td>
                    )}
                    {!columnsWithNullValues.noResult && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.noResult}
                      </td>
                    )}
                    {!columnsWithNullValues.points && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.points}
                      </td>
                    )}
                    {!columnsWithNullValues.netRunRate && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        {team.netRunRate}
                      </td>
                    )}
                    {!columnsWithNullValues.seriesForm && (
                      <td className="py-1 px-2 md:px-4 border-b text-right">
                        <div className="inline-flex flex-wrap gap-0.5 md:gap-1">
                          {parseSeriesForm(team.seriesForm).map(
                            (form, index) => (
                              <span
                                key={index}
                                className={`inline-block px-1 md:px-2 py-0.5 md:py-1 rounded ${getSeriesFormClass(
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
        </div>
      ))}
    </div>
  );
};

export default ScheduleTable;
