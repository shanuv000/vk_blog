import React, { useState } from "react";
import SwipeableViews from "react-swipeable-views";
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
  const [selectedTab, setSelectedTab] = useState(isLiveScore ? 0 : 1);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSwipeChange = (index) => {
    setSelectedTab(index);
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
          style={{ overflowX: "auto" }}
        >
          {isLiveScore && (
            <Tab
              className={`px-4 py-2 m-1 ${
                selectedTab === 0 ? "text-white " : "text-gray-600"
              } rounded-lg transition duration-200`}
              label="Live Match"
              value={0}
            />
          )}
          <Tab
            className={`px-4 py-2 m-1 ${
              selectedTab === 1 ? "text-white " : "text-gray-600"
            } rounded-lg transition duration-200`}
            label="Recent Match"
            value={1}
          />
          <Tab
            className={`px-4 py-2 m-1 ${
              selectedTab === 2 ? "text-white " : "text-gray-600"
            } rounded-lg transition duration-200`}
            label="Upcoming Match"
            value={2}
          />
          <Tab
            className={`px-4 py-2 m-1 ${
              selectedTab === 3 ? "text-white " : "text-gray-600"
            } rounded-lg transition duration-200`}
            label="T20 World Cup Rankings"
            value={3}
          />
        </Tabs>
      </Box>
      <SwipeableViews index={selectedTab} onChangeIndex={handleSwipeChange}>
        {isLiveScore && (
          <TabPanel value={selectedTab} index={0}>
            <LiveMatch />
          </TabPanel>
        )}
        <TabPanel value={selectedTab} index={1}>
          <RecentMatch />
        </TabPanel>
        <TabPanel value={selectedTab} index={2}>
          <UpcomingMatch />
        </TabPanel>
        <TabPanel value={selectedTab} index={3}>
          <MatchTable />
        </TabPanel>
      </SwipeableViews>
    </>
  );
};

export default ShowCricket;
