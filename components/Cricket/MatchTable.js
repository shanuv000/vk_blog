import React from "react";
import { useData } from "../../store/HandleApiContext";
import { BarLoader } from "react-spinners";

const ScheduleTable = () => {
  const { schedule, loadingSchedule } = useData();
  if (loadingSchedule) {
    return (
      <div className="flex justify-center items-center h-full">
        <BarLoader color="#FFFFFF" />
      </div>
    );
  }
  console.log(loadingSchedule);
  // Mapping of team names to their flag emojis
  const flagEmojis = {
    India: "🇮🇳",
    "United States of America": "🇺🇸",
    USA: "🇺🇸",
    Canada: "🇨🇦",
    Pakistan: "🇵🇰",
    Ireland: "🇮🇪",
    Scotland: "🏴",
    Australia: "🇦🇺",
    Namibia: "🇳🇦",
    England: "🇬🇧",
    Oman: "🇴🇲",
    Afghanistan: "🇦🇫",
    "West Indies": "🌴",
    Uganda: "🇺🇬",
    "Papua New Guinea": "🇵🇬",
    "New Zealand": "🇳🇿",
    "South Africa": "🇿🇦",
    Bangladesh: "🇧🇩",
    Netherlands: "🇳🇱",
    Nepal: "🇳🇵",
    "Sri Lanka": "🇱🇰",
  };

  const getSeriesFormClass = (form) => {
    if (form === "W") return "bg-green-500 text-white";
    if (form === "L") return "bg-red-500 text-white";
    if (form === "NR") return "bg-gray-500 text-white";
    if (form === "T") return "bg-yellow-500 text-white"; // Adding "T" for ties
    return "bg-gray-500 text-white";
  };

  const parseSeriesForm = (seriesForm) => {
    const forms = [];
    for (let i = 0; i < seriesForm.length; i++) {
      if (seriesForm[i] === "N" && seriesForm[i + 1] === "R") {
        forms.push("NR");
        i++; // Skip next character as it's part of 'NR'
      } else {
        forms.push(seriesForm[i]);
      }
    }
    return forms;
  };

  // Check which columns have null or empty values and should be hidden
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

  const columnsWithNullValues = columnsToCheck.reduce((acc, column) => {
    const hasNull = schedule.some((group) =>
      group.teams.some((team) => {
        if (column === "nextMatch") {
          return !team[column] || !team[column].for || !team[column].against;
        }
        return (
          team[column] === null ||
          team[column] === undefined ||
          team[column] === ""
        );
      })
    );
    if (hasNull) {
      acc[column] = true;
    }
    return acc;
  }, {});

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
