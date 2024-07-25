import React, { useState } from "react";
import MatchTable from "./MatchTable";
import LiveMatch from "./LiveMatch";
import RecentMatch from "./RecentMatch";
import UpcomingMatch from "./UpcomingMatch";
import { Tabs, Tab, Box, Slide } from "@mui/material";
import { useData } from "../../store/HandleApiContext";
import useSound from "use-sound";
import tabChangeSound from "../../public/cricket/sport.mp3"; // Ensure this path is correct

const TabPanel = ({ children, value, index }) => (
  <Slide
    direction="left"
    in={value === index}
    mountOnEnter
    unmountOnExit
    timeout={500}
  >
    <div>{children}</div>
  </Slide>
);

const ShowCricket = () => {
  const { isLiveScore } = useData();
  const [selectedTab, setSelectedTab] = useState(
    isLiveScore ? "live" : "recent"
  );
  const [play] = useSound(tabChangeSound);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    play(); // Play sound on tab change
  };

  const renderTab = (label, value) => (
    <Tab
      className={`px-4 py-2 m-1 ${
        selectedTab === value ? "text-white" : "text-gray-600"
      } rounded-lg transition duration-200`}
      label={label}
      value={value}
    />
  );

  return (
    <>
      <Box display="flex" justifyContent="center">
        <Tabs
          value={selectedTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="match tabs"
          className="bg-white border-b border-gray-300 w-full py-2 sm:py-1 px-2 sm:px-4 rounded"
          style={{ overflowX: "auto" }}
        >
          {isLiveScore && renderTab("Live Match", "live")}
          {renderTab("Recent Match", "recent")}
          {renderTab("Upcoming Match", "upcoming")}
          {renderTab("T20 World Cup Rankings", "table")}
        </Tabs>
      </Box>
      <Box className="w-full mt-4 p-4">
        {isLiveScore && (
          <TabPanel value={selectedTab} index="live">
            <LiveMatch />
          </TabPanel>
        )}
        <TabPanel value={selectedTab} index="recent">
          <RecentMatch />
        </TabPanel>
        <TabPanel value={selectedTab} index="upcoming">
          <UpcomingMatch />
        </TabPanel>
        <TabPanel value={selectedTab} index="table">
          <MatchTable />
        </TabPanel>
      </Box>
    </>
  );
};

export default ShowCricket;
