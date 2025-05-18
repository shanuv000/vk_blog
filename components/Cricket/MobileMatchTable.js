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
const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
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

const MobileMatchTable = () => {
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
      <div className="text-center py-8 bg-white">
        <div className="inline-block relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-urtechy-red rounded-full animate-spin"></div>
        </div>
        <p className="font-bold text-lg text-gray-700">Loading match data...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-8 px-4 bg-white">
        <div className="bg-red-50 p-6 shadow-sm border border-red-100">
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
      </div>
    );
  }

  // Render mobile table
  return (
    <div className="w-full bg-white">
      {teams.map((team, index) => {
        const { name, isQualified } = getTeamNameAndStatus(team.team);
        const isEven = index % 2 === 0;
        
        return (
          <motion.div
            key={index}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            className={`mb-2 border-b overflow-hidden ${
              isEven ? "bg-white" : "bg-gray-50"
            }`}
          >
            {/* Team Header */}
            <div
              className="flex items-center justify-between p-4 border-b bg-white cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full mr-3 flex items-center justify-center overflow-hidden bg-urtechy-red">
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
                <div>
                  <div className="font-bold text-gray-800">{name}</div>
                  {isQualified && (
                    <div className="text-xs text-green-600 flex items-center">
                      <FaCheck className="mr-1" /> Qualified
                    </div>
                  )}
                </div>
              </div>
              {expandedIndex === index ? (
                <FaChevronUp className="text-gray-400" />
              ) : (
                <FaChevronDown className="text-gray-400" />
              )}
            </div>
            
            {/* Team Stats */}
            <div className="p-4 grid grid-cols-2 gap-3 bg-white">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Matches:</span>
                <span className="font-medium text-gray-800">
                  {team.matches}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Points:</span>
                <span className="font-bold text-urtechy-red">
                  {team.points}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Wins:</span>
                <span className="font-medium text-green-600">
                  {team.wins}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Losses:</span>
                <span className="font-medium text-red-600">
                  {team.losses}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">Tied:</span>
                <span className="text-gray-700">{team.tied}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-600">No Result:</span>
                <span className="text-gray-700">{team.noResult}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-gray-600">Net Run Rate:</span>
                <span
                  className={`font-medium ${
                    parseFloat(team.netRunRate) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {team.netRunRate}
                </span>
              </div>
            </div>
            
            {/* Expanded Match Details */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  variants={expandVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="border-t-2 border-urtechy-red"
                >
                  <div className="p-4 bg-gray-50">
                    <h3 className="text-lg font-bold mb-3 text-gray-800">
                      Match History
                    </h3>
                    <div className="space-y-3">
                      {team.matchesPlayed.map((match, idx) => {
                        // Determine result type and styling
                        let resultIcon, resultClass, resultBg;
                        if (match.result.startsWith("Won")) {
                          resultIcon = <FaCheckCircle className="text-green-500 mr-2" />;
                          resultClass = "text-green-700";
                          resultBg = "bg-green-50";
                        } else if (match.result.startsWith("Loss")) {
                          resultIcon = <FaTimesCircle className="text-red-500 mr-2" />;
                          resultClass = "text-red-700";
                          resultBg = "bg-red-50";
                        } else if (match.result.includes("tied")) {
                          resultIcon = <FaMinusCircle className="text-yellow-500 mr-2" />;
                          resultClass = "text-yellow-700";
                          resultBg = "bg-yellow-50";
                        } else {
                          resultIcon = <FaClock className="text-gray-500 mr-2" />;
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
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <div className="flex items-center mr-2">
                                {resultIcon}
                                <span className={`font-medium ${resultClass}`}>
                                  {match.result || "Upcoming"}
                                </span>
                              </div>
                              <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
                                {match.date}
                              </span>
                            </div>
                            <div className="text-gray-700">
                              <span className="font-medium">{match.description}</span>{" "}
                              vs <span className="font-medium">{match.opponent}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default MobileMatchTable;
