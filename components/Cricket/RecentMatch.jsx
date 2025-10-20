import React from "react";
import MatchList from "./MatchList";
import useMatchData from "../../hooks/useMatchData";
import { useData } from "../../store/HandleApiContext";

const RecentMatch = () => {
  const {
    recentScores,
    recentScoresError,
    loadingRecentScores,
    fetchRecentScores,
  } = useData();
  const {
    headings,
    selectedHeading,
    setSelectedHeading,
    isRefreshing,
    handleRefreshClick,
  } = useMatchData(fetchRecentScores, recentScores);

  return (
    <MatchList
      title="Recent Matches"
      matches={recentScores}
      error={recentScoresError}
      loading={loadingRecentScores}
      onRefresh={handleRefreshClick}
      isRefreshing={isRefreshing}
      headings={headings}
      selectedHeading={selectedHeading}
      setSelectedHeading={setSelectedHeading}
    />
  );
};

export default RecentMatch;
