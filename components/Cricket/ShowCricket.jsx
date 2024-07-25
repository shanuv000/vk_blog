import React, { useState } from "react";
import MatchTable from "./MatchTable";
import LiveMatch from "./LiveMatch";
import RecentMatch from "./RecentMatch";
import UpcomingMatch from "./UpcomingMatch";
import { Tabs, Tab, Box, Slide } from "@mui/material";
import { useData } from "../../store/HandleApiContext";

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

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderTab = (label, value) => (
    <Tab
      className={`px-4 py-2 m-1 ${
        selectedTab === value
          ? "text-white "
          : "text-gray-600 hover:bg-gray-100"
      } rounded-lg transition duration-200`}
      label={label}
      value={value}
    />
  );

  return (
    <>
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
          aria-label="match tabs"
          className="w-full py-2 px-4"
        >
          {isLiveScore && renderTab("Live Match", "live")}
          {renderTab("Recent Match", "recent")}
          {renderTab("Upcoming Match", "upcoming")}
          {renderTab("T20 World Cup Rankings", "table")}
        </Tabs>
      </Box>
      <Box className="w-full mt-4 p-4 bg-white shadow-md rounded-lg">
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
