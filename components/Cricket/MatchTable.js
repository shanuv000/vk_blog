import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
  FaClock,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  hover: {
    backgroundColor: "rgba(229, 9, 20, 0.05)",
    transition: { duration: 0.2 },
  },
};

const expandVariants = {
  hidden: { opacity: 0, height: 0, overflow: "hidden" },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 },
  },
};

const DesktopPointsTable = () => {
  // State variables
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api-sync.vercel.app/api/cricket/schedule"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error("API returned success: false");
        }
        setTeams(data.data.teams);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Function to parse team name and qualification status
  const getTeamNameAndStatus = (teamString) => {
    const trimmed = teamString.trim();
    if (trimmed.endsWith("(Q)")) {
      return {
        name: trimmed.replace(/\s*\(Q\)$/, "").trim(),
        isQualified: true,
      };
    }
    return { name: trimmed, isQualified: false };
  };

  // Render loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8"
      >
        <div className="inline-block relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-urtechy-red rounded-full animate-spin"></div>
        </div>
        <p className="font-bold text-lg text-gray-700">Loading match data...</p>
      </motion.div>
    );
  }

  // Render error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4 mx-auto max-w-md"
      >
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100">
          <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            Unable to Load Data
          </h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  // Render table
  return (
    <motion.div
      className="w-full rounded-lg shadow-md"
      variants={tableVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse bg-white">
          {/* Table Header */}
          <thead>
            <tr className="bg-urtechy-red text-white">
              <th className="px-4 py-3 text-left font-bold">Team</th>
              <th className="px-4 py-3 text-center font-bold">M</th>
              <th className="px-4 py-3 text-center font-bold">W</th>
              <th className="px-4 py-3 text-center font-bold">L</th>
              <th className="px-4 py-3 text-center font-bold">T</th>
              <th className="px-4 py-3 text-center font-bold">NR</th>
              <th className="px-4 py-3 text-center font-bold">Pts</th>
              <th className="px-4 py-3 text-center font-bold">NRR</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {teams.map((team, index) => {
              const { name, isQualified } = getTeamNameAndStatus(team.team);
              const isEven = index % 2 === 0;

              return (
                <React.Fragment key={index}>
                  {/* Team Row */}
                  <motion.tr
                    variants={rowVariants}
                    whileHover="hover"
                    className={`cursor-pointer border-b ${
                      isEven ? "bg-white" : "bg-gray-50"
                    }`}
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                  >
                    <td className="px-4 py-3 border-r">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full mr-3 flex items-center justify-center overflow-hidden bg-urtechy-red">
                          {team.teamImage ? (
                            <img
                              src={team.teamImage}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-xs">
                              {name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {name}
                          </span>
                          {isQualified && (
                            <span className="text-xs text-green-600 flex items-center">
                              <FaCheck className="mr-1" /> Qualified
                            </span>
                          )}
                        </div>
                        {expandedIndex === index ? (
                          <FaChevronUp className="ml-auto text-gray-400" />
                        ) : (
                          <FaChevronDown className="ml-auto text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center border-r text-gray-700">
                      {team.matches}
                    </td>
                    <td className="px-4 py-3 text-center border-r font-medium text-green-600">
                      {team.wins}
                    </td>
                    <td className="px-4 py-3 text-center border-r font-medium text-red-600">
                      {team.losses}
                    </td>
                    <td className="px-4 py-3 text-center border-r text-gray-700">
                      {team.tied}
                    </td>
                    <td className="px-4 py-3 text-center border-r text-gray-700">
                      {team.noResult}
                    </td>
                    <td className="px-4 py-3 text-center border-r font-bold text-urtechy-red">
                      {team.points}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-medium ${
                        parseFloat(team.netRunRate) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {team.netRunRate}
                    </td>
                  </motion.tr>

                  {/* Expanded Match Details */}
                  <AnimatePresence>
                    {expandedIndex === index && (
                      <motion.tr
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <td colSpan={8} className="px-0 py-0 border-b">
                          <div className="bg-gray-50 p-5 border-t-2 border-urtechy-red">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">
                              Match History
                            </h3>
                            <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
                              {team.matchesPlayed.map((match, idx) => {
                                // Determine result type and styling
                                let resultIcon, resultClass, resultBg;
                                if (match.result.startsWith("Won")) {
                                  resultIcon = (
                                    <FaCheckCircle className="text-green-500 mr-2" />
                                  );
                                  resultClass = "text-green-700";
                                  resultBg = "bg-green-50";
                                } else if (match.result.startsWith("Loss")) {
                                  resultIcon = (
                                    <FaTimesCircle className="text-red-500 mr-2" />
                                  );
                                  resultClass = "text-red-700";
                                  resultBg = "bg-red-50";
                                } else if (match.result.includes("tied")) {
                                  resultIcon = (
                                    <FaMinusCircle className="text-yellow-500 mr-2" />
                                  );
                                  resultClass = "text-yellow-700";
                                  resultBg = "bg-yellow-50";
                                } else {
                                  resultIcon = (
                                    <FaClock className="text-gray-500 mr-2" />
                                  );
                                  resultClass = "text-gray-700";
                                  resultBg = "bg-gray-100";
                                }

                                return (
                                  <motion.div
                                    key={idx}
                                    className={`p-3 rounded-lg ${resultBg} border border-gray-100`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="flex items-center mr-2">
                                        {resultIcon}
                                        <span
                                          className={`font-medium ${resultClass}`}
                                        >
                                          {match.result || "Upcoming"}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                        {match.date}
                                      </span>
                                    </div>
                                    <div className="mt-2 text-gray-700">
                                      <span className="font-medium">
                                        {match.description}
                                      </span>{" "}
                                      vs{" "}
                                      <span className="font-medium">
                                        {match.opponent}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default DesktopPointsTable;
