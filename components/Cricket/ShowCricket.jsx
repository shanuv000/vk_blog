import React, { useState } from "react";
import MatchTable from "./MatchTable";
import LiveMatch from "./LiveMatch";
import RecentMatch from "./RecentMatch";
import UpcomingMatch from "./UpcomingMatch";
import { Tabs, Tab, Box, Slide } from "@mui/material";
import { useData } from "../../store/HandleApiContext";

const TabPanel = ({ children, value, index }) => {
  return (
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
};

const ShowCricket = () => {
  const { isLiveScore } = useData();

  const [selectedTab, setSelectedTab] = useState(
    isLiveScore ? "live" : "recent"
  );

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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
          style={{ overflowX: "auto" }} // Ensure overflow is handled
        >
          {isLiveScore && (
            <Tab
              className={`px-4 py-2 m-1 ${
                selectedTab === "live" ? "text-white" : "text-gray-600"
              } rounded-lg transition duration-200`}
              label="Live Match"
              value="live"
            />
          )}
          <Tab
            className={`px-4 py-2 m-1 ${
              selectedTab === "recent" ? "text-white " : "text-gray-600"
            } rounded-lg transition duration-200`}
            label="Recent Match"
            value="recent"
          />
          <Tab
            className={`px-4 py-2 m-1 ${
              selectedTab === "upcoming" ? "text-white " : "text-gray-600"
            } rounded-lg transition duration-200`}
            label="Upcoming Match"
            value="upcoming"
          />
          <Tab
            className={`px-4 py-2 m-1 ${
              selectedTab === "table" ? "text-white " : "text-gray-600"
            } rounded-lg transition duration-200`}
            label="T20 World Cup Rankings"
            value="table"
          />
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
