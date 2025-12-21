import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBaseballBall } from "react-icons/fa";
import { GiCricketBat } from "react-icons/gi";

const Scorecard = ({ scorecard }) => {
  const [activeInning, setActiveInning] = useState(0);

  // Organize innings - use inningsId as primary key to avoid collisions
  const uniqueInnings = useMemo(() => {
    if (!scorecard || !Array.isArray(scorecard)) return [];

    // Use inningsId as the key if available, otherwise use index
    // This ensures T20/ODI matches (which don't have "1st Innings" in header) show both innings
    const inningsMap = new Map();

    scorecard.forEach((inning, index) => {
      // Prefer inningsId, fall back to index-based key
      const key = inning.inningsId !== undefined ? `innings_${inning.inningsId}` : `innings_${index}`;
      inningsMap.set(key, inning);
    });

    return Array.from(inningsMap.values());
  }, [scorecard]);

  if (!uniqueInnings || uniqueInnings.length === 0) {
    return (
      <div className="mt-4 p-4 text-center text-slate-400 bg-white/5 rounded-xl border border-white/10">
        Scorecard not available yet.
      </div>
    );
  }

  return (
    <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
      {/* Innings Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto scrollbar-hide">
        {uniqueInnings.map((inning, index) => (
          <button
            key={index}
            onClick={() => setActiveInning(index)}
            className={`flex-1 min-w-[120px] px-4 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
              activeInning === index
                ? "text-rose-400 bg-rose-500/10"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex flex-col items-center md:items-start">
              <span className="font-bold text-xs md:text-sm">
                {inning.teamName || `Inning ${index + 1}`}
              </span>
              {inning.inningsHeader && (
                <span className="text-[10px] opacity-70 font-normal">
                  {inning.inningsHeader.replace(inning.teamName || "", "").trim()}
                </span>
              )}
            </div>
            {activeInning === index && (
              <motion.div
                layoutId="scorecardTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-amber-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Scorecard Content */}
      <div className="p-2 md:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeInning}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Batting Table */}
            <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
              <div className="bg-white/5 px-4 py-2 flex items-center border-b border-white/10">
                <GiCricketBat className="text-rose-400 mr-2" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  Batting
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 text-xs uppercase">
                      <th className="px-3 py-2 text-left font-semibold">Batter</th>
                      <th className="px-2 py-2 text-right font-semibold">R</th>
                      <th className="px-2 py-2 text-right font-semibold">B</th>
                      <th className="px-2 py-2 text-right font-semibold hidden sm:table-cell">4s</th>
                      <th className="px-2 py-2 text-right font-semibold hidden sm:table-cell">6s</th>
                      <th className="px-2 py-2 text-right font-semibold">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueInnings[activeInning]?.batting?.map((batter, idx) => (
                      <tr
                        key={idx}
                        className={`border-t border-white/5 transition-colors ${
                          batter.isBatting 
                            ? "bg-emerald-500/10" 
                            : idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center">
                            {batter.isBatting && (
                              <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                            <div>
                              <div className={`font-medium ${batter.isBatting ? "text-emerald-400" : "text-white"}`}>
                                {batter.batter}
                                {batter.isBatting && "*"}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[100px] md:max-w-[180px]">
                                {batter.dismissal}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-2 py-2 text-right font-bold ${batter.isBatting ? "text-white" : "text-slate-300"}`}>
                          {batter.runs}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {batter.balls}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400 hidden sm:table-cell">
                          {batter.fours}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400 hidden sm:table-cell">
                          {batter.sixes}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {batter.sr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling Table */}
            <div className="overflow-hidden rounded-xl border border-white/10">
              <div className="bg-white/5 px-4 py-2 flex items-center border-b border-white/10">
                <FaBaseballBall className="text-amber-400 mr-2" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  Bowling
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 text-xs uppercase">
                      <th className="px-3 py-2 text-left font-semibold">Bowler</th>
                      <th className="px-2 py-2 text-right font-semibold">O</th>
                      <th className="px-2 py-2 text-right font-semibold">M</th>
                      <th className="px-2 py-2 text-right font-semibold">R</th>
                      <th className="px-2 py-2 text-right font-semibold">W</th>
                      <th className="px-2 py-2 text-right font-semibold">ECO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueInnings[activeInning]?.bowling?.map((bowler, idx) => (
                      <tr
                        key={idx}
                        className={`border-t border-white/5 transition-colors ${
                          bowler.isBowling 
                            ? "bg-emerald-500/10" 
                            : idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center">
                            {bowler.isBowling && (
                              <span className="relative flex h-2 w-2 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            )}
                            <span className={`font-medium ${bowler.isBowling ? "text-emerald-400" : "text-white"}`}>
                              {bowler.bowler}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {bowler.overs}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {bowler.maidens}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {bowler.runs}
                        </td>
                        <td className="px-2 py-2 text-right font-bold text-rose-400">
                          {bowler.wickets}
                        </td>
                        <td className="px-2 py-2 text-right text-slate-400">
                          {bowler.eco}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Scorecard;
