import React, { useState } from "react";
import MatchTable from "../AdditionalPosts/MatchTable";
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
      <div>{value === index && children}</div>
    </Slide>
  );
};

const ShowCricket = () => {
  const { liveScores } = useData();
  const [selectedTab, setSelectedTab] = useState("live");

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="match tabs"
        className="bg-white border-b border-gray-300 w-full py-2 sm:py-1 px-2 sm:px-4 rounded"
      >
        {liveScores.length >= 0 && (
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
            selectedTab === "recent" ? " text-white" : "text-gray-600"
          } rounded-lg transition duration-200`}
          label="Recent Match"
          value="recent"
        />
        <Tab
          className={`px-4 py-2 m-1 ${
            selectedTab === "upcoming" ? " text-white" : "text-gray-600"
          } rounded-lg transition duration-200`}
          label="Upcoming Match"
          value="upcoming"
        />
        <Tab
          className={`px-4 py-2 m-1 ${
            selectedTab === "table" ? "text-white" : "text-gray-600"
          } rounded-lg transition duration-200`}
          label="T20 World Cup Rankings"
          value="table"
        />
      </Tabs>
      <Box className="w-full mt-4 p-4">
        <TabPanel value={selectedTab} index="live">
          <LiveMatch />
        </TabPanel>
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
