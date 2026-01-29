import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMinusCircle,
  FaClock,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaTrophy,
  FaMedal,
} from "react-icons/fa";

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 15 },
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

const DesktopPointsTable = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/cricket-proxy?endpoint=schedule"
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        if (!data.success) throw new Error("API returned success: false");
        setTeams(data.data.teams);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const getPositionStyle = (position) => {
    if (position === 1) return "from-yellow-400 to-amber-500 shadow-amber-500/30";
    if (position === 2) return "from-slate-300 to-slate-400 shadow-slate-400/30";
    if (position === 3) return "from-amber-600 to-amber-700 shadow-amber-600/30";
    return "from-slate-600 to-slate-700";
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="inline-block relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-rose-500 border-r-amber-500 border-b-rose-500 border-l-amber-500 rounded-full animate-spin" />
        </div>
        <p className="font-bold text-lg text-white">Loading standings...</p>
      </motion.div>
    );
  }

  // Error state or Maintenance state
  if (error || teams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4 max-w-md mx-auto"
      >
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaTrophy className="text-amber-400/80 text-3xl" />
          </div>
          <h3 className="font-bold text-xl text-white mb-3">
            Points Table Updating
          </h3>
          <p className="text-slate-400 mb-6 leading-relaxed">
            The tournament standings are currently being updated. Please check back later for the latest team positions and statistics.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-slate-400 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            System maintenance
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full rounded-2xl overflow-hidden"
      variants={tableVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          {/* Table Header */}
          <thead>
            <tr className="bg-gradient-to-r from-rose-500/20 to-amber-500/20 border-b border-white/10">
              <th className="px-4 py-4 text-left font-bold text-white">#</th>
              <th className="px-4 py-4 text-left font-bold text-white">Team</th>
              <th className="px-4 py-4 text-center font-bold text-slate-300">M</th>
              <th className="px-4 py-4 text-center font-bold text-emerald-400">W</th>
              <th className="px-4 py-4 text-center font-bold text-red-400">L</th>
              <th className="px-4 py-4 text-center font-bold text-slate-300">T</th>
              <th className="px-4 py-4 text-center font-bold text-slate-300">NR</th>
              <th className="px-4 py-4 text-center font-bold text-rose-400">Pts</th>
              <th className="px-4 py-4 text-center font-bold text-slate-300">NRR</th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody>
            {teams.map((team, index) => {
              const { name, isQualified } = getTeamNameAndStatus(team.team);
              const position = index + 1;

              return (
                <React.Fragment key={index}>
                  <motion.tr
                    variants={rowVariants}
                    className={`cursor-pointer border-b border-white/5 transition-all duration-200 hover:bg-white/5 ${index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                      }`}
                    onClick={() =>
                      setExpandedIndex(expandedIndex === index ? null : index)
                    }
                  >
                    {/* Position */}
                    <td className="px-4 py-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getPositionStyle(position)} flex items-center justify-center shadow-lg`}>
                        {position <= 3 ? (
                          position === 1 ? (
                            <FaTrophy className="w-4 h-4 text-white" />
                          ) : (
                            <FaMedal className="w-4 h-4 text-white" />
                          )
                        ) : (
                          <span className="text-sm font-bold text-white">{position}</span>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full mr-3 overflow-hidden bg-gradient-to-br from-rose-500 to-amber-500 ring-2 ring-white/10">
                          {team.teamImage ? (
                            <img
                              src={team.teamImage}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">
                            {name}
                          </span>
                          {isQualified && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1">
                              <FaCheck className="w-3 h-3" /> Qualified
                            </span>
                          )}
                        </div>
                        {expandedIndex === index ? (
                          <FaChevronUp className="ml-auto text-slate-400" />
                        ) : (
                          <FaChevronDown className="ml-auto text-slate-400" />
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center text-slate-300">
                      {team.matches}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-emerald-400">
                      {team.wins}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-red-400">
                      {team.losses}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-400">
                      {team.tied}
                    </td>
                    <td className="px-4 py-4 text-center text-slate-400">
                      {team.noResult}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-rose-400 text-lg">
                      {team.points}
                    </td>
                    <td
                      className={`px-4 py-4 text-center font-medium ${parseFloat(team.netRunRate) >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                        }`}
                    >
                      {parseFloat(team.netRunRate) >= 0 ? "+" : ""}
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
                        <td colSpan={9} className="px-0 py-0">
                          <div className="bg-white/[0.02] p-6 border-t-2 border-rose-500/50">
                            <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                              <FaClock className="text-amber-400" />
                              Match History
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                              {team.matchesPlayed.map((match, idx) => {
                                let resultIcon, resultClass, resultBg;
                                if (match.result.startsWith("Won")) {
                                  resultIcon = (
                                    <FaCheckCircle className="text-emerald-400 mr-2 shrink-0" />
                                  );
                                  resultClass = "text-emerald-400";
                                  resultBg = "bg-emerald-500/10 border-emerald-500/20";
                                } else if (match.result.startsWith("Loss")) {
                                  resultIcon = (
                                    <FaTimesCircle className="text-red-400 mr-2 shrink-0" />
                                  );
                                  resultClass = "text-red-400";
                                  resultBg = "bg-red-500/10 border-red-500/20";
                                } else if (match.result.includes("tied")) {
                                  resultIcon = (
                                    <FaMinusCircle className="text-amber-400 mr-2 shrink-0" />
                                  );
                                  resultClass = "text-amber-400";
                                  resultBg = "bg-amber-500/10 border-amber-500/20";
                                } else {
                                  resultIcon = (
                                    <FaClock className="text-slate-400 mr-2 shrink-0" />
                                  );
                                  resultClass = "text-slate-400";
                                  resultBg = "bg-white/5 border-white/10";
                                }

                                return (
                                  <motion.div
                                    key={idx}
                                    className={`p-4 rounded-xl ${resultBg} border`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                  >
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                      <div className="flex items-center">
                                        {resultIcon}
                                        <span
                                          className={`font-medium ${resultClass}`}
                                        >
                                          {match.result || "Upcoming"}
                                        </span>
                                      </div>
                                      <span className="text-sm text-slate-500 bg-white/5 px-2 py-1 rounded">
                                        {match.date}
                                      </span>
                                    </div>
                                    <div className="text-slate-300">
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
