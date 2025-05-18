import React, { useState, useEffect } from "react";
import MatchTable from "./MatchTable";
import MobileMatchTable from "./MobileMatchTable";
import LiveMatch from "./LiveMatch";
import RecentMatch from "./RecentMatch";
import UpcomingMatch from "./UpcomingMatch";
import { motion, AnimatePresence } from "framer-motion";
import { useData } from "../../store/HandleApiContext";
import { FiActivity } from "react-icons/fi";
import { MdHistory, MdUpcoming } from "react-icons/md";
import { IoStatsChart } from "react-icons/io5";

/**
 * TabPanel component for displaying tab content with animation
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab content
 * @param {string} props.value - Current selected tab value
 * @param {string} props.index - This tab's index value
 * @param {string} props.id - ID for accessibility
 * @param {string} props.ariaLabelledby - ARIA attribute for accessibility
 * @returns {React.ReactElement} - Rendered component
 */
const TabPanel = ({ children, value, index, id, ariaLabelledby, isMobile }) => {
  // Check if this is the table tab
  const isTableTab = index === "table";

  return (
    <AnimatePresence mode="wait">
      {value === index && (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          role="tabpanel"
          id={id}
          aria-labelledby={ariaLabelledby}
          className={`focus:outline-none ${
            isTableTab && isMobile ? "p-0" : ""
          }`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * ShowCricket component displays cricket match information in tabs
 *
 * @returns {React.ReactElement} - Rendered component
 */
const ShowCricket = () => {
  const { isLiveScore } = useData();
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Set initial tab based on whether live matches are available
  const [selectedTab, setSelectedTab] = useState(
    isLiveScore ? "live" : "recent"
  );

  // Tab configuration with icons and labels
  const tabs = [
    ...(isLiveScore
      ? [
          {
            id: "live",
            label: "Live Matches",
            icon: <FiActivity className="w-5 h-5" />,
            ariaId: "tab-live",
            component: <LiveMatch />,
          },
        ]
      : []),
    {
      id: "recent",
      label: "Recent Matches",
      icon: <MdHistory className="w-5 h-5" />,
      ariaId: "tab-recent",
      component: <RecentMatch />,
    },
    {
      id: "upcoming",
      label: "Upcoming Matches",
      icon: <MdUpcoming className="w-5 h-5" />,
      ariaId: "tab-upcoming",
      component: <UpcomingMatch />,
    },
    {
      id: "table",
      label: "Tournament Table",
      icon: <IoStatsChart className="w-5 h-5" />,
      ariaId: "tab-table",
      component: isMobile ? <MobileMatchTable /> : <MatchTable />,
    },
  ];

  return (
    <div className="cricket-widget max-w-5xl mx-auto">
      {/* Modern tab navigation */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap transition-all duration-300 ${
                selectedTab === tab.id
                  ? "bg-gradient-to-r from-urtechy-red to-urtechy-orange text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              id={tab.ariaId}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={selectedTab === tab.id}
              role="tab"
            >
              <span
                className={`transition-transform duration-300 ${
                  selectedTab === tab.id ? "scale-110" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content with modern styling */}
      <div
        className={`bg-white shadow-lg rounded-xl ${
          selectedTab === "table" && isMobile ? "p-0" : "p-5"
        } min-h-[400px]`}
      >
        {tabs.map((tab) => (
          <TabPanel
            key={tab.id}
            value={selectedTab}
            index={tab.id}
            id={`tabpanel-${tab.id}`}
            ariaLabelledby={tab.ariaId}
            isMobile={isMobile}
          >
            {tab.component}
          </TabPanel>
        ))}
      </div>
    </div>
  );
};

export default ShowCricket;
