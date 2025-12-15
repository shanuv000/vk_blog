import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiActivity } from "react-icons/fi";
import { IoStatsChart } from "react-icons/io5";
import { MdHistory, MdUpcoming } from "react-icons/md";
import LiveMatch from "./LiveMatch";
import MatchTable from "./MatchTable";
import MobileMatchTable from "./MobileMatchTable";
import RecentMatch from "./RecentMatch";
import UpcomingMatch from "./UpcomingMatch";

/**
 * TabPanel component for displaying tab content with animation
 */
const TabPanel = ({ children, value, index, id, ariaLabelledby }) => {
  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="tabpanel"
          id={id}
          aria-labelledby={ariaLabelledby}
          className="focus:outline-none w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * ShowCricket component - Premium mobile-first design
 */
const ShowCricket = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTab, setSelectedTab] = useState("live");

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Tab configuration with icons - Live tab always visible
  const tabs = [
    {
      id: "live",
      label: "Live",
      fullLabel: "Live Matches",
      icon: <FiActivity className="w-5 h-5" />,
      ariaId: "tab-live",
      component: <LiveMatch />,
      color: "emerald",
    },
    {
      id: "recent",
      label: "Recent",
      fullLabel: "Recent Matches",
      icon: <MdHistory className="w-5 h-5" />,
      ariaId: "tab-recent",
      component: <RecentMatch />,
      color: "rose",
    },
    {
      id: "upcoming",
      label: "Upcoming",
      fullLabel: "Upcoming",
      icon: <MdUpcoming className="w-5 h-5" />,
      ariaId: "tab-upcoming",
      component: <UpcomingMatch />,
      color: "amber",
    },
    {
      id: "table",
      label: "Standings",
      fullLabel: "Standings",
      icon: <IoStatsChart className="w-5 h-5" />,
      ariaId: "tab-table",
      component: isMobile ? <MobileMatchTable /> : <MatchTable />,
      color: "cyan",
    },
  ];

  const getTabColorClass = (color, isActive) => {
    const colors = {
      emerald: isActive ? "text-emerald-400 bg-emerald-500/20 border-emerald-500/30" : "text-slate-400 hover:text-emerald-400",
      rose: isActive ? "text-rose-400 bg-rose-500/20 border-rose-500/30" : "text-slate-400 hover:text-rose-400",
      amber: isActive ? "text-amber-400 bg-amber-500/20 border-amber-500/30" : "text-slate-400 hover:text-amber-400",
      cyan: isActive ? "text-cyan-400 bg-cyan-500/20 border-cyan-500/30" : "text-slate-400 hover:text-cyan-400",
    };
    return colors[color] || colors.rose;
  };

  return (
    <div className="cricket-widget w-full max-w-5xl mx-auto px-0 md:px-4">
      {/* Premium Glassmorphism Tab Navigation */}
      <div className="relative mb-4">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50" />
        
        {/* Tab Bar */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 md:p-3">
          <div className="flex gap-2 w-full">
            {tabs.map((tab) => {
              const isActive = selectedTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-3 px-2 md:px-4 rounded-xl transition-all duration-300 relative border ${
                    isActive 
                      ? getTabColorClass(tab.color, true) + " border-current"
                      : "border-transparent " + getTabColorClass(tab.color, false)
                  }`}
                  id={tab.ariaId}
                  aria-controls={`tabpanel-${tab.id}`}
                  aria-selected={isActive}
                  role="tab"
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Live Pulse */}
                  {tab.id === "live" && isActive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  
                  <span className="text-lg md:text-base">
                    {tab.icon}
                  </span>
                  <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">
                    {isMobile ? tab.label : tab.fullLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative">
        {/* Content Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl blur-xl opacity-30" />
        
        {/* Content Container */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-0 md:p-4 min-h-[400px] overflow-hidden">
          {tabs.map((tab) => (
            <TabPanel
              key={tab.id}
              value={selectedTab}
              index={tab.id}
              id={`tabpanel-${tab.id}`}
              ariaLabelledby={tab.ariaId}
            >
              {tab.component}
            </TabPanel>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowCricket;
