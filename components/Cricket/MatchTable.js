import React from "react";
import { useData } from "../../store/HandleApiContext";

const ScheduleTable = () => {
  const { schedule, loadingSchedule } = useData();

  if (loadingSchedule) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-2 md:p-4">
      {schedule.map((group) => (
        <div key={group.groupName} className="mb-8">
          <h2 className="text-lg md:text-2xl font-semibold mb-4 text-primary text-orange-300 text-center">
            {group.groupName}
          </h2>
          <div className="overflow-x-auto rounded">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-left">
                    Team
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Matches
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Wins
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Losses
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Ties
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    No Result
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Points
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Net Run Rate
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Series Form
                  </th>
                  <th className="py-2 px-2 md:px-4 bg-gray-200 text-right">
                    Next Match
                  </th>
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
                    <td className="py-2 px-2 md:px-4 border-b">{team.team}</td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.matches}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.wins}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.losses}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.ties}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.noResult}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.points}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.netRunRate}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.seriesForm}
                    </td>
                    <td className="py-2 px-2 md:px-4 border-b text-right">
                      {team.nextMatch.nextMatches}
                    </td>
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
