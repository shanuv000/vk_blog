import React from "react";
import { useData } from "../../store/HandleApiContext";
import MatchList from "./MatchList";
import useMatchData from "../../hooks/useMatchData";

const LiveMatch = () => {
  const { liveScores, liveScoresError, loadingLiveScores, fetchLiveScores } =
    useData();
  const {
    headings,
    selectedHeading,
    setSelectedHeading,
    isRefreshing,
    handleRefreshClick,
  } = useMatchData(fetchLiveScores, liveScores);

  return (
    <MatchList
      title="Live Matches"
      matches={liveScores}
      error={liveScoresError}
      loading={loadingLiveScores}
      onRefresh={handleRefreshClick}
      isRefreshing={isRefreshing}
      headings={headings}
      selectedHeading={selectedHeading}
      setSelectedHeading={setSelectedHeading}
    />
  );
};

export default LiveMatch;
