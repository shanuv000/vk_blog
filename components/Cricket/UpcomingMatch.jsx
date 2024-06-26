import React from "react";
import { useData } from "../../store/HandleApiContext";
import MatchList from "./MatchList";
import useMatchData from "../../hooks/useMatchData";

const UpcomingMatch = () => {
  const {
    upcomingMatches,
    upcomingMatchesError,
    loadingUpcomingMatches,
    fetchUpcomingMatches,
  } = useData();
  const {
    headings,
    selectedHeading,
    setSelectedHeading,
    isRefreshing,
    handleRefreshClick,
  } = useMatchData(fetchUpcomingMatches, upcomingMatches);

  return (
    <MatchList
      title="Upcoming Matches"
      matches={upcomingMatches}
      error={upcomingMatchesError}
      loading={loadingUpcomingMatches}
      onRefresh={handleRefreshClick}
      isRefreshing={isRefreshing}
      headings={headings}
      selectedHeading={selectedHeading}
      setSelectedHeading={setSelectedHeading}
    />
  );
};

export default UpcomingMatch;
