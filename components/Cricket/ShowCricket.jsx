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
import { useData } from "../../store/HandleApiContext";


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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          role="tabpanel"
          id={id}
          aria-labelledby={ariaLabelledby}
          className={`focus:outline-none w-full ${
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
    <div className="cricket-widget w-full max-w-5xl mx-auto px-0 md:px-4">
      {/* Mobile-friendly tab navigation */}
      <div className="bg-white shadow-lg md:rounded-xl overflow-hidden mb-4 border-b md:border-0 border-gray-100">
        <div className="grid grid-cols-4 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex flex-col items-center justify-center py-3 md:py-4 px-1 transition-all duration-200 relative ${
                selectedTab === tab.id
                  ? "text-urtechy-red font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              id={tab.ariaId}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={selectedTab === tab.id}
              role="tab"
            >
              <span
                className={`text-lg md:text-xl mb-1 ${
                  selectedTab === tab.id ? "text-urtechy-red" : "text-gray-600"
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] md:text-xs font-medium whitespace-nowrap truncate max-w-full">
                {tab.label}
              </span>
              {selectedTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 md:h-1 bg-urtechy-red" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content with mobile-friendly styling */}
      <div
        className={`bg-white shadow-lg md:rounded-xl ${
          isMobile ? "p-0" : "p-3 md:p-5"
        } min-h-[350px] md:min-h-[400px]`}
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
