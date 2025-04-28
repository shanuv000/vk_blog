import React, { useState } from "react";
import MatchTable from "./MatchTable";
import LiveMatch from "./LiveMatch";
import RecentMatch from "./RecentMatch";
import UpcomingMatch from "./UpcomingMatch";
import { Tabs, Tab, Box, Slide } from "@mui/material";
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
const TabPanel = ({ children, value, index, id, ariaLabelledby }) => (
  <Slide
    direction="left"
    in={value === index}
    mountOnEnter
    unmountOnExit
    timeout={500}
  >
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={ariaLabelledby}
      className="focus:outline-none"
    >
      {children}
    </div>
  </Slide>
);

/**
 * ShowCricket component displays cricket match information in tabs
 *
 * @returns {React.ReactElement} - Rendered component
 */
const ShowCricket = () => {
  const { isLiveScore } = useData();

  // Set initial tab based on whether live matches are available
  const [selectedTab, setSelectedTab] = useState(
    isLiveScore ? "live" : "recent"
  );

  /**
   * Handle tab change
   * @param {Object} _ - Event object (unused)
   * @param {string} newValue - New tab value
   */
  const handleChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  /**
   * Render a tab with consistent styling
   *
   * @param {string} label - Tab label
   * @param {string} value - Tab value
   * @param {string} id - Tab ID for accessibility
   * @returns {React.ReactElement} - Tab component
   */
  const renderTab = (label, value, id) => (
    <Tab
      className={`px-4 py-2 m-1 ${
        selectedTab === value
          ? "text-white font-medium"
          : "text-gray-600 hover:bg-gray-100"
      } rounded-lg transition duration-200`}
      label={label}
      value={value}
      id={id}
      aria-controls={`tabpanel-${value}`}
    />
  );

  return (
    <div className="cricket-widget">
      {/* Tab navigation */}
      <Box
        display="flex"
        justifyContent="center"
        className="bg-gray-50 shadow-md rounded-lg overflow-hidden"
      >
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Cricket match tabs"
          className="w-full py-2 px-4"
        >
          {isLiveScore && renderTab("Live Matches", "live", "tab-live")}
          {renderTab("Recent Matches", "recent", "tab-recent")}
          {renderTab("Upcoming Matches", "upcoming", "tab-upcoming")}
          {renderTab("Tournament Table", "table", "tab-table")}
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box className="w-full mt-4 p-4 bg-white shadow-md rounded-lg">
        {isLiveScore && (
          <TabPanel
            value={selectedTab}
            index="live"
            id="tabpanel-live"
            ariaLabelledby="tab-live"
          >
            <LiveMatch />
          </TabPanel>
        )}
        <TabPanel
          value={selectedTab}
          index="recent"
          id="tabpanel-recent"
          ariaLabelledby="tab-recent"
        >
          <RecentMatch />
        </TabPanel>
        <TabPanel
          value={selectedTab}
          index="upcoming"
          id="tabpanel-upcoming"
          ariaLabelledby="tab-upcoming"
        >
          <UpcomingMatch />
        </TabPanel>
        <TabPanel
          value={selectedTab}
          index="table"
          id="tabpanel-table"
          ariaLabelledby="tab-table"
        >
          <MatchTable />
        </TabPanel>
      </Box>
    </div>
  );
};

export default ShowCricket;
