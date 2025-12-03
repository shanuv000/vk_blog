import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Innings Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {uniqueInnings.map((inning, index) => (
          <button
            key={index}
            onClick={() => setActiveInning(index)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeInning === index
                ? "bg-urtechy-red text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Inning {index + 1}
          </button>
        ))}
      </div>

      {/* Scorecard Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeInning}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Batting Table */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-800 uppercase mb-2 border-l-4 border-urtechy-red pl-2">
                Batting
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 py-2">Batter</th>
                      <th className="px-3 py-2">R</th>
                      <th className="px-3 py-2">B</th>
                      <th className="px-3 py-2">4s</th>
                      <th className="px-3 py-2">6s</th>
                      <th className="px-3 py-2">SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueInnings[activeInning]?.batting?.map((batter, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 font-medium text-gray-800">
                          <div>{batter.batter}</div>
                          <div className="text-xs text-gray-500 font-normal">
                            {batter.dismissal}
                          </div>
                        </td>
                        <td className="px-3 py-2 font-bold">{batter.runs}</td>
                        <td className="px-3 py-2 text-gray-600">
                          {batter.balls}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {batter.fours}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {batter.sixes}
                        </td>
                        <td className="px-3 py-2 text-gray-600">{batter.sr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bowling Table */}
            <div>
              <h4 className="text-sm font-bold text-gray-800 uppercase mb-2 border-l-4 border-urtechy-red pl-2">
                Bowling
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-3 py-2">Bowler</th>
                      <th className="px-3 py-2">O</th>
                      <th className="px-3 py-2">M</th>
                      <th className="px-3 py-2">R</th>
                      <th className="px-3 py-2">W</th>
                      <th className="px-3 py-2">ECO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueInnings[activeInning]?.bowling?.map((bowler, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-3 py-2 font-medium text-gray-800">
                          {bowler.bowler}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {bowler.overs}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {bowler.maidens}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {bowler.runs}
                        </td>
                        <td className="px-3 py-2 font-bold text-urtechy-red">
                          {bowler.wickets}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
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
