import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBaseballBall } from "react-icons/fa";
import { GiCricketBat } from "react-icons/gi";

const Scorecard = ({ scorecard }) => {
  const [activeInning, setActiveInning] = useState(0);

  // Deduplicate innings based on content
  const uniqueInnings = useMemo(() => {
    if (!scorecard || !Array.isArray(scorecard)) return [];
    
    const seen = new Set();
    return scorecard.filter((inning) => {
      const content = JSON.stringify(inning);
      if (seen.has(content)) return false;
      seen.add(content);
      return true;
    });
  }, [scorecard]);

  if (!uniqueInnings || uniqueInnings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        Scorecard not available yet.
      </div>
    );
  }

  return (
    <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Innings Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {uniqueInnings.map((inning, index) => (
          <button
            key={index}
            onClick={() => setActiveInning(index)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
              activeInning === index
                ? "text-urtechy-red bg-red-50"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold">
                {inning.teamName || `Inning ${index + 1}`}
              </span>
              {inning.inningsHeader && (
                <span className="text-xs opacity-80 font-normal">
                  {inning.inningsHeader.replace(inning.teamName || "", "").trim()}
                </span>
              )}
            </div>
            {activeInning === index && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-urtechy-red"
              />
            )}
          </button>
        ))}
      </div>

      {/* Scorecard Content */}
      <div className="p-0 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeInning}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Batting Table */}
            <div className="mb-6 overflow-hidden sm:rounded-lg border-b sm:border border-gray-100">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center">
                <GiCricketBat className="text-gray-500 mr-2" />
                <h4 className="text-sm font-bold text-gray-800 uppercase">
                  Batting
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Batter</th>
                      <th className="px-3 py-2 font-semibold text-right">R</th>
                      <th className="px-3 py-2 font-semibold text-right">B</th>
                      <th className="px-3 py-2 font-semibold text-right hidden sm:table-cell">4s</th>
                      <th className="px-3 py-2 font-semibold text-right hidden sm:table-cell">6s</th>
                      <th className="px-3 py-2 font-semibold text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {uniqueInnings[activeInning]?.batting?.map((batter, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          batter.isBatting 
                            ? "bg-red-50/30 hover:bg-red-50/50" 
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center">
                            {batter.isBatting && (
                              <span className="w-1.5 h-1.5 rounded-full bg-urtechy-red mr-2 animate-pulse" />
                            )}
                            <div>
                              <div className={`font-medium ${batter.isBatting ? "text-urtechy-red" : "text-gray-800"}`}>
                                {batter.batter}
                                {batter.isBatting && "*"}
                              </div>
                              <div className="text-xs text-gray-500 font-normal truncate max-w-[120px] sm:max-w-xs">
                                {batter.dismissal}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={`px-3 py-2 text-right font-bold ${batter.isBatting ? "text-gray-900" : "text-gray-700"}`}>
                          {batter.runs}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {batter.balls}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600 hidden sm:table-cell">
                          {batter.fours}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600 hidden sm:table-cell">
                          {batter.sixes}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {batter.sr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling Table */}
            <div className="overflow-hidden sm:rounded-lg border-b sm:border border-gray-100">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center">
                <FaBaseballBall className="text-gray-500 mr-2" />
                <h4 className="text-sm font-bold text-gray-800 uppercase">
                  Bowling
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Bowler</th>
                      <th className="px-3 py-2 font-semibold text-right">O</th>
                      <th className="px-3 py-2 font-semibold text-right">M</th>
                      <th className="px-3 py-2 font-semibold text-right">R</th>
                      <th className="px-3 py-2 font-semibold text-right">W</th>
                      <th className="px-3 py-2 font-semibold text-right">ECO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {uniqueInnings[activeInning]?.bowling?.map((bowler, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          bowler.isBowling 
                            ? "bg-red-50/30 hover:bg-red-50/50" 
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <div className="flex items-center">
                            {bowler.isBowling && (
                              <span className="w-1.5 h-1.5 rounded-full bg-urtechy-red mr-2 animate-pulse" />
                            )}
                            <span className={`font-medium ${bowler.isBowling ? "text-urtechy-red" : "text-gray-800"}`}>
                              {bowler.bowler}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {bowler.overs}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {bowler.maidens}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
                          {bowler.runs}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-urtechy-red">
                          {bowler.wickets}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">
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
