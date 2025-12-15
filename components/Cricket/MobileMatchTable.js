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
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api-sync.vercel.app/api/cricket/schedule"
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

  const getPositionBadge = (position) => {
    if (position === 1) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <FaTrophy className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (position === 2) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30">
          <FaMedal className="w-4 h-4 text-white" />
        </div>
      );
    }
    if (position === 3) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
          <FaMedal className="w-4 h-4 text-white" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
        <span className="text-sm font-bold text-slate-400">{position}</span>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-rose-500 border-r-amber-500 border-b-rose-500 border-l-amber-500 rounded-full animate-spin" />
        </div>
        <p className="font-bold text-lg text-white">Loading standings...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
          <FaTimesCircle className="text-red-400 text-4xl mx-auto mb-4" />
          <h3 className="font-bold text-lg text-white mb-2">
            Unable to Load Data
          </h3>
          <p className="text-slate-400 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-xl font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 md:p-4">
      <div className="space-y-3">
        {teams.map((team, index) => {
          const { name, isQualified } = getTeamNameAndStatus(team.team);
          const position = index + 1;
          
          return (
            <motion.div
              key={index}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
            >
              {/* Team Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-center gap-3">
                  {/* Position Badge */}
                  {getPositionBadge(position)}
                  
                  {/* Team Icon */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-rose-500 to-amber-500 ring-2 ring-white/10">
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
                  
                  {/* Team Name */}
                  <div>
                    <div className="font-bold text-white">{name}</div>
                    {isQualified && (
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <FaCheck className="w-3 h-3" />
                        <span>Qualified</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Points & Chevron */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-rose-400">{team.points}</div>
                    <div className="text-xs text-slate-400">pts</div>
                  </div>
                  {expandedIndex === index ? (
                    <FaChevronUp className="text-slate-400" />
                  ) : (
                    <FaChevronDown className="text-slate-400" />
                  )}
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="px-4 pb-4 grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white">{team.matches}</div>
                  <div className="text-xs text-slate-400">Played</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                  <div className="text-lg font-bold text-emerald-400">{team.wins}</div>
                  <div className="text-xs text-emerald-400/70">Won</div>
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                  <div className="text-lg font-bold text-red-400">{team.losses}</div>
                  <div className="text-xs text-red-400/70">Lost</div>
                </div>
              </div>
              
              {/* NRR Display */}
              <div className="px-4 pb-4">
                <div className={`flex justify-between items-center px-4 py-2 rounded-xl ${
                  parseFloat(team.netRunRate) >= 0 
                    ? "bg-emerald-500/10 border border-emerald-500/20" 
                    : "bg-red-500/10 border border-red-500/20"
                }`}>
                  <span className="text-sm text-slate-400">Net Run Rate</span>
                  <span className={`font-bold ${
                    parseFloat(team.netRunRate) >= 0 
                      ? "text-emerald-400" 
                      : "text-red-400"
                  }`}>
                    {parseFloat(team.netRunRate) >= 0 ? "+" : ""}{team.netRunRate}
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
                    className="border-t border-white/10"
                  >
                    <div className="p-4 bg-white/[0.02]">
                      <h3 className="text-sm font-bold mb-3 text-white flex items-center gap-2">
                        <FaClock className="text-amber-400" />
                        Match History
                      </h3>
                      <div className="space-y-2">
                        {team.matchesPlayed.map((match, idx) => {
                          let resultIcon, resultClass, resultBg;
                          if (match.result.startsWith("Won")) {
                            resultIcon = <FaCheckCircle className="text-emerald-400 mr-2 shrink-0" />;
                            resultClass = "text-emerald-400";
                            resultBg = "bg-emerald-500/10 border-emerald-500/20";
                          } else if (match.result.startsWith("Loss")) {
                            resultIcon = <FaTimesCircle className="text-red-400 mr-2 shrink-0" />;
                            resultClass = "text-red-400";
                            resultBg = "bg-red-500/10 border-red-500/20";
                          } else if (match.result.includes("tied")) {
                            resultIcon = <FaMinusCircle className="text-amber-400 mr-2 shrink-0" />;
                            resultClass = "text-amber-400";
                            resultBg = "bg-amber-500/10 border-amber-500/20";
                          } else {
                            resultIcon = <FaClock className="text-slate-400 mr-2 shrink-0" />;
                            resultClass = "text-slate-400";
                            resultBg = "bg-white/5 border-white/10";
                          }

                          return (
                            <motion.div
                              key={idx}
                              className={`p-3 rounded-xl ${resultBg} border`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <div className="flex items-center mb-1">
                                {resultIcon}
                                <span className={`font-medium text-sm ${resultClass}`}>
                                  {match.result || "Upcoming"}
                                </span>
                                <span className="ml-auto text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">
                                  {match.date}
                                </span>
                              </div>
                              <div className="text-sm text-slate-300 pl-6">
                                <span className="font-medium">{match.description}</span>
                                {" vs "}
                                <span className="font-medium">{match.opponent}</span>
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
    </div>
  );
};

export default MobileMatchTable;
